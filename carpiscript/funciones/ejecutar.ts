import { AnalizadorLexico } from '../fases/AnalizadorLexico'
import { AnalizadorSintactico } from '../fases/AnalizadorSintactico'
import { Interprete } from '../fases/Interprete'

export function ejecutar (codigo: string, debug: boolean = false): number {
  const analizadorLexico = new AnalizadorLexico()
  const lexemas = analizadorLexico.procesar(codigo)
  if (debug) {
    console.log(JSON.stringify(lexemas, null, 4))
  }

  const analizadorSintactico = new AnalizadorSintactico()
  const nodoRaiz = analizadorSintactico.procesar(lexemas)
  if (debug) {
    console.log(JSON.stringify(nodoRaiz, null, 4))
  }

  const interprete = new Interprete()
  const resultado = interprete.procesar(nodoRaiz)

  return resultado
}
