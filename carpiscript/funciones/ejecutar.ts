import { AnalizadorLexico } from '../fases/AnalizadorLexico'
import { AnalizadorSintactico } from '../fases/AnalizadorSintactico'
import { Interprete } from '../fases/Interprete'

export function ejecutar (codigo: string, debug: boolean = false): number {
  const analizadorLexico = new AnalizadorLexico()
  const sentencias = analizadorLexico.procesar(codigo)
  if (debug) {
    console.log(JSON.stringify(sentencias, null, 4))
  }

  const analizadorSintactico = new AnalizadorSintactico(debug)
  const bloque = analizadorSintactico.procesar(sentencias)
  if (debug) {
    console.log(JSON.stringify(bloque, null, 4))
  }

  const interprete = new Interprete()
  const resultado = interprete.procesar(bloque)

  return resultado
}
