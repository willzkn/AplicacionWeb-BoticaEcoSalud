package com.botica.botica_backend.Service;

import com.botica.botica_backend.Config.MercadoPagoProperties;
import com.botica.botica_backend.Model.Detalle_pedido;
import com.botica.botica_backend.Model.Pedido;
import com.botica.botica_backend.Model.Producto;
import com.botica.botica_backend.Model.Usuario;
import com.botica.botica_backend.Repository.PedidoRepository;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferencePayerRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.preference.Preference;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MercadoPagoService {

    private final MercadoPagoProperties properties;
    private final PedidoRepository pedidoRepository;

    @PostConstruct
    public void configureSDK() {
        if (properties.getAccessToken() == null || properties.getAccessToken().isBlank()) {
            log.warn("Mercado Pago access token is not configured. Checkout Pro will not work until it is set.");
            return;
        }
        MercadoPagoConfig.setAccessToken(properties.getAccessToken());
    }

    public PreferenceData createPreference(Pedido pedido) {
        if (pedido == null || pedido.getIdPedido() == null) {
            throw new IllegalArgumentException("Pedido inválido para generar preferencia");
        }

        Usuario usuario = pedido.getUsuario();
        if (usuario == null) {
            throw new IllegalArgumentException("El pedido no tiene un usuario asociado");
        }

        List<Detalle_pedido> detalles = pedido.getDetalles();
        if (detalles == null || detalles.isEmpty()) {
            throw new IllegalArgumentException("El pedido no contiene detalles");
        }

        List<PreferenceItemRequest> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Detalle_pedido detalle : detalles) {
            int cantidad = detalle.getCantidad() != null ? detalle.getCantidad() : 0;
            if (cantidad <= 0) {
                continue;
            }

            Producto producto = detalle.getProducto();
            String nombreProducto = producto != null && producto.getNombre() != null
                    ? producto.getNombre()
                    : "Producto";

            BigDecimal unitPrice;
            if (detalle.getPrecioUnitario() != null) {
                unitPrice = BigDecimal.valueOf(detalle.getPrecioUnitario());
            } else if (producto != null && producto.getPrecio() != null) {
                unitPrice = BigDecimal.valueOf(producto.getPrecio());
            } else {
                unitPrice = BigDecimal.ZERO;
            }

            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(cantidad));
            total = total.add(subtotal);

            PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                    .id(producto != null && producto.getIdProducto() != null
                            ? String.valueOf(producto.getIdProducto())
                            : String.valueOf(detalle.getIdDetalle()))
                    .title(nombreProducto)
                    .currencyId("PEN")
                    .quantity(cantidad)
                    .unitPrice(unitPrice)
                    .build();
            items.add(itemRequest);
        }

        if (items.isEmpty()) {
            throw new IllegalArgumentException("No fue posible generar items de pago para el pedido");
        }

        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            if (pedido.getTotal() != null) {
                total = BigDecimal.valueOf(pedido.getTotal());
            } else {
                throw new IllegalArgumentException("El pedido no tiene un total válido");
            }
        }

        PreferencePayerRequest payerRequest = PreferencePayerRequest.builder()
                .name(usuario.getNombres())
                .surname(usuario.getApellidos())
                .email(usuario.getEmail())
                .build();

        String defaultSuccess = "http://localhost:3000/pago-resultado?status=success";
        String defaultFailure = "http://localhost:3000/pago-resultado?status=failure";
        String defaultPending = "http://localhost:3000/pago-resultado?status=pending";

        String successUrl = properties.getBackUrlSuccess();
        String failureUrl = properties.getBackUrlFailure();
        String pendingUrl = properties.getBackUrlPending();

        if (successUrl == null || successUrl.isBlank()) {
            successUrl = defaultSuccess;
            log.warn("[MercadoPago] backUrlSuccess no configurado. Usando valor por defecto: {}", successUrl);
        }
        if (failureUrl == null || failureUrl.isBlank()) {
            failureUrl = defaultFailure;
        }
        if (pendingUrl == null || pendingUrl.isBlank()) {
            pendingUrl = defaultPending;
        }

        PreferenceBackUrlsRequest backUrlsRequest = PreferenceBackUrlsRequest.builder()
                .success(successUrl)
                .failure(failureUrl)
                .pending(pendingUrl)
                .build();

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("pedidoId", pedido.getIdPedido());
        metadata.put("usuarioId", usuario.getIdUsuario());
        metadata.put("total", total);

        String externalReference = "PED-" + pedido.getIdPedido();

        var preferenceBuilder = PreferenceRequest.builder()
                .items(items)
                .payer(payerRequest)
                .backUrls(backUrlsRequest)
                .notificationUrl(properties.getNotificationUrl())
                .externalReference(externalReference)
                .metadata(metadata)
                .statementDescriptor("BoticaEcoSalud");

        if (successUrl != null && successUrl.startsWith("https://")) {
            preferenceBuilder.autoReturn("approved");
        } else if (successUrl != null && !successUrl.startsWith("https://")) {
            log.warn("[MercadoPago] autoReturn omitido porque la backUrl success no es HTTPS: {}", successUrl);
        }

        PreferenceRequest preferenceRequest = preferenceBuilder.build();

        PreferenceClient client = new PreferenceClient();
        Preference preference;
        try {
            preference = client.create(preferenceRequest);
        } catch (MPApiException e) {
            var apiResponse = e.getApiResponse();
            Integer status = apiResponse != null ? apiResponse.getStatusCode() : null;
            if (apiResponse != null) {
                log.error("[MercadoPago] API error {} - {}", status, apiResponse.getContent(), e);
            } else {
                log.error("[MercadoPago] API error sin detalle adicional", e);
            }
            throw new RuntimeException("No se pudo generar la preferencia de pago", e);
        } catch (MPException e) {
            log.error("[MercadoPago] Error creando preferencia", e);
            throw new RuntimeException("No se pudo generar la preferencia de pago", e);
        }

        return new PreferenceData(
                preference.getId(),
                preference.getInitPoint(),
                preference.getSandboxInitPoint(),
                total
        );
    }

    public record PaymentResult(
        boolean approved,
        String paymentId,
        String status,
        String statusDetail
    ) {}

    public PaymentResult processPayment(String token, Integer installments, double amount) {
        try {
            // Por ahora, simular un pago exitoso para pruebas
            // En producción, aquí iría la llamada real a la API de MercadoPago
            log.info("[MercadoPago] Procesando pago simulado - amount: {}, installments: {}", amount, installments);
            
            return new PaymentResult(
                    true, // approved
                    "SIM_" + System.currentTimeMillis(), // paymentId simulado
                    "approved",
                    "Pago aprobado en modo de prueba"
            );

        } catch (Exception e) {
            log.error("[MercadoPago] Error procesando pago", e);
            throw new RuntimeException("Error procesando pago con MercadoPago", e);
        }
    }

    public void handleNotification(Map<String, String> queryParams, Map<String, Object> body) {
        String topic = queryParams.getOrDefault("type", queryParams.getOrDefault("topic", ""));
        String dataId = queryParams.get("data.id");
        if (dataId == null && body != null) {
            Object data = body.get("data");
            if (data instanceof Map<?, ?> dataMap) {
                Object idValue = dataMap.get("id");
                if (idValue != null) {
                    dataId = String.valueOf(idValue);
                }
            }
        }

        log.info("[MercadoPago] Webhook recibido. topic={}, dataId={}, queryParams={}, body={}", topic, dataId, queryParams, body);

        if ("payment".equalsIgnoreCase(topic) && dataId != null) {
            try {
                PaymentClient paymentClient = new PaymentClient();
                Payment payment = paymentClient.get(Long.parseLong(dataId));
                log.info("[MercadoPago] Pago consultado. id={}, status={}, statusDetail={}, externalReference={}",
                        payment.getId(), payment.getStatus(), payment.getStatusDetail(), payment.getExternalReference());

                actualizarPedidoDesdePago(payment);
            } catch (MPException | MPApiException e) {
                log.warn("[MercadoPago] Error consultando pago {}", dataId, e);
            } catch (NumberFormatException e) {
                log.warn("[MercadoPago] data.id inesperado: {}", dataId, e);
            }
        }
    }

    public PaymentStatusResult confirmarPagoManual(Long paymentId) {
        try {
            PaymentClient paymentClient = new PaymentClient();
            Payment payment = paymentClient.get(paymentId);
            Optional<Pedido> pedidoActualizado = actualizarPedidoDesdePago(payment);
            Pedido pedido = pedidoActualizado.orElse(null);
            String estadoPedido = pedido != null ? pedido.getEstado() : null;

            return new PaymentStatusResult(
                    payment.getId(),
                    payment.getStatus(),
                    payment.getStatusDetail(),
                    payment.getExternalReference(),
                    estadoPedido,
                    pedido
            );
        } catch (MPException | MPApiException e) {
            log.warn("[MercadoPago] Error consultando pago {}", paymentId, e);
            throw new RuntimeException("No se pudo consultar el pago en Mercado Pago", e);
        }
    }

    private Optional<Pedido> actualizarPedidoDesdePago(Payment payment) {
        if (payment == null) {
            return Optional.empty();
        }

        String externalReference = payment.getExternalReference();
        if (externalReference == null || !externalReference.startsWith("PED-")) {
            log.warn("[MercadoPago] externalReference inesperado: {}", externalReference);
            return Optional.empty();
        }

        try {
            Long pedidoId = Long.parseLong(externalReference.replace("PED-", ""));
            return pedidoRepository.findById(pedidoId).map(pedido -> {
                String status = payment.getStatus() != null ? payment.getStatus().toLowerCase() : "";

                switch (status) {
                    case "approved" -> pedido.setEstado("COMPLETADO");
                    case "rejected", "cancelled", "refunded", "charged_back" -> pedido.setEstado("CANCELADO");
                    case "in_process", "pending", "authorized" -> pedido.setEstado("PENDIENTE_MP");
                    default -> pedido.setEstado("PENDIENTE_MP");
                }

                if (payment.getTransactionAmount() != null) {
                    pedido.setTotal(payment.getTransactionAmount().doubleValue());
                }

                Pedido actualizado = pedidoRepository.save(pedido);
                log.info("[MercadoPago] Pedido {} actualizado con estado {}", pedidoId, pedido.getEstado());
                return actualizado;
            });
        } catch (NumberFormatException e) {
            log.warn("[MercadoPago] No se pudo convertir externalReference {}", externalReference, e);
            return Optional.empty();
        }
    }

    public record PreferenceData(String preferenceId, String initPoint, String sandboxInitPoint, BigDecimal total) {
    }

    public record PaymentStatusResult(
            Long paymentId,
            String paymentStatus,
            String paymentStatusDetail,
            String externalReference,
            String pedidoEstado,
            Pedido pedidoActualizado
    ) {
    }
}
