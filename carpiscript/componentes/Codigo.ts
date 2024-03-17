export class Codigo {
  texto: string

  constructor (texto: string) {
    this.texto = texto
  }

  linea (nLinea: number): string {
    const lineas = this.texto.split('\n')
    return lineas[nLinea]
  }
}
