# La ruta `/health` y por qué importa

```js
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'WalletZap API running' });
});
```

Es una ruta sin lógica de negocio — no toca la base de datos, no valida
nada, solo confirma que el servidor está levantado y respondiendo. Es el
chequeo más básico posible: "¿está vivo el proceso?".

## Quién la usa en la práctica

No es solo para chequearla manualmente vos. En un entorno real, la usan
sistemas automatizados:

- **El hosting (Render):** le pega pings periódicos para saber si la
  instancia sigue viva y decidir si le manda tráfico o si necesita
  reiniciarla.
- **Pipelines de deploy:** después de deployar una versión nueva, chequean
  `/health` antes de "prender" el tráfico real hacia ella. Si no responde
  `ok`, el deploy se considera fallido y no se promueve.
- **Servicios de monitoreo externo (uptime monitors):** le pegan cada
  tanto y avisan (alertan) si el servidor deja de responder.

## Por qué es importante que sea simple

Justamente porque no depende de nada más (no consulta la DB, no requiere
auth), es confiable como señal de "el proceso Node está corriendo". Si
tuviera lógica adicional (por ejemplo, consultar la base de datos), un
fallo temporal de Neon podría hacer que Render piense que todo el
servidor está caído y lo reinicie innecesariamente, cuando en realidad
solo la DB tuvo un hiccup momentáneo.
