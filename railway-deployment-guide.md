# 🚀 Guía de Despliegue en Railway - Space Arcade Game

## ✅ Repositorio Subido a GitHub

El proyecto ha sido subido exitosamente a GitHub en la rama `railway-deployment`:
- **Repositorio**: https://github.com/Jojans/Juego-retro-software2
- **Rama**: `railway-deployment`
- **Pull Request**: https://github.com/Jojans/Juego-retro-software2/pull/new/railway-deployment

## 🎯 Pasos para Desplegar en Railway

### 1. **Acceder a Railway**
1. Ve a [railway.app](https://railway.app)
2. Inicia sesión con tu cuenta de GitHub
3. Click en "New Project"

### 2. **Conectar Repositorio**
1. Selecciona "Deploy from GitHub repo"
2. Busca y selecciona `Jojans/Juego-retro-software2`
3. Selecciona la rama `railway-deployment`
4. Click "Deploy Now"

### 3. **Configuración Automática**
Railway detectará automáticamente:
- ✅ `docker-compose.yml` - Orquestación de servicios
- ✅ `railway.json` - Configuración específica de Railway
- ✅ Servicios: Frontend, Backend, PostgreSQL

### 4. **Variables de Entorno**
Railway configurará automáticamente:
- ✅ `DATABASE_URL` - PostgreSQL incluido
- ✅ `NODE_ENV=production`
- ✅ `PORT=4000` (Backend)

**Variables que debes configurar manualmente:**
- `JWT_SECRET`: Genera uno seguro (ej: `tu-super-secreto-jwt-aqui-123456`)
- `CORS_ORIGIN`: URL del frontend (se configurará automáticamente)

### 5. **Servicios que se Desplegarán**

#### **Frontend (React + Phaser.js)**
- **Puerto**: 80 (interno)
- **Tecnología**: Nginx + React build
- **URL**: `https://tu-proyecto.railway.app`

#### **Backend (Node.js + Express)**
- **Puerto**: 4000 (interno)
- **Tecnología**: Node.js + Express + PostgreSQL
- **URL**: `https://tu-proyecto-backend.railway.app`

#### **PostgreSQL Database**
- **Tecnología**: PostgreSQL 15
- **Configuración**: Automática
- **Persistencia**: Volumen persistente

## 🔧 Configuración Post-Despliegue

### 1. **Verificar Servicios**
Una vez desplegado, verifica que todos los servicios estén corriendo:
- Frontend: Debe mostrar la interfaz del juego
- Backend: Debe responder en `/health`
- Base de datos: Debe estar conectada

### 2. **Configurar CORS**
En el dashboard de Railway:
1. Ve a la configuración del Backend
2. Agrega la variable de entorno:
   - `CORS_ORIGIN`: URL del frontend (ej: `https://tu-proyecto.railway.app`)

### 3. **Configurar JWT Secret**
1. Ve a la configuración del Backend
2. Agrega la variable de entorno:
   - `JWT_SECRET`: Genera un string seguro

## 🎮 Características del Despliegue

### **Frontend**
- ✅ Interfaz moderna con React 18
- ✅ Juego funcional con Phaser.js
- ✅ Diseño responsive
- ✅ Navegación completa
- ✅ Sistema de puntuaciones

### **Backend**
- ✅ API REST completa
- ✅ Autenticación JWT
- ✅ Base de datos PostgreSQL
- ✅ WebSockets para tiempo real
- ✅ Sistema de leaderboard

### **Base de Datos**
- ✅ PostgreSQL 15
- ✅ Tablas automáticamente creadas
- ✅ Índices optimizados
- ✅ Persistencia de datos

## 📊 Monitoreo

### **Railway Dashboard**
- Logs en tiempo real
- Métricas de uso
- Variables de entorno
- Estado de servicios

### **Health Checks**
- Frontend: `https://tu-proyecto.railway.app/health`
- Backend: `https://tu-proyecto-backend.railway.app/health`

## 🚨 Solución de Problemas

### **Error: "Database connection failed"**
- Verifica que `DATABASE_URL` esté configurada
- Revisa los logs del backend
- Asegúrate de que PostgreSQL esté corriendo

### **Error: "CORS policy"**
- Configura `CORS_ORIGIN` con la URL correcta del frontend
- Verifica que ambas URLs estén accesibles

### **Error: "Build failed"**
- Revisa los logs de build en Railway
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que no haya errores de TypeScript

## 🎉 ¡Despliegue Exitoso!

Una vez desplegado, tu juego estará disponible en:
- **Frontend**: `https://tu-proyecto.railway.app`
- **Backend API**: `https://tu-proyecto-backend.railway.app`
- **Base de datos**: PostgreSQL incluido

### **Funcionalidades Disponibles**
- 🎮 Juego completo con Phaser.js
- 🏆 Sistema de puntuaciones persistente
- 📊 Leaderboard en tiempo real
- 👤 Sistema de autenticación
- 📱 Diseño responsive
- 🎓 Contenido educativo

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Railway Dashboard
2. Verifica las variables de entorno
3. Consulta la documentación de Railway
4. Revisa este archivo para soluciones comunes

---

¡Tu Space Arcade Game estará online en minutos! 🚀✨
