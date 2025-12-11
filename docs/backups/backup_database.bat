@echo off
echo Backup Base de Datos Botica EcoSalud
echo =====================================

set TIMESTAMP=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%
set BACKUP_FILE=botica_backup_%TIMESTAMP%.sql

echo Creando backup: %BACKUP_FILE%

"C:\xampp\mysql\bin\mysqldump.exe" --user=root --password= --databases botica > %BACKUP_FILE%

if %errorlevel% equ 0 (
    echo Backup completado: %BACKUP_FILE%
) else (
    echo ERROR: No se pudo crear el backup
)

pause
