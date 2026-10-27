# 🛡️ Escuela Segura - Plataforma de Prevención y Convivencia Escolar

Plataforma institucional interactiva para la prevención y resolución pacífica de conflictos escolares, mediación restaurativa, canal de reportes confidenciales con evidencia audiovisual (grabación de video integrada) y seguimiento focalizado para familias y directivos.

---

## 🚀 Despliegue en Vercel

El proyecto ya cuenta con el archivo de configuración `vercel.json` y la función serverless en `/api/chat.ts` listos para desplegarse sin fricción.

### Opción 1: Despliegue desde GitHub / GitLab (Recomendada)

1. Sube este repositorio a tu cuenta de **GitHub** o **GitLab**.
2. Entra en [vercel.com](https://vercel.com) e inicia sesión.
3. Haz clic en **"Add New..."** → **"Project"**.
4. Selecciona tu repositorio y haz clic en **Import**.
5. Vercel detectará automáticamente la configuración:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. *(Opcional)* En la sección **Environment Variables**, añade:
   - `GEMINI_API_KEY`: Tu clave de API de Google Gemini (para habilitar respuestas en tiempo real del mediador inteligente PazBot).
7. Haz clic en **Deploy**. ¡Listo en menos de 1 minuto!

---

### Opción 2: Despliegue directo mediante Vercel CLI

Si tienes instalado Vercel CLI en tu terminal:

```bash
# Iniciar sesión en Vercel (si no lo has hecho)
npx vercel login

# Desplegar en modo vista previa (preview)
npx vercel

# Desplegar directamente a producción
npx vercel --prod
```

---

## ⚙️ Configuración incluida para Vercel

- **`vercel.json`**:
  - Enrutamiento SPA con rewrites a `/index.html` para evitar errores 404 al recargar o navegar directamente a subrutas.
  - Reglas de redirección de API para funciones serverless en `/api/*`.
  - Cabeceras de seguridad HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`).
- **`/api/chat.ts`**:
  - Función serverless Node.js compatible con Vercel para el asistente mediador escolar PazBot con soporte de Gemini y respuestas de contingencia seguras si no se suministra API key.

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Probar la compilación de producción localmente
npm run preview
```
