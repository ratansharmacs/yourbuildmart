package com.yourbuildmart.email;

import com.yourbuildmart.email.dto.EmailRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailTemplateBuilder templateBuilder;

    @Value("${app.email.enabled}")
    private boolean emailEnabled;

    @Value("${app.email.from-address}")
    private String fromAddress;

    @Value("${app.email.from-name}")
    private String fromName;

    @Value("${admin.email}")
    private String adminEmail;

    @Async("emailTaskExecutor")
    public void sendEmail(EmailRequest request) {
        if (!emailEnabled) {
            log.info("[EMAIL STUB] Would send {} to {}",
                    request.getEmailType(), request.getTo());
            return;
        }

        try {
            String htmlBody = templateBuilder.buildHtml(request);
            MimeMessage message = buildMimeMessage(request, htmlBody);
            mailSender.send(message);
            log.info("[EMAIL SENT] {} → {}", request.getEmailType(), request.getTo());

        } catch (MailException | MessagingException | java.io.UnsupportedEncodingException ex) {
            log.error("[EMAIL FAILED] {} → {} | Reason: {}",
                    request.getEmailType(), request.getTo(), ex.getMessage());
        }
    }

    private MimeMessage buildMimeMessage(EmailRequest request, String htmlBody)
            throws MessagingException, java.io.UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(request.getTo());
        helper.setFrom(fromAddress, fromName);
        helper.setSubject(resolveSubject(request));
        helper.setText(htmlBody, true);
        return message;
    }

    private String resolveSubject(EmailRequest request) {
        return switch (request.getEmailType()) {
            case AGENT_CONFIRMATION      -> "Your Agent Registration — YourBuildMart";
            case ADMIN_REPLY             -> "We've Replied to Your Request — YourBuildMart";
            case ADMIN_NEW_AGENT_ALERT   -> "New Agent Registration Request — YourBuildMart";
            case WELCOME_EMAIL           -> "Welcome to YourBuildMart!";
            case PASSWORD_CHANGED        -> "Your Password Was Changed — YourBuildMart";
            case ACCOUNT_DISABLED        -> "Your Account Has Been Disabled — YourBuildMart";
            case ACCOUNT_DELETED         -> "Your Account Has Been Deleted — YourBuildMart";
            case ENQUIRY_CONFIRMATION    -> "Enquiry Received — YourBuildMart";
            case ADMIN_NEW_ENQUIRY_ALERT -> "New Enquiry Submitted — YourBuildMart";
            case CONTACT_CONFIRMATION    -> "We've Received Your Message — YourBuildMart";
            case ADMIN_NEW_CONTACT_ALERT -> "New Contact Request — YourBuildMart";
        };
    }
}
