# 🤖 Agente RAG Website

Sitio web completo con sistema de autenticación, generación de blogs con IA, y dashboard administrativo construido con Astro, React y Supabase.

## 🚀 Características

- **🔐 Autenticación completa** con Supabase y Google OAuth
- **🤖 Generación de blogs con IA** usando Google Gemini
- **📊 Dashboard administrativo** con gestión de contenido
- **💨 Rendimiento optimizado** con Astro SSR
- **🎨 Interfaz moderna** con Tailwind CSS y animaciones
- **📱 Completamente responsive**

## 🛠️ Tecnologías

- **Frontend**: Astro, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Astro SSR, Node.js
- **Base de datos**: Supabase
- **IA**: Google Gemini API
- **Autenticación**: Supabase Auth + Google OAuth

## 🚀 Deploy

Este proyecto está configurado para desplegarse en Railway con dominio personalizado.

### Variables de entorno requeridas:
```
PUBLIC_SUPABASE_URL=your-supabase-url
PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
```

## 📦 Instalación Local

```bash
npm install
npm run dev
```

## 🏗️ Build para Producción

```bash
npm run build
npm start
```
