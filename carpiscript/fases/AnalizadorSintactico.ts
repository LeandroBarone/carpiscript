import { Lexema } from '../componentes/Lexema'
import { type Nodo, NodoOperacionUnaria, NodoOperacionBinaria, NodoNumero } from '../componentes/nodos'
import { ErrorSintactico } from '../componentes/errores'
import { Codigo } from '../componentes/Codigo'

const UNARIOS = ['SUMA', 'RESTA']
const EXPRESIONES = ['SUMA', 'RESTA']
const TERMINOS = ['MULTIPLICACION', 'DIVISION']
const FACTORES = ['ENTERO', 'FLOTANTE']

export class AnalizadorSintactico {
  private lexemas: Lexema[] = []
  private lexema: Lexema = new Lexema('', null, new Codigo(' '), 0, 0)
  private posicion: number = 0

  procesar (lexemas: Lexema[]): Nodo {
    this.lexemas = lexemas
    this.lexema = lexemas[0]
    this.posicion = 0

    return this.recorrer()
  }

  private recorrer (): Nodo {
    const nodo = this.procesarExpresion()
    if (this.lexema.tipo !== 'EOF') {
      throw this.generarError(ErrorSintactico, 'Se esperaba el fin de la expresión')
    }
    return nodo
  }

  private avanzar (): void {
    this.posicion++
    if (this.fin()) {
      this.lexema = new Lexema('EOF', null, this.lexema.codigo, this.lexema.nLinea, this.lexema.nColumna)
    } else {
      this.lexema = this.lexemas[this.posicion]
    }
  }

  private procesarFactor (): Nodo {
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
    }

    throw this.generarError(ErrorSintactico, 'Se esperaba un operando')
  }

  procesarTermino (): Nodo {
    let nodoA = this.procesarFactor()

    while (TERMINOS.includes(this.lexema.tipo)) {
      const operacion = this.lexema
      this.avanzar()
      const nodoB = this.procesarFactor()
      nodoA = new NodoOperacionBinaria(nodoA, operacion, nodoB)
    }

    return nodoA
  }

  procesarExpresion (): Nodo {
    let nodoA = this.procesarTermino()

    while (EXPRESIONES.includes(this.lexema.tipo)) {
      const operacion = this.lexema
      this.avanzar()
      const nodoB = this.procesarTermino()
      nodoA = new NodoOperacionBinaria(nodoA, operacion, nodoB)
    }

    return nodoA
  }

  fin(): boolean {
    return this.posicion >= this.lexemas.length
  }

  generarError (Cls: any, mensaje: string): Error {
    return new Cls(this.lexema.codigo, this.lexema.nLinea, this.lexema.nColumna, mensaje)
  }
}
