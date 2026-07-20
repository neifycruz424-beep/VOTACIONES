# Plataforma de Votaciones Internas

Sistema profesional de votaciones internas desarrollado con React, TypeScript, Tailwind CSS y Supabase.

## Características

- **Sistema de Votación Completo**: Interfaz intuitiva para votantes con validación de identidad
- **Panel Administrativo**: Gestión completa de elecciones, candidatos, planchas y votantes
- **Resultados en Tiempo Real**: Visualización de resultados con gráficos interactivos
- **Seguridad**: Validación de votos únicos, Row Level Security (RLS) en Supabase
- **Diseño Responsive**: Funciona en desktop, tablet y dispositivos móviles
- **Arquitectura Profesional**: Código limpio, modular y escalable

## Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Almacenamiento**: Supabase Storage
- **Enrutamiento**: React Router
- **Formularios**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Iconos**: Lucide React

## Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (gratis)

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd VOTACIONES
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

#### 3.1 Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta y un nuevo proyecto
3. Espera a que el proyecto esté listo (2-3 minutos)

#### 3.2 Ejecutar el script SQL

1. En tu dashboard de Supabase, ve a "SQL Editor"
2. Crea un nuevo query
3. Copia y pega el contenido del archivo `supabase/schema.sql`
4. Ejecuta el script

Esto creará todas las tablas necesarias con sus políticas RLS.

#### 3.3 Crear bucket de almacenamiento

1. Ve a "Storage" en el dashboard de Supabase
2. Crea un nuevo bucket llamado `candidate-photos`
3. Haz el bucket público
4. Configura las políticas RLS para permitir uploads públicos

#### 3.4 Obtener credenciales

1. Ve a "Settings" > "API" en tu dashboard de Supabase
2. Copia:
   - Project URL
   - anon public key

### 4. Configurar variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

2. Edita `.env` con tus credenciales:

```env
VITE_SUPABASE_URL=tu_supabase_project_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_ADMIN_EMAIL=admin@example.com
VITE_ADMIN_PASSWORD=tu_contraseña_segura
```

### 5. Ejecutar el proyecto

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Uso

### Para Votantes

1. Accede a la URL de la aplicación
2. Haz clic en "Iniciar Votación"
3. Ingresa tu código de votante (proporcionado por el administrador)
4. Selecciona un candidato para cada cargo
5. Confirma tu voto
6. Recibe confirmación de que tu voto fue registrado

### Para Administradores

1. Accede a la URL de la aplicación
2. Haz clic en "Acceso Administrativo"
3. Ingresa tus credenciales (configuradas en `.env`)
4. Desde el dashboard puedes:
   - Ver estadísticas generales
   - Gestionar cargos (posiciones electivas)
   - Registrar candidatos con fotos
   - Administrar planchas
   - Registrar votantes autorizados
   - Ver resultados en tiempo real

## Estructura del Proyecto

```
src/
├── components/       # Componentes UI reutilizables
│   └── ui/          # Button, Card, Input, Modal, etc.
├── pages/           # Páginas de la aplicación
├── services/        # Servicios de Supabase
├── lib/            # Configuración de Supabase
├── types/          # Definiciones TypeScript
├── utils/          # Utilidades
└── assets/         # Archivos estáticos
```

## Despliegue en Vercel

### 1. Preparar el proyecto

```bash
npm run build
```

### 2. Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Importa tu repositorio de GitHub
3. Configura las variables de entorno en Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAIL`
   - `VITE_ADMIN_PASSWORD`

4. Haz clic en "Deploy"

Vercel detectará automáticamente que es un proyecto Vite y lo configurará correctamente.

### 3. Configurar dominio personal (opcional)

1. En tu dashboard de Vercel, ve a "Settings" > "Domains"
2. Agrega tu dominio personal
3. Configura los DNS según las instrucciones de Vercel

## Seguridad

### Implementada

- **Row Level Security (RLS)**: Políticas de seguridad a nivel de fila en Supabase
- **Validación de votos únicos**: Un votante solo puede votar una vez
- **No modificación de votos**: Una vez registrado, un voto no puede modificarse
- **Validación frontend**: Validaciones en el formulario de votación
- **Autenticación admin**: Sistema simple de autenticación para administradores

### Recomendaciones de producción

1. **Cambiar credenciales admin**: Usa contraseñas fuertes y únicas
2. **HTTPS**: Asegúrate de usar HTTPS en producción
3. **Rate limiting**: Implementa rate limiting en Supabase
4. **Backup**: Configura backups automáticos en Supabase
5. **Monitoreo**: Configura monitoreo de errores y rendimiento

## Solución de Problemas

### Error: "Missing Supabase environment variables"

Asegúrate de que el archivo `.env` existe y contiene las variables necesarias.

### Error: "Código de votante no encontrado"

Verifica que:
- El votante esté registrado en la base de datos
- El código ingresado sea correcto
- El votante no haya votado previamente

### Error: "Error al cargar los datos"

Verifica que:
- Las credenciales de Supabase sean correctas
- Las políticas RLS estén configuradas correctamente
- El proyecto de Supabase esté activo

## Desarrollo

### Scripts disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Compilar para producción
npm run preview      # Previsualizar build de producción
npm run lint         # Ejecutar ESLint
```

### Agregar nuevas funcionalidades

1. **Nuevas páginas**: Agrega en `src/pages/`
2. **Nuevos componentes**: Agrega en `src/components/`
3. **Nuevos servicios**: Agrega en `src/services/`
4. **Nuevos tipos**: Agrega en `src/types/`

## Contribución

Este es un proyecto interno. Para contribuir:

1. Crea una rama para tu feature
2. Haz commits descriptivos
3. Abre un pull request
4. Espera revisión y aprobación

## Licencia

Propiedad interna. Todos los derechos reservados.

## Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.
