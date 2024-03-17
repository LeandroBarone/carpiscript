import { type Nodo, NodoUnario, NodoOperacionUnaria, NodoOperacionBinaria } from '../componentes/nodos'
import { ErrorEjecucion } from '../componentes/errores'

export class Interprete {
  procesar (nodo: Nodo): number {
    const resultado = this.evaluarNodo(nodo)
    return resultado
  }

  private evaluarNodo (nodo: Nodo): number {
    if (nodo instanceof NodoUnario) {
      if (nodo instanceof NodoOperacionUnaria) {
        switch (nodo.lexema.tipo) {
          case 'SUMA':
            return this.evaluarNodo(nodo.nodo)
          case 'RESTA':
            return -this.evaluarNodo(nodo.nodo)
        }
      }
      return nodo.lexema.valor
    } else if (nodo instanceof NodoOperacionBinaria) {
      const a = this.evaluarNodo(nodo.nodoA)
      const b = this.evaluarNodo(nodo.nodoB)

      if (a === undefined || b === undefined) {
        throw this.generarError(ErrorEjecucion, 'Error al evaluar la operación', nodo)
      }

      switch (nodo.lexema.tipo) {
        case 'SUMA':
          return a + b
        case 'RESTA':
          return a - b
        case 'MULTIPLICACION':
          return a * b
        case 'DIVISION':
          if (b === 0) { throw this.generarError(ErrorEjecucion, 'División por cero', nodo) }
          return a / b
      }
    }
    throw this.generarError(ErrorEjecucion, 'Operación no soportada', nodo)
  }

  private evaluarHoja (nodo: Nodo): number {
    return nodo.lexema.valor
  }

  private generarError (Cls: any, mensaje: string, nodo: Nodo): ErrorEjecucion {
    return new Cls(nodo.lexema.codigo, nodo.lexema.nLinea, nodo.lexema.nColumna, mensaje)
  }
}
