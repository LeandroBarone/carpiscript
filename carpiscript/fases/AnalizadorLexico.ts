import { Lexema } from '../componentes/Lexema'
import { ErrorLexico } from '../componentes/errores'
import { Codigo } from '../componentes/Codigo'

export class AnalizadorLexico {
  private codigo: Codigo = new Codigo(' ')
  private caracter: string = ' '
  private posicion: number = 0
  private nLinea: number = 0
  private nColumna: number = 0

  procesar (texto: string): Lexema[] {
    if (texto.length === 0) {
      throw new Error('El código no puede estar vacío')
    }

    this.codigo = new Codigo(texto)
    this.caracter = texto[0]
    this.posicion = 0
    this.nLinea = 0
    this.nColumna = 0

    return this.analizar()
  }

  private analizar (): Lexema[] {
    const lexemas: Lexema[] = []

    while (!this.fin()) {
      if (this.esEspacio(this.caracter)) {
        // Ignorar espacios
      } else if (this.esDigito(this.caracter)) {
        lexemas.push(this.procesarNumero())
        continue
      } else if (this.caracter === '(') {
        lexemas.push(this.crearLexema('PARENTESIS_IZQ'))
      } else if (this.caracter === ')') {
        lexemas.push(this.crearLexema('PARENTESIS_DER'))
      } else if (this.caracter === '+') {
        lexemas.push(this.crearLexema('SUMA'))
      } else if (this.caracter === '-') {
        lexemas.push(this.crearLexema('RESTA'))
      } else if (this.caracter === '*') {
        lexemas.push(this.crearLexema('MULTIPLICACION'))
      } else if (this.caracter === '/') {
        lexemas.push(this.crearLexema('DIVISION'))
      } else {
        throw this.generarError(ErrorLexico, 'Caracter inválido: ' + this.caracter)
      }

      this.avanzar()
    }

    return lexemas
  }

  private avanzar (): void {
    this.posicion++
    this.nColumna++

    if (this.caracter === '\n') {
      this.nLinea++
      this.nColumna = 0
    }

    if (this.fin()) {
      return
    }

    this.caracter = this.codigo.texto[this.posicion]
  }

  private procesarNumero (): Lexema {
    let num = ''
    let nPuntos = 0
    const nLineaInicial = this.nLinea
    const nColumnaInicial = this.nColumna

    while (!this.fin() && (this.esDigito(this.caracter) || this.caracter === '.')) {
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
      return this.crearLexema('FLOTANTE', parseFloat(num), nLineaInicial, nColumnaInicial)
    } else {
      return this.crearLexema('ENTERO', parseInt(num), nLineaInicial, nColumnaInicial)
    }
  }

  private fin (): boolean {
    return this.posicion >= this.codigo.texto.length
  }

  private esEspacio (car: string): boolean {
    return /\s/.test(car)
  }

  private esDigito (car: string): boolean {
    return /^[0-9]$/.test(car)
  }

  private crearLexema (tipo: string, valor: number | null = null, nLinea: number | null = null, nColumna: number | null = null): Lexema {
    if (nLinea === null) nLinea = this.nLinea
    if (nColumna === null) nColumna = this.nColumna
    return new Lexema(tipo, valor, this.codigo, nLinea, nColumna)
  }

  private generarError (Cls: any, mensaje: string): Error {
    return new Cls(this.codigo, this.nLinea, this.nColumna, mensaje)
  }
}
