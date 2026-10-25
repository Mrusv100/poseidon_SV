# Poseidon — Backend de ballenas (Polymarket)

Este backend trae movimientos grandes (ballenas) de Polymarket, filtrados a deportes
y esports, usando la API pública oficial de Polymarket (data-api.polymarket.com).
No usa scraping, no necesita API key ni wallet.

## Cómo usarlo

GET /api/whales?min=10000&limit=30

- min: monto mínimo en USD para considerar "ballena" (default 10000)
- limit: cuántos movimientos devolver (default 30, máx 100)

## Importante

- La app publicada necesita este backend separado porque no puede llamar
  directamente a Polymarket por restricciones de seguridad del navegador.
- El frontend (carpeta frontend/index.html) debe desplegarse junto a este
  backend en el mismo proyecto de Vercel para que pueda consultarlo.
