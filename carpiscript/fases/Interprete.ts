import { type Nodo, NodoUnario, NodoOperacionUnaria, NodoOperacionBinaria, NodoIdentificador } from '../componentes/nodos'
import { ErrorEjecucion } from '../componentes/errores'
import { Contexto } from '../componentes/Contexto'
import { type Bloque } from '../componentes/Bloque'

export class Interprete {
  procesar (bloque: Bloque): number {
    const contexto = new Contexto()
    const resultado = bloque.map(sentencia => {
      return this.evaluarNodo(sentencia, contexto)
    })
    return resultado[resultado.length - 1]
  }

  private evaluarNodo (nodo: Nodo, contexto: Contexto): number {
    if (nodo instanceof NodoUnario) {
      if (nodo instanceof NodoIdentificador) {
        return contexto.obtenerVariable(nodo.lexema.valor as string)
      } else if (nodo instanceof NodoOperacionUnaria) {
        switch (nodo.lexema.tipo) {
          case 'SUMA':
            return this.evaluarNodo(nodo.nodo, contexto)
          case 'RESTA':
            return -this.evaluarNodo(nodo.nodo, contexto)
        }
      } else {
        return nodo.lexema.valor
      }
    } else if (nodo instanceof NodoOperacionBinaria) {
      const a = this.evaluarNodo(nodo.nodoA, contexto)
      const b = this.evaluarNodo(nodo.nodoB, contexto)

      if (nodo.lexema.tipo === 'ASIGNACION') {
        if (!(nodo.nodoA instanceof NodoIdentificador)) {
          throw this.generarError(ErrorEjecucion, 'No se puede asignar a un valor no identificador', nodo)
        }
        contexto.asignarVariable(nodo.nodoA.lexema.valor as string, b)
        return b
      }

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
          if (b === 0) {
            throw this.generarError(ErrorEjecucion, 'División por cero', nodo)
          }
          return a / b
        case 'DIVISION_ENTERA':
          if (b === 0) {
            throw this.generarError(ErrorEjecucion, 'División por cero', nodo)
          }
          return Math.floor(a / b)
        case 'EXPONENTE':
          return a ** b
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
