@echo off
echo ========================================
echo    SPACE ARCADE GAME - DEPLOYMENT
echo ========================================
echo.

echo Selecciona una opcion de despliegue:
echo.
echo 1. GitHub Pages (Recomendado)
echo 2. Netlify (Arrastrar y soltar)
echo 3. Surge.sh (Rapido)
echo 4. Vercel
echo 5. Solo preparar archivos
echo.

set /p choice="Ingresa tu opcion (1-5): "

if "%choice%"=="1" goto github
if "%choice%"=="2" goto netlify
if "%choice%"=="3" goto surge
if "%choice%"=="4" goto vercel
if "%choice%"=="5" goto prepare
goto invalid

:github
echo.
echo ========================================
echo    DESPLIEGUE EN GITHUB PAGES
echo ========================================
echo.
echo Pasos a seguir:
echo 1. Sube este proyecto a GitHub
echo 2. Ve a Settings ^> Pages
echo 3. Selecciona "Deploy from a branch"
echo 4. Elige "main" branch
echo 5. Click "Save"
echo.
echo Tu juego estara en: https://tuusuario.github.io/nombre-repositorio
echo.
pause
goto end

:netlify
echo.
echo ========================================
echo    DESPLIEGUE EN NETLIFY
echo ========================================
echo.
echo Pasos a seguir:
echo 1. Ve a https://netlify.com
echo 2. Arrastra esta carpeta a la zona de deploy
echo 3. ¡Listo! Tu juego estara desplegado
echo.
echo O conecta tu repositorio de GitHub para deploy automatico
echo.
pause
goto end

:surge
echo.
echo ========================================
echo    DESPLIEGUE EN SURGE.SH
echo ========================================
echo.
echo Instalando surge...
npm install -g surge
echo.
echo Desplegando...
surge
echo.
pause
goto end

:vercel
echo.
echo ========================================
echo    DESPLIEGUE EN VERCEL
echo ========================================
echo.
echo Pasos a seguir:
echo 1. Ve a https://vercel.com
echo 2. Conecta tu cuenta de GitHub
echo 3. Importa este repositorio
echo 4. Deploy automatico
echo.
pause
goto end

:prepare
echo.
echo ========================================
echo    PREPARANDO ARCHIVOS
echo ========================================
echo.
echo Verificando estructura del proyecto...
if not exist "index.html" (
    echo ERROR: index.html no encontrado
    pause
    goto end
)
if not exist "Proyecto" (
    echo ERROR: Carpeta Proyecto no encontrada
    pause
    goto end
)
echo.
echo ✅ Archivos listos para despliegue
echo.
echo Estructura del proyecto:
dir /b
echo.
echo Puedes subir estos archivos a cualquier plataforma de hosting
echo.
pause
goto end

:invalid
echo.
echo Opcion invalida. Por favor selecciona 1-5.
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

