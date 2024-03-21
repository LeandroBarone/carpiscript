# CarpiScript

CarpiScript es un lenguaje de scripting en castellano desarrollado en TypeScript. Incluye analizador léxico, analizador sintáctico e intérprete.

![Carpincho Canchero](https://raw.githubusercontent.com/LeandroBarone/carpiscript/main/carpincho.png)

## Requsitos

Node y ts-node (`npm install -g ts-node`).

## Uso

Para ejecutar un script desarrollado en CarpiScript:

```shell
$ ts-node ejecutar.ts test.ñ
```

Para correr código CarpiScript y obtener el resultado:

```ts
import ejecutar from './carpiscript'

console.log(ejecutar('(1+2)*3'))
```

## Sintaxis

```python
precioPorDocena = ingresarNumero("Precio por docena")  # => asumiendo 6000
precioUnitario = precioPorDocena // 12  # División entera
impuestos = 10
precioFinal = precioUnitario * (1 + impuestos / 100)
imprimir("El precio final con " + impuestos + "% de impuestos es $" + precioFinal)
si (precioFinal > 1000) {
  imprimir('Precio demasiado alto')
}


```
Salida: El precio final con 10% de impuestos es $550
