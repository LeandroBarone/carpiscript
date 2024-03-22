import { Lexema } from '../componentes/Lexema'
import { ErrorLexico } from '../componentes/errores'
import { Codigo } from '../componentes/Codigo'
import { type Sentencia } from '../componentes/Sentencia'

const PALABRAS_CLAVE: string[] = ['imprimir', 'ingresar', 'ingresarNumero', 'entero', 'flotante', 'si', 'sino']

export class AnalizadorLexico {
  debug: boolean
  codigo: Codigo = new Codigo('')
  linea: string = ''
  caracter: string | null = null
  caracterSiguiente: string | null = null
  nLinea: number = 0
  nColumna: number = 0

  constructor (debug: boolean = false) {
    this.debug = debug
  }

  procesar (texto: string): Sentencia[] {
    if (texto.length === 0) {
      throw new Error('El código no puede estar vacío')
    }

    this.codigo = new Codigo(texto)

    const lineas = this.codigo.texto.split('\n')

    const sentencias = lineas.map((linea, i) => {
      this.linea = linea
      this.nLinea = i
      this.nColumna = -1
      this.avanzar()
      return this.analizarLinea()
    })

    return sentencias
  }

  private analizarLinea (): Sentencia {
    const sentencia: Sentencia = []

    while (!this.fin()) {
      if (this.esEspacio(this.caracter)) {
        // No hacer nada
      } else if (this.esComienzoCadena(this.caracter)) {
        sentencia.push(this.procesarCadena())
        continue
      } else if (this.esDigito(this.caracter)) {
        sentencia.push(this.procesarNumero())
        continue
      } else if (this.esAlfabetico(this.caracter)) {
        sentencia.push(this.procesarIdentificador())
        continue
      } else if (this.caracter === '{') {
        sentencia.push(this.crearLexema('INICIO_BLOQUE'))
      } else if (this.caracter === '}') {
        sentencia.push(this.crearLexema('FIN_BLOQUE'))
      } else if (this.caracter === '#') {
        sentencia.push(this.procesarComentario())
        continue
      } else if (this.caracter === '=') {
        if (this.caracterSiguiente === '=') {
          sentencia.push(this.crearLexema('IGUAL_QUE'))
          this.avanzar()
        } else {
          sentencia.push(this.crearLexema('ASIGNACION'))
        }
      } else if (this.caracter === '>') {
        if (this.caracterSiguiente === '=') {
          sentencia.push(this.crearLexema('MAYOR_IGUAL_QUE'))
          this.avanzar()
        } else {
          sentencia.push(this.crearLexema('MAYOR_QUE'))
        }
      } else if (this.caracter === '<') {
        if (this.caracterSiguiente === '=') {
          sentencia.push(this.crearLexema('MENOR_IGUAL_QUE'))
          this.avanzar()
        } else {
          sentencia.push(this.crearLexema('MENOR_QUE'))
        }
      } else if (this.caracter === '(') {
        sentencia.push(this.crearLexema('PARENTESIS_IZQ'))
      } else if (this.caracter === ')') {
        sentencia.push(this.crearLexema('PARENTESIS_DER'))
      } else if (this.caracter === '%') {
        sentencia.push(this.crearLexema('MODULO'))
      } else if (this.caracter === '+') {
        sentencia.push(this.crearLexema('SUMA'))
      } else if (this.caracter === '-') {
        sentencia.push(this.crearLexema('RESTA'))
      } else if (this.caracter === '*') {
        if (this.caracterSiguiente === '*') {
          sentencia.push(this.crearLexema('EXPONENTE'))
          this.avanzar()
        } else {
          sentencia.push(this.crearLexema('MULTIPLICACION'))
        }
      } else if (this.caracter === '/') {
        if (this.caracterSiguiente === '/') {
          sentencia.push(this.crearLexema('DIVISION_ENTERA'))
          this.avanzar()
        } else {
          sentencia.push(this.crearLexema('DIVISION'))
        }
      } else {
        throw this.generarError(ErrorLexico, 'Caracter inválido: ' + this.caracter)
      }

      this.avanzar()
    }

    return sentencia
  }

