# Validación de tarjetas en Botica EcoSalud

Este documento describe cómo el front-end valida que un número de tarjeta ingresado en el checkout corresponde a una tarjeta real antes de intentar procesar el pago. Toda la lógica se encuentra en `src/views/pages/CarritoView.jsx`.

## Resumen del flujo
1. **Normalización de entrada:** el campo `numeroTarjeta` elimina caracteres no numéricos y se agrupa en bloques de cuatro dígitos para mostrar al usuario (`formatCardNumber`).
2. **Verificación de longitud:** la función `isValidCardNumber` exige entre 13 y 19 dígitos antes de continuar @Botica-FrontEnd/src/views/pages/CarritoView.jsx#59-63.
3. **Algoritmo de Luhn:** se implementa en `luhnCheck`, que recorre los dígitos de derecha a izquierda, duplica cada segundo dígito y resta 9 si el resultado supera 9. La suma total debe ser múltiplo de 10 para que la tarjeta sea considerada válida @Botica-FrontEnd/src/views/pages/CarritoView.jsx#35-57.
4. **Validaciones adicionales:** además del número, se valida la fecha de expiración, el CVV y la selección de cuotas si corresponde.

## Detalle del algoritmo de Luhn
`luhnCheck` recibe únicamente dígitos:

- Recorre cada dígito desde el final.
- Duplica cada segundo dígito (empezando por el penúltimo). Si el resultado es mayor a 9, le resta 9.
- Acumula la suma de todos los dígitos procesados.
- Devuelve `true` solo si la suma total es divisible entre 10.

Esto permite detectar la mayoría de errores de tipeo comunes (inversión de dígitos, incremento por uno, etc.).

## Validaciones del formulario de pago
La función `validatePaymentData` centraliza las comprobaciones cuando se intenta guardar la tarjeta @Botica-FrontEnd/src/views/pages/CarritoView.jsx#296-335:

| Campo | Validación |
| --- | --- |
| Número de tarjeta | Debe estar presente, tener longitud válida y pasar `luhnCheck`. |
| Nombre del titular | No puede estar vacío. |
| Fecha de expiración | Debe respetar el formato `MM/AA`, tener mes válido y no estar vencida (`getExpiryValidationError`). |
| CVV | Debe contener exactamente 3 dígitos numéricos. |
| Cuotas | Obligatorio cuando `tipoTarjeta` es crédito. |

Si cualquiera de estas validaciones falla, se muestra un mensaje de error específico y se impide continuar con el flujo de pago hasta corregirlo.

## Cómo extender la validación
- **Marcas específicas:** si se necesita validar prefijos (BIN) para distintas marcas, se puede añadir una verificación antes de ejecutar el algoritmo de Luhn.
- **CVV de 4 dígitos:** para tarjetas tipo Amex u otras con CVV de 4 dígitos, ajusta la expresión regular en la validación de `cvv`.
- **Prevención de fraude:** combinar esta validación con servicios del backend (por ejemplo, tokenización o verificación 3D Secure) ofrece una defensa más robusta.

## Consideraciones de seguridad
Aunque el front-end evita errores de captura, **la validación definitiva debe ocurrir en el servidor**. El algoritmo de Luhn no confirma si la tarjeta está activa ni si tiene fondos; solo detecta números matemáticamente válidos. Asegúrate de que el backend replique o refuerce estas comprobaciones antes de procesar pagos reales.
