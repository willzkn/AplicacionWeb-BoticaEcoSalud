@echo off
echo Procesamiento Automatico de Pedidos - Botica EcoSalud
echo ================================================

REM Configuracion
set TASK_NAME=ProcesamientoPedidosBotica
set SCRIPT_PATH=%~dp0procesar_pedidos.bat
set SCHEDULE_TIME=09:00

echo Creando tarea programada para procesamiento de pedidos...
echo Hora: %SCHEDULE_TIME% (9:00 AM diario)
echo Script: %SCRIPT_PATH%

REM Eliminar tarea si ya existe
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

REM Crear nueva tarea programada
schtasks /create /tn "%TASK_NAME%" /tr "\"%SCRIPT_PATH%\"" /sc daily /st %SCHEDULE_TIME% /ru SYSTEM /f

if %errorlevel% equ 0 (
    echo.
    echo ====================================
    echo   CRON JOB DE PEDIDOS CREADO
    echo ====================================
    echo Nombre: %TASK_NAME%
    echo Hora: %SCHEDULE_TIME% (diario)
    echo Script: %SCRIPT_PATH%
    echo.
    echo El procesamiento de pedidos se ejecutara automaticamente todos los dias
    echo.
    echo Para ver la tarea:
    echo schtasks /query /tn "%TASK_NAME%"
    echo.
    echo Para eliminar la tarea:
    echo schtasks /delete /tn "%TASK_NAME%" /f
) else (
    echo.
    echo ERROR: No se pudo crear el cron job de pedidos
    echo Asegurate de ejecutar como Administrador
)

echo.
pause
