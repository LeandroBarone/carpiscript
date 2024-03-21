export class Contexto {
  private readonly padre: Contexto | null
  private readonly tabla: Map<string, any>

  constructor (padre: Contexto | null = null) {
    this.padre = padre
    this.tabla = new Map<string, any>()
  }

  asignarVariable (nombre: string, valor: any): void {
    this.tabla.set(nombre, valor)
  }

  obtenerVariable (nombre: string): any {
    const local = this.tabla.get(nombre)
    if (local !== undefined) {
      return local
    } else if (this.padre !== null) {
      return this.padre.obtenerVariable(nombre)
    } else {
      return undefined
    }
  }
}
