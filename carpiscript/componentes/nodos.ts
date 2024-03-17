import { Token } from './Token'


export class Nodo {
    token: Token

    constructor(token: Token) {
        this.token = token
    }
}

export class NodoUnario extends Nodo {}
export class NodoNumero extends NodoUnario {}

export class NodoOperacionUnaria extends NodoUnario {
    nodo: Nodo

    constructor(operacion: Token, nodo: Nodo) {
        super(operacion)
        this.nodo = nodo
    }
}

export class NodoOperacionBinaria extends Nodo {
    nodoA: Nodo
    nodoB: Nodo

    constructor(nodoA: Nodo, operacion: Token, nodoB: Nodo) {
        super(operacion)
        this.nodoA = nodoA
        this.nodoB = nodoB
    }
}
