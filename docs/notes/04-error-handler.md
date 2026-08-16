# El middleware de error global (`errorHandler`)

## ¿Cómo sabe Express que este middleware maneja errores?

```js
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
```

No es por el nombre del primer parámetro (`err`) — a Express no le importa
cómo se llame. Lo que Express chequea internamente es la **cantidad** de
parámetros de la función (`function.length === 4`). Una función con 4
parámetros = error-handling middleware. Una función con 3 (o menos) = 
middleware normal.

Gotcha para no olvidar: si por accidente te olvidás el `next` y dejás
`(err, req, res)`, esa función deja de ser un error handler para Express
aunque la sigas llamando `errorHandler` — pasa a tratarse como un
middleware normal de 3 parámetros, y todo se rompe.

## ¿Por qué va registrado último (`app.use(errorHandler)` al final)?

El flujo de una request en Express va de arriba hacia abajo, en el orden
en que se registraron los `app.use()`. Cuando algo llama a `next(error)`
(o falla algo síncrono), Express corta el flujo normal y busca **desde
ese punto hacia adelante** el primer middleware de 4 parámetros que
encuentre — no busca hacia atrás.

Por eso, si `errorHandler` estuviera registrado *antes* de las rutas, un
error en una ruta más abajo nunca lo alcanzaría — Express ya "pasó" ese
punto del stack. El error quedaría sin manejar, mostrando el
comportamiento por default de Express (feo, sin el formato JSON propio).

## Por qué el mensaje del error se esconde fuera de `development`

```js
message: process.env.NODE_ENV === 'development' ? err.message : undefined,
```

`err.message` puede filtrar detalles internos del backend — por ejemplo,
un error de Sequelize puede incluir el nombre de una tabla, una columna,
o un fragmento de la query SQL. Exponer eso a cualquiera que le pegue a
la API es darle **reconnaissance** gratis a un potencial atacante: le
contás cómo está armado tu sistema por dentro.

La solución acá es un trade-off clásico de seguridad: el cliente recibe
un mensaje genérico (`'Internal server error.'`), mientras que el detalle
completo se loguea del lado del servidor con `console.error('[Error
Global]:', err)` (línea 9) — vos lo ves en los logs de Render, pero nadie
externo lo ve nunca. Visibilidad completa para vos, exposición mínima
para afuera.

> Nota: `err.message` y `err.stack` son campos distintos — acá solo se
> expone (condicionalmente) el `message`, nunca el `stack` completo con
> archivos y números de línea, que sería aún más sensible.
