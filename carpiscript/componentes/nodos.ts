import { type Lexema } from './Lexema'

export class Nodo {
  lexema: Lexema
  tipo: string

  constructor (lexema: Lexema) {
    this.lexema = lexema
    this.tipo = this.constructor.name
  }
}

export class NodoUnario extends Nodo {}
export class NodoNulo extends NodoUnario {}
export class NodoNumero extends NodoUnario {}
export class NodoCadena extends NodoUnario {}
export class NodoIdentificador extends NodoUnario {}

export class NodoOperacionUnaria extends NodoUnario {
  nodo: Nodo

  constructor (lexema: Lexema, nodo: Nodo) {
    super(lexema)
    this.nodo = nodo
  }
}

export class NodoOperacionBinaria extends Nodo {
  nodoA: Nodo
  nodoB: Nodo

  constructor (lexema: Lexema, nodoA: Nodo, nodoB: Nodo) {
    super(lexema)
    this.nodoA = nodoA
    this.nodoB = nodoB
  }
}

export class NodoInicioBloque extends NodoOperacionUnaria {}
export class NodoSi extends NodoInicioBloque {}
export class NodoSinoSi extends NodoInicioBloque {}
export class NodoSino extends NodoInicioBloque {}

export class NodoFinBloque extends Nodo {}
