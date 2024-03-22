import { Nodo, NodoUnario, NodoOperacionUnaria, NodoOperacionBinaria, NodoIdentificador, NodoInicioBloque, NodoFinBloque, NodoNulo } from '../componentes/nodos'
import { ErrorEjecucion } from '../componentes/errores'
import { Contexto } from '../componentes/Contexto'
import { type Bloque } from '../componentes/Bloque'
import { Ingresar } from '../componentes/Ingresar'

const ingresar = new Ingresar()

export class Interprete {
  bloque: Bloque = []
  nNodo: number = -1
  nodo: Nodo | null = null
  siguienteNodo: Nodo | null = null
  contextoGlobal: Contexto = new Contexto()

  async procesar (bloque: Bloque): Promise<any> {
    this.bloque = bloque
    this.nNodo = -1
    this.contextoGlobal = new Contexto()
    this.nodo = null
    this.siguienteNodo = null
    return await this.procesarBloque(this.contextoGlobal)
  }

  async procesarBloque (contexto: Contexto, ejecutar: boolean = true): Promise<any> {
    const contextoLocal = new Contexto(contexto)

    while (this.avanzar()) {
      if (this.nodo instanceof NodoFinBloque) {
        return
      }

      if (!ejecutar) {
        continue
      }

      if (this.nodo instanceof NodoInicioBloque) {
        let ejecutado: boolean = false

        if (this.nodo.nodo.lexema.tipo === 'SI') {
          // SI
          const verdadero = Boolean(await this.evaluarNodo(this.nodo.nodo, contextoLocal))
          if (verdadero) {
            await this.procesarBloque(contextoLocal)
            ejecutado = true
          } else {
            await this.procesarBloque(contextoLocal, false)
          }
          // SINO
          while (this.siguienteNodo instanceof NodoOperacionUnaria && this.siguienteNodo.nodo.lexema.tipo === 'SINO' && this.siguienteNodo.nodo instanceof NodoOperacionUnaria) {
            this.avanzar()
            const verdadero = Boolean(await this.evaluarNodo((this.nodo.nodo as NodoOperacionUnaria).nodo, contextoLocal))
            if (verdadero && !ejecutado) {
              await this.procesarBloque(contextoLocal)
              ejecutado = true
            } else {
              await this.procesarBloque(contextoLocal, false)
            }
          }
          // SINO
          if (this.siguienteNodo instanceof NodoOperacionUnaria && this.siguienteNodo.nodo instanceof NodoNulo) {
            this.avanzar()
            await this.procesarBloque(contextoLocal, !ejecutado)
          }
        } else {
          throw this.generarError(ErrorEjecucion, 'Bloque no soportado', this.nodo)
        }
      } else if (this.nodo instanceof Nodo) {
        await this.evaluarNodo(this.nodo, contextoLocal)
      }
    }
  }

  private avanzar (): boolean {
    this.nNodo++
    this.nodo = this.nNodo < this.bloque.length ? this.bloque[this.nNodo] : null
    this.siguienteNodo = this.nNodo + 1 < this.bloque.length ? this.bloque[this.nNodo + 1] : null
    return this.nNodo < this.bloque.length
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
          case 'INICIO_BLOQUE':
            return await this.evaluarNodo(nodo.nodo, contexto)
          case 'SI':
            return await this.evaluarNodo(nodo.nodo, contexto)
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

      if (nodo.lexema.tipo === 'IGUAL_QUE') {
        return a === b
      } else if (nodo.lexema.tipo === 'MAYOR_QUE') {
        return a > b
      } else if (nodo.lexema.tipo === 'MAYOR_IGUAL_QUE') {
        return a >= b
      } else if (nodo.lexema.tipo === 'MENOR_QUE') {
        return a < b
      } else if (nodo.lexema.tipo === 'MENOR_IGUAL_QUE') {
        return a <= b
      } else if (nodo.lexema.tipo === 'SUMA') {
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
