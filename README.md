# Preparcial 1 - CRUD de Actores 

Proyecto frontend con Next.js para listar, crear, editar y eliminar actores, consumiendo una API en `/api/v1/actors`.

## Estado final del proyecto

Se dejó una arquitectura simple y funcional:

- Frontend en cliente con `react-router-dom` (`/actors` y `/crear`).
- Contexto global en `app/actor.tsx` con CRUD básico.
- Route Handlers de Next.js como proxy hacia backend real.
- Código simplificado sin manejo avanzado de errores en `actor.tsx` (por solicitud).

## Cambios realizados y por qué

### 1) Corrección de error SSR: `document is not defined`

Problema:
- Al entrar a `/actors`, Next.js intentaba renderizar en servidor.
- `BrowserRouter` usa `document`, que no existe en SSR.

Solución:
- En `app/router-app.tsx` se añadió control de montaje:
  - `isMounted` con `useState(false)`.
  - `useEffect` para pasar a `true` en cliente.
  - Si no está montado, retorna `null`.

Resultado:
- Se evita renderizar `BrowserRouter` durante SSR.
- Desaparece el error `ReferenceError: document is not defined`.

### 2) Simplificación de `app/actor.tsx`

Objetivo:
- Hacer el archivo más corto y básico.

Se hizo:
- Se eliminaron `try/catch`.
- Se eliminaron validaciones `response.ok`.
- Se eliminó parsing defensivo complejo.
- Se dejaron funciones directas para CRUD.
- Se mantuvo la interfaz del contexto para no romper las vistas.

Resultado:
- Código más fácil de leer para estudio.
- Menos robusto ante fallos de red/API (esto es esperado por la simplificación).

### 3) Limpieza de carpetas no usadas

Se eliminaron carpetas vacías:
- `app/actors`
- `app/crear`
- `public`

Nota:
- `.next` es temporal de compilación y parte de ella quedó bloqueada por archivos en uso del entorno de desarrollo.

## Estructura actual

```text
app/
  [[...slug]]/
    page.tsx                    # Entrada catch-all que carga RouterApp
  api/
    v1/
      actors/
        route.ts                # GET, POST
        [id]/
          route.ts              # PUT, PATCH, DELETE
  views/
    actors-view.tsx             # Vista lista + edición + eliminación
    crear-view.tsx              # Vista formulario de creación
  actor.tsx                     # Contexto global y funciones CRUD
  router-app.tsx                # Ruteo cliente con BrowserRouter
  layout.tsx                    # Layout + Actor
  globals.css
  favicon.ico
```

## Flujo de rutas

```mermaid
flowchart TD
  A[Navegador] --> B[/[[...slug]]/page.tsx]
  B --> C[router-app.tsx]
  C --> D{Ruta cliente}
  D -->|/actors| E[views/actors-view.tsx]
  D -->|/crear| F[views/crear-view.tsx]
```

## Flujo de datos (Frontend -> API -> Backend)

```mermaid
flowchart LR
  V[Vista TSX] --> H[useActors() en actor.tsx]
  H --> N[/api/v1/actors o /api/v1/actors/:id]
  N --> B[(Backend real)]
  B --> N
  N --> H
  H --> V
```

## Funciones usadas por archivo `.tsx`

### `app/layout.tsx`
- `RootLayout`: envuelve toda la app.
- `ActorsProvider`: proveedor global de estado.

### `app/[[...slug]]/page.tsx`
- `CatchAllPage`: renderiza `RouterApp`.

### `app/router-app.tsx`
- `RouterApp`: define rutas cliente.
- `useEffect` + `isMounted`: evita SSR de `BrowserRouter`.

### `app/actor.tsx`
- `ActorsProvider`: guarda `actores` y expone CRUD.
- `useActors`: hook para consumir el contexto.
- `mapActor`: normaliza actor recibido.
- `toPayload`: transforma input para API.
- `crearActor`: POST + actualización de estado.
- `actualizarActor`: PUT + actualización de estado.
- `eliminarActor`: DELETE + actualización de estado.

### `app/views/actors-view.tsx`
- Muestra tabla de actores.
- Permite editar actor existente.
- Permite eliminar actor.
- Usa: `useActors`, `actualizarActor`, `eliminarActor`.

### `app/views/crear-view.tsx`
- Formulario para crear actor.
- Usa: `useActors`, `crearActor`.

## Endpoints usados

- `GET /api/v1/actors`
- `POST /api/v1/actors`
- `PUT /api/v1/actors/:id`
- `PATCH /api/v1/actors/:id` (route handler disponible)
- `DELETE /api/v1/actors/:id`

