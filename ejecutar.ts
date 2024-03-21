import { ejecutar, ErrorCarpiscript } from './carpiscript'
import fs from 'fs'

let archivo: string
try {
  archivo = process.argv[2]
} catch {
  console.log('Error: No se ha especificado un archivo')
  process.exit(1)
}

let codigo: string
try {
  codigo = fs.readFileSync(archivo, 'utf-8')
} catch {
  console.log(`Error: No se ha podido leer el archivo ${archivo}`)
  process.exit(1)
}

ejecutar(codigo)
  .then(resultado => {
    if (resultado !== undefined) {
      console.log(resultado)
    }
    process.exit(0)
  })
  .catch(error => {
    if (error instanceof ErrorCarpiscript) {
      console.log(error.trazo)
    } else if (error instanceof Error) {
      console.log(`${error.name}: ${error.message}`)
    } else {
      console.log(error)
    }
    process.exit(1)
  })
