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

console.log(ejecutar(`(1+2)*3`))
```
