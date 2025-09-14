# SGTE — Interfaz de Inicio de Sesión

Interfaz estática basada en la referencia proporcionada y los recursos de `recursos/`.

## Cómo usar

- Asegúrate de que existan los archivos de imagen:
  - `recursos/fondo.png`
  - `recursos/logo.png`
- Abre `index.html` en tu navegador.

Para abrir en Windows desde PowerShell:

```powershell
Start-Process .\index.html
```

## Estructura

- `index.html` — Maquetación y elementos semánticos.
- `styles.css` — Estilos responsivos, tipografías, y colores.
- `script.js` — Selección de rol y manejo de envío de formulario (demo).
- `recursos/` — Imágenes de fondo y logo (ya existentes).

## Personalización

- Colores principales en `styles.css` (variables CSS en `:root`).
- Textos de marca en el `<header class="brand">`.
- Lógica real de autenticación puede integrarse en `script.js` o enlazar a tu backend.

## Accesibilidad

- Inputs con `label` y `placeholder`.
- Chips de rol con `aria-pressed` y `role="group"`.

## Notas

- Este es un prototipo estático. No incluye rutas ni frameworks; puedes integrarlo a tu stack existente.