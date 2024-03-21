import { type Nodo, NodoUnario, NodoOperacionUnaria, NodoOperacionBinaria, NodoIdentificador } from '../componentes/nodos'
import { ErrorEjecucion } from '../componentes/errores'
import { Contexto } from '../componentes/Contexto'
import { type Bloque } from '../componentes/Bloque'
import { Ingresar } from '../componentes/Ingresar'

const ingresar = new Ingresar()

export class Interprete {
  async procesar (bloque: Bloque): Promise<any> {
    const contexto = new Contexto()
    const resultados: any[] = []
    for (const sentencia of bloque) {
      resultados.push(await this.evaluarNodo(sentencia, contexto))
    }
    return resultados[resultados.length - 1]
  }

  private async evaluarNodo (nodo: Nodo, contexto: Contexto): Promise<any> {
    if (nodo instanceof NodoUnario) {
      if (nodo instanceof NodoIdentificador) {
        const valor = contexto.obtenerVariable(nodo.lexema.valor as string)
        return valor
      } else if (nodo instanceof NodoOperacionUnaria) {
        switch (nodo.lexema.tipo) {
          case 'SUMA':
            return await this.evaluarNodo(nodo.nodo, contexto)
          case 'RESTA':
            return -(await this.evaluarNodo(nodo.nodo, contexto))
          case 'NUMERO':
            return parseFloat(await this.evaluarNodo(nodo.nodo, contexto) as string)
          case 'IMPRIMIR':
            console.log(await this.evaluarNodo(nodo.nodo, contexto))
            return undefined
          case 'INGRESAR':
            return await ingresar.ingresar(await this.evaluarNodo(nodo.nodo, contexto) + ': ')
          case 'INGRESARNUMERO':
            return parseFloat(await ingresar.ingresar(await this.evaluarNodo(nodo.nodo, contexto) + ': '))
        }
      } else {
        return nodo.lexema.valor
      }
    } else if (nodo instanceof NodoOperacionBinaria) {
      const a = await this.evaluarNodo(nodo.nodoA, contexto)
      const b = await this.evaluarNodo(nodo.nodoB, contexto)

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

      if (nodo.lexema.tipo === 'SUMA') {
        return a + b
      } else if (nodo.lexema.tipo === 'RESTA' && typeof a === 'number' && typeof b === 'number') {
        return a - b
      } else if (nodo.lexema.tipo === 'MULTIPLICACION') {
        if (typeof a === 'number' && typeof b === 'number') {
          return a * b
        } else if (typeof a === 'string' && typeof b === 'number') {
          return a.repeat(b)
        }
      } else if (nodo.lexema.tipo === 'DIVISION') {
        if (typeof a === 'number' && typeof b === 'number') {
          if (b === 0) {
            throw this.generarError(ErrorEjecucion, 'División por cero', nodo)
          }
          return a / b
        } else if (typeof a === 'string' && typeof b === 'string') {
          return a.split(b)
        }
      } else if (nodo.lexema.tipo === 'DIVISION_ENTERA') {
        if (typeof a === 'number' && typeof b === 'number') {
          if (b === 0) {
            throw this.generarError(ErrorEjecucion, 'División por cero', nodo)
          }
          return Math.floor(a / b)
        }
      } else if (nodo.lexema.tipo === 'MODULO') {
        if (typeof a === 'number' && typeof b === 'number') {
          if (b === 0) {
            throw this.generarError(ErrorEjecucion, 'División por cero', nodo)
          }
          return a % b
        }
      } else if (nodo.lexema.tipo === 'EXPONENTE') {
        if (typeof a === 'number' && typeof b === 'number') {
          return a ** b
        }
      }
      throw this.generarError(ErrorEjecucion, 'Operación no soportada', nodo)
    }
  }

  private generarError (Cls: any, mensaje: string, nodo: Nodo): ErrorEjecucion {
    return new Cls(nodo.lexema.codigo, nodo.lexema.nLinea, nodo.lexema.nColumna, mensaje)
  }
}
