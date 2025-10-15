@echo off
echo ====================================
echo  DETENER JUEGO SPACE ARCADE
echo ====================================
echo.

echo Deteniendo contenedores del juego...
docker compose down

if errorlevel 1 (
    echo Algunos contenedores no se pudieron detener correctamente
    echo.
    echo Intentando forzar el cierre...
    docker compose down --remove-orphans
) else (
    echo Contenedores detenidos correctamente
)

echo.
echo Limpiando contenedores huérfanos...
docker container prune -f >nul 2>&1

echo.
echo ====================================
echo  JUEGO DETENIDO
echo ====================================
echo.
echo El juego ha sido detenido exitosamente.
echo.
echo Para volver a jugar, ejecuta: jugar-ahora.bat
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul

