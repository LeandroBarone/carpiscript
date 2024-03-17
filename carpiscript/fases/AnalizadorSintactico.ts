import { Token } from '../componentes/Token'
import { Nodo, NodoOperacionUnaria, NodoOperacionBinaria, NodoNumero } from '../componentes/nodos'
import { ErrorSintactico } from '../componentes/errores'
import { Codigo } from '../componentes/Codigo'


const UNARIOS = ['SUMA', 'RESTA']
const EXPRESIONES = ['SUMA', 'RESTA']
const TERMINOS = ['MULTIPLICACION', 'DIVISION']
const FACTORES = ['ENTERO', 'FLOTANTE']


export class AnalizadorSintactico {
    private tokens: Token[] = []
    private token: Token = new Token('', null, new Codigo(' '), 0, 0)
    private posicion: number = 0

    procesar(tokens: Token[]) {
        this.tokens = tokens
        this.token = tokens[0]
        this.posicion = 0

        return this.recorrer()
    }

    private recorrer(): Nodo[] {
        const nodo = this.procesarExpresion()
        if (this.token.tipo != 'FIN')
            throw this.generarError(ErrorSintactico, 'Se esperaba el fin de la expresión')
        return [nodo]
    }

    private avanzar() {
        this.posicion++
        if (this.posicion < this.tokens.length)
            this.token = this.tokens[this.posicion]
        else
            this.token = new Token('FIN', null, this.token.codigo, this.token.nLinea, this.token.nColumna)
    }

    private procesarFactor(): Nodo {
        if (UNARIOS.includes(this.token.tipo)) {
            const operacion = this.token
            this.avanzar()
            const nodo = this.procesarFactor()
            return new NodoOperacionUnaria(operacion, nodo)
        }

        else if (this.token.tipo == 'PARENTESIS_IZQ') {
            this.avanzar()
            const nodo = this.procesarExpresion()
            // @ts-ignore
            if (this.token.tipo != 'PARENTESIS_DER')
                throw this.generarError(ErrorSintactico, 'Se esperaba un paréntesis derecho')
            this.avanzar()
            return nodo
        }

        else if (FACTORES.includes(this.token.tipo)) {
            const nodo = new NodoNumero(this.token)
            this.avanzar()
            return nodo
        }

        throw this.generarError(ErrorSintactico, 'Se esperaba un operando')
    }

    procesarTermino(): Nodo {
        let nodoA = this.procesarFactor()

        while (TERMINOS.includes(this.token.tipo)) {
            const operacion = this.token
            this.avanzar()
            const nodoB = this.procesarFactor()

            if (nodoB)
                nodoA = new NodoOperacionBinaria(nodoA, operacion, nodoB)
            else
                throw this.generarError(ErrorSintactico, 'Se esperaba un operando')
        }
        return nodoA
    }

    procesarExpresion(): Nodo {
        let nodoA = this.procesarTermino()

        while (EXPRESIONES.includes(this.token.tipo)) {
            const operacion = this.token
            this.avanzar()
            const nodoB = this.procesarTermino()

            if (nodoB)
                nodoA = new NodoOperacionBinaria(nodoA, operacion, nodoB)
            else
                throw this.generarError(ErrorSintactico, 'Se esperaba un operando')
        }

        return nodoA
    }

    generarError(cls: any, mensaje: string) {
        return new cls(this.token.codigo, this.token.nLinea, this.token.nColumna, mensaje)
    }
}
