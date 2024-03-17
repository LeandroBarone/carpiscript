import { type Codigo } from './Codigo'

export class Lexema {
  tipo: string
  valor: any
  codigo: Codigo
  nLinea: number
  nColumna: number

  constructor (tipo: string, valor: any, codigo: Codigo, nLinea: number, nColumna: number) {
    this.tipo = tipo
    this.valor = valor
    this.codigo = codigo
    this.nLinea = nLinea
    this.nColumna = nColumna
  }
}
