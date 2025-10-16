@echo off
echo ========================================
echo    SPACE ARCADE - DESPLIEGUE COMPLETO
echo ========================================
echo.

echo Selecciona una opcion de despliegue:
echo.
echo 1. Railway (Recomendado - Full Stack)
echo 2. Render (Alternativo - Full Stack)
echo 3. Netlify + Railway (Separado)
echo 4. Solo Frontend (Netlify)
echo 5. Solo Backend (Railway)
echo 6. Docker Local
echo.

set /p choice="Ingresa tu opcion (1-6): "

if "%choice%"=="1" goto railway
if "%choice%"=="2" goto render
if "%choice%"=="3" goto netlify-railway
if "%choice%"=="4" goto netlify-only
if "%choice%"=="5" goto railway-backend
if "%choice%"=="6" goto docker-local
goto invalid

:railway
echo.
echo ========================================
echo    DESPLIEGUE EN RAILWAY
echo ========================================
echo.
echo Pasos a seguir:
echo 1. Ve a https://railway.app
echo 2. Inicia sesion con GitHub
echo 3. Click "New Project"
echo 4. Selecciona "Deploy from GitHub repo"
echo 5. Conecta este repositorio
echo 6. Railway detectara automaticamente docker-compose.yml
echo 7. Configura las variables de entorno:
echo    - DATABASE_URL (se crea automaticamente)
echo    - JWT_SECRET (genera uno seguro)
echo    - CORS_ORIGIN (URL del frontend)
echo 8. Click "Deploy"
echo.
echo Tu aplicacion estara disponible en:
echo - Frontend: https://tu-proyecto.railway.app
echo - Backend: https://tu-proyecto-backend.railway.app
echo - Base de datos: PostgreSQL incluida
echo.
pause
goto end

:render
echo.
echo ========================================
echo    DESPLIEGUE EN RENDER
echo ========================================
echo.
echo Pasos a seguir:
echo 1. Ve a https://render.com
echo 2. Inicia sesion con GitHub
echo 3. Click "New +" ^> "Blueprint"
echo 4. Conecta este repositorio
echo 5. Render detectara render.yaml automaticamente
echo 6. Configura las variables de entorno
echo 7. Click "Apply"
echo.
echo Tu aplicacion estara disponible en:
echo - Frontend: https://space-arcade-frontend.onrender.com
echo - Backend: https://space-arcade-backend.onrender.com
echo - Base de datos: PostgreSQL incluida
echo.
pause
goto end

:netlify-railway
echo.
echo ========================================
echo    DESPLIEGUE SEPARADO
echo ========================================
echo.
echo FRONTEND (Netlify):
echo 1. Ve a https://netlify.com
echo 2. Arrastra la carpeta "netlify-deploy"
echo 3. Configura la URL del backend en las variables de entorno
echo.
echo BACKEND (Railway):
echo 1. Ve a https://railway.app
echo 2. Deploy solo el backend
echo 3. Configura las variables de entorno
echo.
echo VENTAJAS:
echo - Frontend gratuito en Netlify
echo - Backend potente en Railway
echo - Control total sobre cada servicio
echo.
pause
goto end

:netlify-only
echo.
echo ========================================
echo    SOLO FRONTEND (NETLIFY)
echo ========================================
echo.
echo Pasos a seguir:
echo 1. Ve a https://netlify.com
echo 2. Arrastra la carpeta "netlify-deploy"
echo 3. ¡Listo! Tu juego estara online
echo.
echo LIMITACIONES:
echo - Sin base de datos
echo - Sin sistema de puntuaciones persistente
echo - Solo juego local
echo.
echo Tu juego estara en: https://tu-sitio.netlify.app
echo.
pause
goto end

:railway-backend
echo.
echo ========================================
echo    SOLO BACKEND (RAILWAY)
echo ========================================
echo.
echo Pasos a seguir:
echo 1. Ve a https://railway.app
echo 2. Deploy solo el backend
echo 3. Configura PostgreSQL
echo 4. Obtén la URL del API
echo 5. Usa el frontend localmente con el backend remoto
echo.
echo Tu API estara en: https://tu-backend.railway.app
echo.
pause
goto end

:docker-local
echo.
echo ========================================
echo    DOCKER LOCAL
echo ========================================
echo.
echo Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker no esta instalado
    echo Instala Docker Desktop desde https://www.docker.com
    pause
    goto end
)

echo Docker esta instalado
echo.
echo Construyendo imagenes...
docker-compose build

echo.
echo Iniciando servicios...
docker-compose up -d

echo.
echo ¡Listo! Tu aplicacion esta corriendo en:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:4000
echo - Base de datos: localhost:5432
echo.
echo Para detener: docker-compose down
echo.
pause
goto end

:invalid
echo.
echo Opcion invalida. Por favor selecciona 1-6.
echo.
pause
goto end

:end
echo.
echo ========================================
echo    DESPLIEGUE COMPLETADO
echo ========================================
echo.
echo ¡Gracias por usar Space Arcade Game!
echo.
pause
