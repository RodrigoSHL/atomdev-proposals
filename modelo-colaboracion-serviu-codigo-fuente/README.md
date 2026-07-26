# Modelo de colaboración y capacidad

Frontend interactivo para presentar y validar con SERVIU:

- el tope de capacidad por proyecto y sprint;
- la incorporación mensual de Marcia;
- la apertura de un segundo proyecto y equipo;
- la distribución de personas y roles;
- los acuerdos pendientes de la conversación.

## Requisitos

- Node.js 22.13 o superior
- npm

## Ejecutar localmente

```bash
npm install
npm run dev
```

Luego abre la dirección local que aparece en la terminal.

## Crear una versión final

```bash
npm run build
npm run start
```

## Archivos principales

- `app/page.tsx`: contenido, cálculos, configuración y acuerdos.
- `app/globals.css`: diseño visual, adaptación móvil y versión para imprimir/PDF.
- `app/layout.tsx`: título, descripción e idioma de la página.
- `.openai/hosting.json`: configuración de publicación del sitio actual.

## Valores iniciales

Los valores predeterminados se encuentran en `defaultSettings`, al comienzo de
`app/page.tsx`:

```ts
const defaultSettings = {
  hourlyRate: 1,
  weeklyHours: 44,
  sprintWeeks: 4,
  marciaFee: "",
  marciaInMultiProject: true,
};
```

Los acuerdos iniciales están en `defaultAgreements`, en el mismo archivo.

## Persistencia

Las configuraciones y acuerdos que se cambian desde la interfaz se guardan en
el almacenamiento local del navegador. No existe una base de datos y los datos
no se comparten entre dispositivos.
