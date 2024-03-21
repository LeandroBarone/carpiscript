import { type Lexema } from '../componentes/Lexema'
import { type Nodo, NodoOperacionUnaria, NodoOperacionBinaria, NodoNumero, NodoIdentificador } from '../componentes/nodos'
import { ErrorSintactico } from '../componentes/errores'
import { type Sentencia } from '../componentes/Sentencia'
import { type Bloque } from '../componentes/Bloque'

const UNARIOS = ['SUMA', 'RESTA']
const EXPRESIONES = ['SUMA', 'RESTA']
const TERMINOS = ['MULTIPLICACION', 'DIVISION', 'DIVISION_ENTERA', 'MODULO', 'EXPONENTE']
const FACTORES = ['ENTERO', 'FLOTANTE']

export class AnalizadorSintactico {
  debug: boolean = false

  constructor (debug: boolean = false) {
    this.debug = debug
  }

  procesar (sentencias: Sentencia[]): Bloque {
    if (sentencias.length === 0) {
      throw new Error('La lista de sentencias no puede estar vacía')
    }
    const bloque = sentencias.filter(s => s.length > 0).map(sentencia => {
      const analisis = new AnalisisSintactico(sentencia, this.debug)
      return analisis.analizar()
    })
    return bloque
  }
}

export class AnalisisSintactico {
  debug = false
  sentencia: Sentencia
  nLexema: number = -1
  lexema: Lexema | null = null
  siguienteLexema: Lexema | null = null

  constructor (sentencia: Sentencia, debug: boolean = false) {
    this.debug = debug
    this.sentencia = sentencia
    this.avanzar()
  }

  private avanzar (): void {
    this.nLexema++
    this.lexema = this.nLexema < this.sentencia.length ? this.sentencia[this.nLexema] : null
    this.siguienteLexema = this.nLexema + 1 < this.sentencia.length ? this.sentencia[this.nLexema + 1] : null
    if (this.lexema?.tipo == 'COMENTARIO') {
      this.lexema = null
    }
  }

  analizar (): Nodo {
    if (this.debug) {
      console.log('Analizando', this.lexema?.tipo, this.lexema?.valor)
    }

    if (this.lexema === null) {
      throw this.generarError(ErrorSintactico, 'Se esperaba una sentencia')
    }

    let nodoA = this.procesarExpresion()

    if (this.lexema?.tipo === 'ASIGNACION') {
      const operacion = this.lexema
      this.avanzar()
      const nodoB = this.procesarExpresion()
      nodoA = new NodoOperacionBinaria(nodoA, operacion, nodoB)
    }

    if (this.lexema !== null) {
      throw this.generarError(ErrorSintactico, 'Se esperaba el fin de la sentencia')
    }

    return nodoA
  }

  procesarExpresion (): Nodo {
    if (this.debug) {
      console.log('Procesando expresion', this.lexema?.tipo, this.lexema?.valor)
    }

    let nodoA = this.procesarTermino()

    while (this.lexema !== null && EXPRESIONES.includes(this.lexema.tipo)) {
      const operacion = this.lexema
      this.avanzar()
      const nodoB = this.procesarTermino()
      nodoA = new NodoOperacionBinaria(nodoA, operacion, nodoB)
    }

    return nodoA
  }

  procesarTermino (): Nodo {
    if (this.debug) {
      console.log('Procesando término', this.lexema?.tipo, this.lexema?.valor)
    }

    let nodoA = this.procesarFactor()

    while (this.lexema !== null && TERMINOS.includes(this.lexema.tipo)) {
      const operacion = this.lexema
      this.avanzar()
      const nodoB = this.procesarFactor()
      nodoA = new NodoOperacionBinaria(nodoA, operacion, nodoB)
    }

    return nodoA
  }

  private procesarFactor (): Nodo {
    if (this.debug) {
      console.log('Procesando factor', this.lexema?.tipo, this.lexema?.valor)
    }

    if (!this.lexema) {
      throw this.generarError(ErrorSintactico, 'Se esperaba un operando')
    }

    if (UNARIOS.includes(this.lexema.tipo)) {
      // Procesar operación unaria (número negativo o positivo)
      const operacion = this.lexema
      this.avanzar()
      const nodo = this.procesarFactor()
      return new NodoOperacionUnaria(operacion, nodo)
    } else if (this.lexema.tipo === 'PARENTESIS_IZQ') {
      // Procesar paréntesis con una expresión adentro
      this.avanzar()
      const nodo = this.procesarExpresion()
      // @ts-expect-error - TS no sabe que this.avanzar() modifica this.lexema
      if (this.lexema.tipo !== 'PARENTESIS_DER') {
        throw this.generarError(ErrorSintactico, 'Se esperaba un paréntesis derecho')
      }
      this.avanzar()
      return nodo
    } else if (FACTORES.includes(this.lexema.tipo)) {
      // Procesar número
      const nodo = new NodoNumero(this.lexema)
      this.avanzar()
      return nodo
    } else if (this.lexema.tipo === 'IDENTIFICADOR') {
      // Procesar identificador
      const nodo = new NodoIdentificador(this.lexema)
      this.avanzar()
      return nodo
    }

    throw this.generarError(ErrorSintactico, 'Se esperaba un operando')
  }

  generarError (Cls: any, mensaje: string): Error {
    if (!this.lexema) {
      return new Error(mensaje)
    } else {
      return new Cls(this.lexema.codigo, this.lexema.nLinea, this.lexema.nColumna, mensaje)
    }
  }
}
