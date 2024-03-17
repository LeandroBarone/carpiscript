import { AnalizadorLexico } from './fases/AnalizadorLexico'
import { AnalizadorSintactico } from './fases/AnalizadorSintactico'
import { Interprete } from './fases/Interprete'

export function ejecutar(codigo: string): number {
    const analizadorLexico = new AnalizadorLexico()
    const tokens = analizadorLexico.procesar(codigo)
    // console.log(JSON.stringify(tokens, null, 4))

    const analizadorSintactico = new AnalizadorSintactico()
    const nodos = analizadorSintactico.procesar(tokens)
    // console.log(JSON.stringify(nodos, null, 4))

    const interprete = new Interprete()
    const resultado = interprete.procesar(nodos)

    return resultado
}

export * from './fases/AnalizadorLexico'
export * from './fases/AnalizadorSintactico'
export * from './fases/Interprete'
export * from './componentes/errores'
export * from './componentes/nodos'
export * from './componentes/Token'
export * from './componentes/Codigo'
