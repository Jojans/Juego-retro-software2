@echo off
echo ====================================
echo  SPACE ARCADE - EJECUTAR JUEGO
echo ====================================
echo.

echo Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo  Docker no esta instalado o no funciona
    echo.
    echo SOLUCION: Instala Docker Desktop desde https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Docker esta instalado

echo.
echo Verificando conexion a Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker no esta ejecutandose
    echo.
    echo SOLUCION: Abre Docker Desktop y espera a que se inicialice
    echo Busca el icono de ballena en la bandeja del sistema
    pause
    exit /b 1
)

echo Docker esta ejecutandose

echo.
echo Verificando Docker Compose...
docker compose version >nul 2>&1
if errorlevel 1 (
    echo  Docker Compose no funciona
    pause
    exit /b 1
)

echo Docker Compose funciona

echo.
echo ====================================
echo  VERIFICANDO IMAGENES NECESARIAS
echo ====================================
echo.

set need_download=0

echo Verificando imagen de PostgreSQL...
docker images | findstr "postgres:15-alpine" >nul 2>&1
if errorlevel 1 (
    echo Imagen de PostgreSQL no encontrada
    set need_download=1
) else (
    echo Imagen de PostgreSQL encontrada
)

echo Verificando imagenes del proyecto...
docker images | findstr "juego_software-main-backend" >nul 2>&1
if errorlevel 1 (
    echo  Imagen del backend no encontrada
    set need_download=1
) else (
    echo Imagen del backend encontrada
)

docker images | findstr "juego_software-main-frontend" >nul 2>&1
if errorlevel 1 (
    echo Imagen del frontend no encontrada
    set need_download=1
) else (
    echo Imagen del frontend encontrada
)

echo.
if "%need_download%"=="1" (
    echo ====================================
    echo  DESCARGANDO IMAGENES FALTANTES
    echo ====================================
    echo.
    echo Descargando imagenes necesarias...
    echo Esto puede tomar 5-10 minutos en la primera ejecucion.
    echo.
    
    echo Descargando PostgreSQL...
    docker pull postgres:15-alpine
    if errorlevel 1 (
        echo Error descargando PostgreSQL
        echo Verifica tu conexion a internet
        pause
        exit /b 1
    )
    
    echo Construyendo imagen del backend...
    docker build -t juego_software-main-backend ./backend
    if errorlevel 1 (
        echo Error construyendo backend
        pause
        exit /b 1
    )
    
    echo Construyendo imagen del frontend...
    docker build -t juego_software-main-frontend ./frontend
    if errorlevel 1 (
        echo Error construyendo frontend
        pause
        exit /b 1
    )
    
    echo Todas las imagenes han sido descargadas
) else (
    echo Todas las imagenes necesarias estan disponibles
)

echo.
echo ====================================
echo  INICIANDO JUEGO
echo ====================================
echo.

echo Deteniendo contenedores existentes (si los hay)...
docker compose down >nul 2>&1

echo Iniciando contenedores...
docker compose up -d
if errorlevel 1 (
    echo Error iniciando contenedores
    echo.
    echo Revisa los errores anteriores
    echo Intenta ejecutar: docker compose logs
    pause
    exit /b 1
)

echo Contenedores iniciados correctamente

echo.
echo ====================================
echo  JUEGO INICIADO EXITOSAMENTE
echo ====================================
echo.
echo El juego esta disponible en:
echo    http://localhost:3000
echo.
echo API del backend en:
echo    http://localhost:4000
echo.
echo Base de datos en:
echo    localhost:5432
echo.

echo Esperando 5 segundos para que los servicios se inicialicen...
timeout /t 5 /nobreak >nul

echo Abriendo el juego en tu navegador...
start http://localhost:3000

echo.
echo ¡Listo! El juego deberia haberse abierto en tu navegador.
echo.
echo Para detener el juego, ejecuta: stop-juego.bat
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul