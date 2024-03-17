import { Codigo } from './Codigo'


export class ErrorGenerico extends Error {
    constructor(codigo: Codigo, nLinea: number, nColumna: number, mensaje: string) {
        super(mensaje)
        const linea = codigo.linea(nLinea)
        const flecha = (nColumna > 0 ? '-'.repeat(nColumna) : '') + '^'
        this.stack = `
${this.constructor.name}: ${mensaje}
${linea}
${flecha}
Línea ${nLinea+1}, columna ${nColumna}
`
    }
}

export class ErrorLexico extends ErrorGenerico {}
export class ErrorSintactico extends ErrorGenerico {}
export class ErrorEjecucion extends ErrorGenerico {}