  private avanzar (): void {
    this.nColumna++
    this.caracter = this.nColumna < this.linea.length ? this.linea[this.nColumna] : null
    this.caracterSiguiente = this.nColumna + 1 < this.linea.length ? this.linea[this.nColumna + 1] : null
  }

  private procesarCadena (): Lexema {
    let cadena = ''
    const nLineaInicial = this.nLinea
    const nColumnaInicial = this.nColumna

    const comienzo = this.caracter
    this.avanzar()

    while (!this.fin() && this.caracter !== comienzo) {
      cadena += this.caracter
      this.avanzar()
    }

    if (this.fin()) {
      throw this.generarError(ErrorLexico, 'Cadena sin terminar')
    }

    this.avanzar()

    return this.crearLexema('CADENA', cadena, nLineaInicial, nColumnaInicial)
  }

  private procesarNumero (): Lexema {
    let num = ''
    let nPuntos = 0
    const nLineaInicial = this.nLinea
    const nColumnaInicial = this.nColumna

    while (!this.fin() && (this.esDigito(this.caracter) || this.caracter === '.' || this.caracter === '_')) {
      if (this.caracter === '_') {
        this.avanzar()
        continue
      }
      if (this.caracter === '.') {
        if (nPuntos > 0) {
          throw this.generarError(ErrorLexico, 'Número con múltiples puntos decimales')
        }
        nPuntos++
      }

      num += this.caracter
      this.avanzar()
    }

    if (nPuntos > 0) {
      return this.crearLexema('NUMERO', parseFloat(num), nLineaInicial, nColumnaInicial)
    } else {
      return this.crearLexema('NUMERO', parseInt(num), nLineaInicial, nColumnaInicial)
    }
  }

  private procesarIdentificador (): Lexema {
    let id = ''
    const nLineaInicial = this.nLinea
    const nColumnaInicial = this.nColumna

    while (!this.fin() && (this.esAlfabetico(this.caracter) || this.esDigito(this.caracter))) {
      id += this.caracter
      this.avanzar()
    }

    if (PALABRAS_CLAVE.includes(id)) {
      return this.crearLexema(id.toUpperCase(), null, nLineaInicial, nColumnaInicial)
    } else {
      return this.crearLexema('IDENTIFICADOR', id, nLineaInicial, nColumnaInicial)
    }
  }

  private procesarComentario (): Lexema {
    let comentario = ''
    const nLineaInicial = this.nLinea
    const nColumnaInicial = this.nColumna

    while (!this.fin()) {
      comentario += this.caracter
      this.avanzar()
    }

    return this.crearLexema('COMENTARIO', comentario, nLineaInicial, nColumnaInicial)
  }

  private fin (): boolean {
    return this.nColumna >= this.linea.length
  }

  private esEspacio (car: string | null): boolean {
    return (car !== null) ? /\s/.test(car) : false
  }

  private esComienzoCadena (car: string | null): boolean {
    return (car !== null) ? car === '"' || car === "'" : false
  }

  private esDigito (car: string | null): boolean {
    return (car !== null) ? /^[0-9]$/.test(car) : false
  }

  private esAlfabetico (car: string | null): boolean {
    return (car !== null) ? /^[a-zA-Z_]$/.test(car) : false
  }

  private crearLexema (tipo: string, valor: number | string | null = null, nLinea: number | null = null, nColumna: number | null = null): Lexema {
    if (nLinea === null) nLinea = this.nLinea
    if (nColumna === null) nColumna = this.nColumna
    return new Lexema(tipo, valor, this.codigo, nLinea, nColumna)
  }

  private generarError (Cls: any, mensaje: string): Error {
    return new Cls(this.codigo, this.nLinea, this.nColumna, mensaje)
  }
}
