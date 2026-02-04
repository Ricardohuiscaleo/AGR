# 🚀 Deploy a Easypanel

## Pasos para desplegar

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

### 2. Configurar en Easypanel

1. Conecta tu repositorio de GitHub
2. Selecciona el proyecto
3. Configura las variables de entorno:

```env
PUBLIC_SUPABASE_URL=tu-url-supabase
PUBLIC_SUPABASE_ANON_KEY=tu-key-supabase
GOOGLE_GEMINI_API_KEY=tu-key-gemini
NODE_ENV=production
```

4. Easypanel detectará automáticamente el Dockerfile
5. Click en "Deploy"

### 3. Dominio personalizado

En Easypanel:
- Ve a Settings → Domains
- Agrega tu dominio personalizado
- Configura los DNS según las instrucciones

## Puerto

La aplicación corre en el puerto **4321**
