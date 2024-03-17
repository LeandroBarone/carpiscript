import { type Codigo } from './Codigo'

export class ErrorCarpiscript extends Error {
  linea: number
  columna: number
  trazo: string

  constructor (codigo: Codigo, nLinea: number, nColumna: number, mensaje: string) {
    super(mensaje)

    this.linea = nLinea
    this.columna = nColumna

    const linea = codigo.linea(nLinea)
    const indicador = '-'.repeat(nColumna) + '^'
    this.trazo = [
      `${this.constructor.name}: ${mensaje}`,
      linea,
      indicador,
      `Línea ${nLinea + 1}, columna ${nColumna}`
    ].join('\n')
  }
}

export class ErrorLexico extends ErrorCarpiscript {}
export class ErrorSintactico extends ErrorCarpiscript {}
export class ErrorEjecucion extends ErrorCarpiscript {}
