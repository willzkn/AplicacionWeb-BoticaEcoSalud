@echo off
echo Programando Backup Automatico - Botica EcoSalud
echo ==============================================

REM Configuracion de programacion de tareas
set TASK_NAME=BackupBoticaEcoSalud
set SCRIPT_PATH=%~dp0backup_database.bat
set SCHEDULE_TIME=02:00

echo Creando tarea programada para backup diario...
echo Hora: %SCHEDULE_TIME% (2:00 AM)
echo Script: %SCRIPT_PATH%

REM Eliminar tarea si ya existe
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

REM Crear nueva tarea programada
schtasks /create /tn "%TASK_NAME%" /tr "\"%SCRIPT_PATH%\"" /sc daily /st %SCHEDULE_TIME% /ru SYSTEM /f

if %errorlevel% equ 0 (
    echo.
    echo ====================================
    echo   TAREA PROGRAMADA CREADA
    echo ====================================
    echo Nombre: %TASK_NAME%
    echo Hora: %SCHEDULE_TIME% (diario)
    echo Script: %SCRIPT_PATH%
    echo.
    echo El backup se ejecutara automaticamente todos los dias a las %SCHEDULE_TIME%
    echo.
    echo Para ver la tarea programada:
    echo schtasks /query /tn "%TASK_NAME%"
    echo.
    echo Para eliminar la tarea programada:
    echo schtasks /delete /tn "%TASK_NAME%" /f
) else (
    echo.
    echo ERROR: No se pudo crear la tarea programada
    echo Asegurate de ejecutar este script como Administrador
)

echo.
pause
