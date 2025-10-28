package com.botica.botica_backend.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String PRIMARY_COLOR = "#0B3C8C";
    private static final String ACCENT_COLOR = "#1663C7";

    private final JavaMailSender mailSender;
    private final ResourceLoader resourceLoader;

    @Value("${app.mail.from:no-reply@ecosalud.com}")
    private String defaultFrom;

    @Value("${app.mail.logo-url:http://localhost:3000/assets/Logodef.png}")
    private String logoUrl;

    @Value("${app.mail.boleta-template:classpath:boletas/boleta-constancia.pdf}")
    private String boletaTemplate;

    // ===============
    // Métodos públicos
    // ===============

    public void enviarEmailBienvenida(String destinatario, String nombre) {
        String subject = "¡Bienvenido a EcoSalud!";
        String body = String.format("""
                    <p style='margin:0 0 16px;'>Hola %s,</p>
                    <p style='margin:0 0 16px;'>Gracias por registrarte en nuestra botica. Desde ahora cuentas con:</p>
                    <ul style='padding-left:18px;margin:0 0 16px;'>
                        <li>Compras rápidas y seguras</li>
                        <li>Seguimiento detallado de tus pedidos</li>
                        <li>Promociones y beneficios exclusivos</li>
                        <li>Delivery confiable en tiempos óptimos</li>
                    </ul>
                    <p style='margin:24px 0 0;'>¡Bienvenido a la experiencia EcoSalud!</p>
                """, nombre);
        String html = buildEmailTemplate("Bienvenido a EcoSalud", body);
        String text = "¡Bienvenido a EcoSalud, " + nombre + "! Gracias por registrarte.";

        enviar(destinatario, nombre, subject, text, html);
    }

    public void enviarEmailVerificacion(String destinatario, String nombre, String codigoVerificacion) {
        String subject = "Verifica tu cuenta - EcoSalud";
        String body = String.format(
                """
                            <p style='margin:0 0 16px;'>Hola %s,</p>
                            <p style='margin:0 0 16px;'>Para activar tu cuenta ingresa el siguiente código de verificación:</p>
                            <div style='background-color:#EDF3FF;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;'>
                                <span style='display:inline-block;font-size:28px;font-weight:700;letter-spacing:8px;color:%s;'>%s</span>
                            </div>
                            <p style='margin:0;color:#5f6368;font-size:13px;'>El código vence en 24 horas. Si no solicitaste esta verificación, ignora este mensaje.</p>
                        """,
                nombre, PRIMARY_COLOR, codigoVerificacion);
        String html = buildEmailTemplate("Verificación de cuenta", body);
        String text = "Tu código de verificación es: " + codigoVerificacion;

        enviar(destinatario, nombre, subject, text, html);
    }

    public void enviarConfirmacionPedido(String destinatario, String nombre, Long idPedido, double total) {
        String subject = "Confirmación de pedido #" + idPedido + " - EcoSalud";
        String body = String.format("""
                    <p style='margin:0 0 16px;'>Hola %s,</p>
                    <p style='margin:0 0 16px;'>Hemos recibido tu pedido y se encuentra en preparación.</p>
                    <div style='border:1px solid #E2E8F5;border-radius:12px;padding:20px;margin:0 0 24px;background-color:#F8FBFF;'>
                        <p style='margin:0 0 8px;'><span style='color:%s;font-weight:600;'>Número de pedido:</span> #%d</p>
                        <p style='margin:0;'><span style='color:%s;font-weight:600;'>Total:</span> S/. %.2f</p>
                    </div>
                    <p style='margin:0;'>Te enviaremos una actualización cuando el pedido salga a reparto.</p>
                """, nombre, PRIMARY_COLOR, idPedido, PRIMARY_COLOR, total);
        String html = buildEmailTemplate("Confirmación de pedido", body);
        String text = String.format("Pedido #%d confirmado. Total: S/. %.2f", idPedido, total);
        try {
            Attachment boletaAdjunta = cargarBoletaConstancia(idPedido);
            enviarConAdjuntos(destinatario, nombre, subject, text, html, List.of(boletaAdjunta));
        } catch (IOException e) {
            log.error("No se pudo adjuntar la boleta para el pedido {}: {}", idPedido, e.getMessage(), e);
            enviar(destinatario, nombre, subject, text, html);
        }
    }

    public void enviarRecuperacionPassword(String destinatario, String nombre, String token) {
        String subject = "Recuperación de contraseña - EcoSalud";
        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        String body = String.format(
                """
                            <p style='margin:0 0 16px;'>Hola %s,</p>
                            <p style='margin:0 0 24px;'>Recibimos una solicitud para cambiar tu contraseña. Haz clic en el botón para continuar.</p>
                            <div style='text-align:center;margin:0 0 24px;'>
                                <a href='%s' style='background-color:%s;color:#ffffff;padding:14px 32px;border-radius:28px;text-decoration:none;font-weight:600;'>
                                    Restablecer contraseña
                                </a>
                            </div>
                            <p style='margin:0;color:#5f6368;font-size:13px;'>Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña actual seguirá activa.</p>
                        """,
                nombre, resetLink, PRIMARY_COLOR);
        String html = buildEmailTemplate("Recuperación de contraseña", body);
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
        String body = String.format("""
                    <p style='margin:0 0 16px;'>Hola %s,</p>
                    <p style='margin:0 0 16px;'>%s</p>
                    <div style='border-left:4px solid %s;padding:16px 20px;margin:0 0 24px;background-color:#F1F5FF;border-radius:12px;'>
                        <p style='margin:0 0 8px;'><span style='color:%s;font-weight:600;'>Pedido:</span> #%d</p>
                        <p style='margin:0;'><span style='color:%s;font-weight:600;'>Estado:</span> %s</p>
                    </div>
                    <p style='margin:0;color:#5f6368;font-size:13px;'>Gracias por confiar en Botica EcoSalud.</p>
                """, nombre, mensaje, ACCENT_COLOR, PRIMARY_COLOR, idPedido, PRIMARY_COLOR, nuevoEstado);
        String html = buildEmailTemplate("Actualización de tu pedido", body);
        String text = String.format("Pedido #%d - %s", idPedido, mensaje);

        enviar(destinatario, nombre, subject, text, html);
    }

    // ==========================
    // Implementación Mock para desarrollo
    // ==========================

    private void enviar(String toEmail, String toName, String subject, String text, String html) {
        enviarConAdjuntos(toEmail, toName, subject, text, html, null);
    }

    private void enviarConAdjuntos(String toEmail,
                                   String toName,
                                   String subject,
                                   String text,
                                   String html,
                                   List<Attachment> attachments) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setFrom(defaultFrom);

            if (html != null && !html.isBlank()) {
                helper.setText(text != null ? text : "", html);
            } else {
                helper.setText(text != null ? text : "");
            }

            if (attachments != null) {
                for (Attachment attachment : attachments) {
                    helper.addAttachment(attachment.filename(), attachment.resource());
                }
            }

            mailSender.send(message);
            log.info("Correo enviado a {} <{}> con asunto '{}'", toName, toEmail, subject);
        } catch (MessagingException | MailException e) {
            log.error("Error al enviar correo a {} <{}>: {}", toName, toEmail, e.getMessage(), e);
            throw new IllegalStateException("No se pudo enviar el correo electrónico", e);
        }
    }

    private Attachment cargarBoletaConstancia(Long idPedido) throws IOException {
        Resource resource = resourceLoader.getResource(boletaTemplate);
        if (!resource.exists()) {
            throw new IOException("No se encontró la plantilla de boleta en " + boletaTemplate);
        }

        byte[] bytes = resource.getInputStream().readAllBytes();
        String filename = String.format("Boleta_%s.pdf", idPedido != null ? idPedido : LocalDate.now());
        return new Attachment(filename, new ByteArrayResource(bytes, "Boleta EcoSalud"));
    }

    private String buildEmailTemplate(String headline, String innerHtml) {
        return String.format("""
                <div style='background-color:#EEF3FC;padding:32px 0;font-family:"Segoe UI", Arial, sans-serif;'>
                    <div style='max-width:640px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(11,60,140,0.12);'>
                        <div style='background-color:%s;padding:28px;text-align:center;'>
                            <img src='%s' alt='Botica EcoSalud' style='max-width:180px;height:auto;margin-bottom:16px;' />
                            <h1 style='color:#ffffff;font-size:24px;margin:0;font-weight:600;'>%s</h1>
                        </div>
                        <div style='padding:32px;color:#1f2937;font-size:15px;line-height:1.7;'>
                            %s
                            <p style='margin-top:32px;font-size:12px;color:#6b7280;'>Si necesitas ayuda, contáctanos en <a href='mailto:%s' style='color:%s;text-decoration:none;'>%s</a>.</p>
                        </div>
                        <div style='background-color:#0B3C8C;padding:16px;text-align:center;'>
                            <p style='margin:0;color:#ffffff;font-size:12px;'>Botica EcoSalud · Atención al cliente 24/7</p>
                        </div>
                    </div>
                </div>
                """, PRIMARY_COLOR, logoUrl, headline, innerHtml, defaultFrom, ACCENT_COLOR, defaultFrom);
    }

    private record Attachment(String filename, ByteArrayResource resource) { }
}
