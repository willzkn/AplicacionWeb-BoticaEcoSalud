package com.botica.botica_backend.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    // ===============
    // Métodos públicos
    // ===============

    public void enviarEmailBienvenida(String destinatario, String nombre) {
        String subject = "¡Bienvenido a EcoSalud!";
        String html = String.format("""
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <h2 style='color: #1E4099;'>¡Bienvenido a EcoSalud, %s!</h2>
                        <p>Gracias por registrarte en nuestra botica.</p>
                        <ul>
                            <li>Compras rápidas y seguras</li>
                            <li>Seguimiento de tus pedidos</li>
                            <li>Ofertas exclusivas</li>
                            <li>Delivery en 50 minutos</li>
                        </ul>
                        <p>¡Esperamos servirte pronto!</p>
                    </div>
                """, nombre);
        String text = "¡Bienvenido a EcoSalud, " + nombre + "! Gracias por registrarte.";

        enviar(destinatario, nombre, subject, text, html);
    }

    public void enviarEmailVerificacion(String destinatario, String nombre, String codigoVerificacion) {
        String subject = "Verifica tu cuenta - EcoSalud";
        String html = String.format(
                """
                            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                                <h2 style='color: #1E4099;'>Verifica tu cuenta</h2>
                                <p>Hola %s,</p>
                                <p>Tu código de verificación es:</p>
                                <div style='background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;'>
                                    %s
                                </div>
                                <p style='color: #666;'>Este código expira en 24 horas.</p>
                            </div>
                        """,
                nombre, codigoVerificacion);
        String text = "Tu código de verificación es: " + codigoVerificacion;

        enviar(destinatario, nombre, subject, text, html);
    }

    public void enviarConfirmacionPedido(String destinatario, String nombre, Long idPedido, double total) {
        String subject = "Confirmación de pedido #" + idPedido + " - EcoSalud";
        String html = String.format("""
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <h2 style='color: #16a34a;'>¡Gracias por tu compra, %s!</h2>
                        <p>Tu pedido ha sido confirmado exitosamente.</p>
                        <div style='background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                            <p><strong>Número de pedido:</strong> #%d</p>
                            <p><strong>Total:</strong> S/. %.2f</p>
                        </div>
                        <p>Te notificaremos cuando tu pedido esté en camino.</p>
                    </div>
                """, nombre, idPedido, total);
        String text = String.format("Pedido #%d confirmado. Total: S/. %.2f", idPedido, total);

        enviar(destinatario, nombre, subject, text, html);
    }

    public void enviarRecuperacionPassword(String destinatario, String nombre, String token) {
        String subject = "Recuperación de contraseña - EcoSalud";
        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        String html = String.format(
                """
                            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                                <h2 style='color: #1E4099;'>Recuperación de contraseña</h2>
                                <p>Hola %s,</p>
                                <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                                <div style='text-align: center; margin: 30px 0;'>
                                    <a href='%s' style='background: #1E4099; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                                        Restablecer contraseña
                                    </a>
                                </div>
                            </div>
                        """,
                nombre, resetLink);
        String text = "Usa este enlace para restablecer tu contraseña: " + resetLink;

        enviar(destinatario, nombre, subject, text, html);
    }

    public void enviarCambioEstadoPedido(String destinatario, String nombre, Long idPedido, String nuevoEstado) {
        String subject = "Actualización de pedido #" + idPedido + " - EcoSalud";
        String mensaje = switch (nuevoEstado.toLowerCase()) {
            case "en preparacion" -> "Tu pedido está siendo preparado.";
            case "en camino" -> "¡Tu pedido está en camino!";
            case "entregado" -> "Tu pedido ha sido entregado. ¡Gracias por tu compra!";
            case "cancelado" -> "Tu pedido ha sido cancelado.";
            default -> "El estado de tu pedido ha cambiado.";
        };
        String html = String.format("""
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <h2 style='color: #1E4099;'>Actualización de tu pedido</h2>
                        <p>Hola %s,</p>
                        <p>%s</p>
                        <div style='background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                            <p><strong>Pedido:</strong> #%d</p>
                            <p><strong>Estado:</strong> %s</p>
                        </div>
                    </div>
                """, nombre, mensaje, idPedido, nuevoEstado);
        String text = String.format("Pedido #%d - %s", idPedido, mensaje);

        enviar(destinatario, nombre, subject, text, html);
    }

    // ==========================
    // Implementación Mock para desarrollo
    // ==========================

    private void enviar(String toEmail, String toName, String subject, String text, String html) {
        // Mock implementation - solo registra en logs
        log.info("=== EMAIL MOCK ===");
        log.info("Para: {} <{}>", toName, toEmail);
        log.info("Asunto: {}", subject);
        log.info("Contenido: {}", text);
        log.info("================");

        // Aquí puedes integrar otro servicio de email en el futuro
        // como JavaMailSender, SendGrid, etc.
    }
}
