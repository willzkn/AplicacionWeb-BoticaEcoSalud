@echo off
echo Procesando Pedidos Automaticamente - Botica EcoSalud
echo ===============================================

set TIMESTAMP=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%
set LOG_FILE=logs\procesamiento_pedidos_%TIMESTAMP%.log

REM Crear directorio de logs si no existe
if not exist "logs" mkdir logs

echo [%date% %time%] Iniciando procesamiento de pedidos... >> %LOG_FILE%

REM Conectar a MySQL y procesar pedidos pendientes
"C:\xampp\mysql\bin\mysql.exe" --user=root --password= botica -e "
-- Actualizar pedidos pendientes a 'EN_PROCESO'
UPDATE pedidos 
SET estado = 'EN_PROCESO', fecha_actualizacion = NOW() 
WHERE estado = 'PENDIENTE' 
AND fechaPedido <= CURDATE() - INTERVAL 1 DAY;

-- Enviar notificaciones (simulado)
INSERT INTO logs_procesamiento (mensaje, fecha) 
VALUES ('Pedidos procesados automaticamente', NOW());

-- Actualizar stock basado en pedidos confirmados
UPDATE productos p 
INNER JOIN detalle_pedido dp ON p.id_producto = dp.idProducto 
INNER JOIN pedidos ped ON dp.idPedido = ped.idPedido 
SET p.stock = p.stock - dp.cantidad 
WHERE ped.estado = 'CONFIRMADO' 
AND ped.fechaPedido >= CURDATE() - INTERVAL 1 DAY;
" >> %LOG_FILE% 2>&1

if %errorlevel% equ 0 (
    echo [%date% %time%] Procesamiento completado exitosamente >> %LOG_FILE%
    echo Procesamiento de pedidos completado
) else (
    echo [%date% %time%] ERROR en procesamiento de pedidos >> %LOG_FILE%
    echo ERROR: No se pudo procesar los pedidos
)

echo Log guardado en: %LOG_FILE%
echo.
pause
