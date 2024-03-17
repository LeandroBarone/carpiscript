import { type Lexema } from './Lexema'

export class Nodo {
  lexema: Lexema

  constructor (lexema: Lexema) {
    this.lexema = lexema
  }
}

export class NodoUnario extends Nodo {}
export class NodoNumero extends NodoUnario {}

export class NodoOperacionUnaria extends NodoUnario {
  nodo: Nodo

  constructor (operacion: Lexema, nodo: Nodo) {
    super(operacion)
    this.nodo = nodo
  }
}

export class NodoOperacionBinaria extends Nodo {
  nodoA: Nodo
  nodoB: Nodo

  constructor (nodoA: Nodo, operacion: Lexema, nodoB: Nodo) {
    super(operacion)
    this.nodoA = nodoA
    this.nodoB = nodoB
  }
}
