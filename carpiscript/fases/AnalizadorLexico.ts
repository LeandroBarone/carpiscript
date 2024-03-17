import { Token } from '../componentes/Token'
import { ErrorLexico } from '../componentes/errores'
import { Codigo } from '../componentes/Codigo'


export class AnalizadorLexico {
    private codigo: Codigo = new Codigo(' ')
    private caracter: string = ' '
    private posicion: number = 0
    private nLinea: number = 0
    private nColumna: number = 0

    procesar(texto: string) {
        if (texto.length == 0)
            throw new Error('El código no puede estar vacío')

        this.codigo = new Codigo(texto)
        this.caracter = texto[0]
        this.posicion = 0
        this.nLinea = 0
        this.nColumna = 0

        return this.tokenizar()
    }

    private tokenizar(): Token[] {
        const tokens: Token[] = []

        while (this.posicion < this.codigo.texto.length) {
            if (this.esEspacio(this.caracter)) {
            }
            else if (this.esDigito(this.caracter)) {
                tokens.push(this.procesarNumero())
                continue
            }
            else if (this.caracter == '(')
                tokens.push(this.crearToken('PARENTESIS_IZQ'))
            else if (this.caracter == ')')
                tokens.push(this.crearToken('PARENTESIS_DER'))
            else if (this.caracter == '+')
                tokens.push(this.crearToken('SUMA'))
            else if (this.caracter == '-')
                tokens.push(this.crearToken('RESTA'))
            else if (this.caracter == '*')
                tokens.push(this.crearToken('MULTIPLICACION'))
            else if (this.caracter == '/')
                tokens.push(this.crearToken('DIVISION'))
            else
                throw this.generarError(ErrorLexico, 'Caracter inválido: ' + this.caracter)

            this.avanzar()
        }

        return tokens
    }

    private avanzar() {
        this.posicion++
        this.nColumna++

        if (this.caracter == '\n') {
            this.nLinea++
            this.nColumna = 0
        }

        if (this.posicion >= this.codigo.texto.length)
            return

        this.caracter = this.codigo.texto[this.posicion]

    }

    private procesarNumero(): Token {
        let num = ''
        let nPuntos = 0
        const nLineaInicial = this.nLinea
        const nColumnaInicial = this.nColumna

        while (
            this.posicion < this.codigo.texto.length
            && (this.esDigito(this.caracter) || this.caracter == '.')
        ) {
            if (this.caracter == '.') {
                if (nPuntos)
                    throw this.generarError(ErrorLexico, 'Número con múltiples puntos decimales')
                nPuntos++
            }

            num += this.caracter
            this.avanzar()
        }

        if (nPuntos) {
            return this.crearToken('FLOTANTE', parseFloat(num), nLineaInicial, nColumnaInicial)
        }
        else {
            return this.crearToken('ENTERO', parseInt(num), nLineaInicial, nColumnaInicial)
        }
    }

    private esEspacio(car: string) {
        return /\s/.test(car)
    }

    private esDigito(car: string) {
        return /^[0-9]$/.test(car)
    }

    private crearToken(tipo: string, valor: number|null = null, nLinea: number|null = null, nColumna: number|null = null) {
        if (nLinea == null) nLinea = this.nLinea
        if (nColumna == null) nColumna = this.nColumna
        return new Token(tipo, valor, this.codigo, nLinea, nColumna)
    }

    private generarError(cls: any, mensaje: string) {
        return new cls(this.codigo, this.nLinea, this.nColumna, mensaje)
    }
}
