// @ts-nocheck
import { ejecutar } from './carpiscript'
import fs from 'fs'


let archivo: string
try {
    archivo = process.argv[2]
}
catch {
    console.log('Error: No se ha especificado un archivo')
    process.exit(1)
}

let codigo: string
try {
    codigo = fs.readFileSync(archivo, 'utf-8')
}
catch {
    console.log(`Error: No se ha podido leer el archivo ${archivo}`)
    process.exit(1)
}

const resultado = ejecutar(codigo)
console.log(resultado)