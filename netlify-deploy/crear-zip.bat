@echo off
echo ========================================
echo    CREANDO ZIP PARA NETLIFY
echo ========================================
echo.

echo Creando archivo ZIP para facilitar el envio...
powershell Compress-Archive -Path ".\*" -DestinationPath "..\space-arcade-game-netlify.zip" -Force

echo.
echo ✅ Archivo creado: space-arcade-game-netlify.zip
echo.
echo Ahora puedes:
echo 1. Subir el ZIP a Netlify (arrastrar y soltar)
echo 2. O subir la carpeta completa
echo.
pause
