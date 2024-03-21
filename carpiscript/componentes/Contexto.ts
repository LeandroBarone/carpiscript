export class Contexto {
  private readonly contexto: Map<string, any>

  constructor () {
    this.contexto = new Map<string, any>()
  }

  asignarVariable (nombre: string, valor: any): void {
    this.contexto.set(nombre, valor)
  }

  obtenerVariable (nombre: string): any {
    return this.contexto.get(nombre)
  }
}
