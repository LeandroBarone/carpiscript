import { Nodo, NodoUnario, NodoOperacionUnaria, NodoOperacionBinaria } from '../componentes/nodos'
import { ErrorEjecucion } from '../componentes/errores'


export class Interprete {
    procesar(nodos: Nodo[]): number {
        const resultado = this.evaluarNodo(nodos[0])
        return resultado
    }

    private evaluarNodo(nodo: Nodo): number {
        if (nodo instanceof NodoUnario) {
            if (nodo instanceof NodoOperacionUnaria) {
                switch (nodo.token.tipo) {
                    case 'SUMA':
                        return this.evaluarNodo(nodo.nodo)
                    case 'RESTA':
                        return -this.evaluarNodo(nodo.nodo)
                }
            }
            return nodo.token.valor
        }
        else if (nodo instanceof NodoOperacionBinaria) {
            const a = this.evaluarNodo(nodo.nodoA)
            const b = this.evaluarNodo(nodo.nodoB)

            if (a == undefined || b == undefined)
                throw this.generarError('Error al evaluar la operación', nodo)

            switch (nodo.token.tipo) {
                case 'SUMA':
                    return a + b
                case 'RESTA':
                    return a - b
                case 'MULTIPLICACION':
                    return a * b
                case 'DIVISION':
                    if (b == 0)
                        throw this.generarError('División por cero', nodo)
                    return a / b
            }
        }
        throw this.generarError('Operación no soportada', nodo)
    }

    private evaluarHoja(nodo: Nodo): number {
        return nodo.token.valor
    }

    private generarError(mensaje: string, nodo: Nodo) {
        return new ErrorEjecucion(nodo.token.codigo, nodo.token.nLinea, nodo.token.nColumna, mensaje)
    }
}
