import * as readline from 'readline'

export class Io {
  private readonly rl: readline.Interface

  constructor () {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
  }

  public async ingresar (mensaje: string): Promise<string> {
    return await new Promise(resolve => {
      this.rl.question(mensaje, respuesta => {
        resolve(respuesta)
      })
    })
  }
}
