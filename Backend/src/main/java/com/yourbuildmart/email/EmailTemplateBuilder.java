package com.yourbuildmart.email;

import com.yourbuildmart.email.dto.EmailRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class EmailTemplateBuilder {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    public String buildHtml(EmailRequest req) {
        return switch (req.getEmailType()) {

            case AGENT_CONFIRMATION      -> buildAgentConfirmation(req);
            case ADMIN_NEW_AGENT_ALERT   -> buildAdminNewAgentAlert(req);
            case ADMIN_REPLY             -> buildAdminReply(req);
            case WELCOME_EMAIL           -> buildWelcome(req);
            case PASSWORD_CHANGED        -> buildPasswordChanged(req);
            case ACCOUNT_DISABLED        -> buildAccountDisabled(req);
            case ACCOUNT_DELETED         -> buildAccountDeleted(req);
            case ENQUIRY_CONFIRMATION    -> buildEnquiryConfirmation(req);
            case ADMIN_NEW_ENQUIRY_ALERT -> buildAdminNewEnquiryAlert(req);
            case CONTACT_CONFIRMATION    -> buildContactConfirmation(req);
            case ADMIN_NEW_CONTACT_ALERT -> buildAdminNewContactAlert(req);
        };
    }

    // ═══════════════════════════════════════════════════════════════════
    //  ACCOUNT DISABLED
    // ═══════════════════════════════════════════════════════════════════
    private String buildAccountDisabled(EmailRequest req) {
        String body = """
            <p style="margin:0 0 16px;">Hi <strong>%s</strong>,</p>
            <p style="margin:0 0 16px;">
                We are writing to inform you that your <strong>YourBuildMart</strong>
                account has been <span style="color:#e62e04;font-weight:700;">temporarily disabled</span>
                by our administration team.
            </p>
            <table style="width:100%%;border-collapse:collapse;margin:0 0 24px;">
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;width:35%%;">Account</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                </tr>
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Status</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;color:#e62e04;font-weight:600;">Disabled</td>
                </tr>
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Time</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                </tr>
            </table>
            <div style="background:#fff8f8;border-left:4px solid #e62e04;padding:16px;margin:0 0 24px;border-radius:4px;">
                <p style="margin:0;color:#333;">
                    If you believe this is a mistake or would like to appeal this decision,
                    please contact our support team immediately.
                </p>
            </div>
            <p style="margin:0 0 24px;color:#666;">
                While disabled, you will not be able to log in or access your account.
            </p>
            """.formatted(req.getUserName(), req.getUserEmail() != null ? req.getUserEmail() : req.getTo(),
                LocalDateTime.now().format(FMT));
        return baseTemplate("Account Disabled", body, "Contact Support", frontendUrl + "/contact");
    }

    // ═══════════════════════════════════════════════════════════════════
    //  ACCOUNT DELETED
    // ═══════════════════════════════════════════════════════════════════
    private String buildAccountDeleted(EmailRequest req) {
        String body = """
            <p style="margin:0 0 16px;">Hi <strong>%s</strong>,</p>
            <p style="margin:0 0 16px;">
                Your <strong>YourBuildMart</strong> account associated with
                <strong>%s</strong> has been
                <span style="color:#e62e04;font-weight:700;">permanently deleted</span>
                by our administration team.
            </p>
            <div style="background:#fff8f8;border-left:4px solid #e62e04;padding:16px;margin:0 0 24px;border-radius:4px;">
                <p style="margin:0;color:#333;">
                    ⚠️ This action is permanent. All your data including orders,
                    addresses, and saved items have been removed and cannot be recovered.
                </p>
            </div>
            <p style="margin:0 0 24px;color:#666;">
                If you believe this was done in error, please contact us as soon as possible.
                We may be able to assist you if you reach out promptly.
            </p>
            """.formatted(req.getUserName(), req.getTo());
        return baseTemplate("Account Deleted", body, "Contact Support", frontendUrl + "/contact");
    }

    // ═══════════════════════════════════════════════════════════════════
    //  ENQUIRY CONFIRMATION  (to user)
    // ═══════════════════════════════════════════════════════════════════
    private String buildEnquiryConfirmation(EmailRequest req) {
        String itemsHtml = req.getOrderItemsSummary() != null
                ? req.getOrderItemsSummary()
                : "<tr><td colspan=\"2\" style=\"padding:10px;border:1px solid #e0e0e0;color:#999;\">—</td></tr>";

        String orgRow = req.getEnquiryOrganization() != null && !req.getEnquiryOrganization().isBlank()
                ? """
                  <tr>
                      <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Organisation</td>
                      <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                  </tr>
                  """.formatted(req.getEnquiryOrganization())
                : "";

        String body = """
            <p style="margin:0 0 16px;">Hi <strong>%s</strong>,</p>
            <p style="margin:0 0 16px;">
                Thank you for your enquiry! We've received your request and our team
                will review it and get back to you shortly.
            </p>
            <table style="width:100%%;border-collapse:collapse;margin:0 0 24px;">
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;width:35%%;">Enquiry No.</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;font-weight:700;color:#e62e04;">%s</td>
                </tr>
                %s
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Status</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;color:#2e7d32;font-weight:600;">Received — Under Review</td>
                </tr>
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Submitted On</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                </tr>
            </table>
            <p style="margin:0 0 8px;font-weight:600;">Items in your enquiry:</p>
            <table style="width:100%%;border-collapse:collapse;margin:0 0 24px;">
                <tr style="background:#f9f9f9;">
                    <th style="padding:10px;border:1px solid #e0e0e0;text-align:left;">Product</th>
                    <th style="padding:10px;border:1px solid #e0e0e0;text-align:left;">Qty</th>
                </tr>
                %s
            </table>
            <p style="margin:0 0 24px;color:#666;">
                You can track your enquiry status from your account profile.
                We typically respond within 1–2 business days.
            </p>
            """.formatted(
                req.getUserName(),
                req.getOrderNumber(),
                orgRow,
                LocalDateTime.now().format(FMT),
                itemsHtml
        );
        return baseTemplate("Enquiry Received", body, "Track My Enquiry", frontendUrl + "/profile");
    }

    // ═══════════════════════════════════════════════════════════════════
    //  ADMIN NEW ENQUIRY ALERT
    // ═══════════════════════════════════════════════════════════════════
    private String buildAdminNewEnquiryAlert(EmailRequest req) {
        String orgRow = req.getEnquiryOrganization() != null && !req.getEnquiryOrganization().isBlank()
                ? """
                  <tr>
                      <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Organisation</td>
                      <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                  </tr>
                  """.formatted(req.getEnquiryOrganization())
                : "";

        String itemsHtml = req.getOrderItemsSummary() != null ? req.getOrderItemsSummary()
                : "<tr><td colspan=\"2\" style=\"padding:10px;border:1px solid #e0e0e0;color:#999;\">—</td></tr>";

        String body = """
            <p style="margin:0 0 16px;">
                A new enquiry has been submitted on <strong>YourBuildMart</strong>.
            </p>
            <table style="width:100%%;border-collapse:collapse;margin:0 0 24px;">
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;width:35%%;">Enquiry No.</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;font-weight:700;color:#e62e04;">%s</td>
                </tr>
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Customer</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                </tr>
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Email</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                </tr>
                %s
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Submitted On</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                </tr>
            </table>
            <p style="margin:0 0 8px;font-weight:600;">Items:</p>
            <table style="width:100%%;border-collapse:collapse;margin:0 0 24px;">
                <tr style="background:#f9f9f9;">
                    <th style="padding:10px;border:1px solid #e0e0e0;text-align:left;">Product</th>
                    <th style="padding:10px;border:1px solid #e0e0e0;text-align:left;">Qty</th>
                </tr>
                %s
            </table>
            <p style="margin:0 0 24px;color:#666;">Please log in to the admin panel to review and respond.</p>
            """.formatted(
                req.getOrderNumber(),
                req.getUserName(),
                req.getUserEmail() != null ? req.getUserEmail() : req.getTo(),
                orgRow,
                LocalDateTime.now().format(FMT),
                itemsHtml
        );
        return baseTemplate("New Enquiry", body, "Go to Admin Panel", frontendUrl + "/admin");
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CONTACT FORM CONFIRMATION  (to user)
    // ═══════════════════════════════════════════════════════════════════
    private String buildContactConfirmation(EmailRequest req) {
        String productRow = req.getContactProduct() != null && !req.getContactProduct().isBlank()
                ? """
                  <tr>
                      <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Product Enquiry</td>
                      <td style="padding:10px;border:1px solid #e0e0e0;">%s%s</td>
                  </tr>
                  """.formatted(
                        req.getContactProduct(),
                        req.getContactQuantity() != null ? " (Qty: " + req.getContactQuantity() + ")" : "")
                : "";

        String locationRow = (req.getContactCity() != null || req.getContactCountry() != null)
                ? """
                  <tr>
                      <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Location</td>
                      <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                  </tr>
                  """.formatted(
                        String.join(", ",
                            java.util.stream.Stream.of(req.getContactCity(), req.getContactCountry())
                                .filter(s -> s != null && !s.isBlank())
                                .toList()))
                : "";

        String messageRow = req.getContactMessage() != null && !req.getContactMessage().isBlank()
                ? """
                  <tr>
                      <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;vertical-align:top;">Message</td>
                      <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                  </tr>
                  """.formatted(req.getContactMessage())
                : "";

        String body = """
            <p style="margin:0 0 16px;">Hi <strong>%s</strong>,</p>
            <p style="margin:0 0 16px;">
                Thank you for reaching out to <strong>YourBuildMart</strong>.
                We've received your message and our team will get back to you
                within 1–2 business days.
            </p>
            <p style="margin:0 0 8px;font-weight:600;">Here's a summary of your submission:</p>
            <table style="width:100%%;border-collapse:collapse;margin:0 0 24px;">
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;width:35%%;">Name</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                </tr>
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Email</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                </tr>
                %s
                %s
                %s
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Submitted On</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                </tr>
            </table>
            <p style="margin:0 0 24px;color:#666;">
                If your query is urgent, you can also reach us directly through our website.
            </p>
            """.formatted(
                req.getUserName(), req.getUserName(), req.getTo(),
                productRow, locationRow, messageRow,
                LocalDateTime.now().format(FMT)
        );
        return baseTemplate("Message Received", body, "Visit YourBuildMart", frontendUrl);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  ADMIN NEW CONTACT ALERT
    // ═══════════════════════════════════════════════════════════════════
    private String buildAdminNewContactAlert(EmailRequest req) {
        String productRow = req.getContactProduct() != null && !req.getContactProduct().isBlank()
                ? """
                  <tr>
                      <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Product</td>
                      <td style="padding:10px;border:1px solid #e0e0e0;">%s%s</td>
                  </tr>
                  """.formatted(
                        req.getContactProduct(),
                        req.getContactQuantity() != null ? " (Qty: " + req.getContactQuantity() + ")" : "")
                : "";

        String locationRow = (req.getContactCity() != null || req.getContactCountry() != null)
                ? """
                  <tr>
                      <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Location</td>
                      <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                  </tr>
                  """.formatted(
                        String.join(", ",
                            java.util.stream.Stream.of(req.getContactCity(), req.getContactCountry())
                                .filter(s -> s != null && !s.isBlank())
                                .toList()))
                : "";

        String messageRow = req.getContactMessage() != null && !req.getContactMessage().isBlank()
                ? """
                  <tr>
                      <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;vertical-align:top;">Message</td>
                      <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                  </tr>
                  """.formatted(req.getContactMessage())
                : "";

        String body = """
            <p style="margin:0 0 16px;">
                A new contact request has been submitted on <strong>YourBuildMart</strong>.
            </p>
            <table style="width:100%%;border-collapse:collapse;margin:0 0 24px;">
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;width:35%%;">Name</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                </tr>
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Email</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                </tr>
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Phone</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                </tr>
                %s
                %s
                %s
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Received On</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                </tr>
            </table>
            <p style="margin:0 0 24px;color:#666;">Please log in to the admin panel to review and respond.</p>
            """.formatted(
                req.getUserName(), req.getTo(),
                req.getContactPhone() != null ? req.getContactPhone() : "—",
                productRow, locationRow, messageRow,
                LocalDateTime.now().format(FMT)
        );
        return baseTemplate("New Contact Request", body, "Go to Admin Panel", frontendUrl + "/admin");
    }

    // ═══════════════════════════════════════════════════════════════════
    //  EXISTING TEMPLATES (unchanged)
    // ═══════════════════════════════════════════════════════════════════
    private String buildAgentConfirmation(EmailRequest req) {
        String body = """
            <p style="margin:0 0 16px;">Hi <strong>%s</strong>,</p>
            <p style="margin:0 0 16px;">
                Thank you for registering as an agent with <strong>YourBuildMart</strong>.
            </p>
            <table style="width:100%%;border-collapse:collapse;margin:0 0 24px;">
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;width:35%%;">Shop Name</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;">%s</td>
                </tr>
                <tr>
                    <td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Status</td>
                    <td style="padding:10px;border:1px solid #e0e0e0;">Under Review</td>
                </tr>
            </table>
            <p style="margin:0 0 24px;color:#666;">
                Our team will review your request and get back to you within 2–3 business days.
            </p>
            """.formatted(req.getUserName(), req.getShopName());
        return baseTemplate("Registration Received", body, "Visit YourBuildMart", frontendUrl);
    }

    private String buildAdminNewAgentAlert(EmailRequest req) {
        String body = """
            <p style="margin:0 0 16px;">A new agent has submitted a registration request on <strong>YourBuildMart</strong>.</p>
            <table style="width:100%%;border-collapse:collapse;margin:0 0 24px;">
                <tr><td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;width:35%%;">Full Name</td><td style="padding:10px;border:1px solid #e0e0e0;">%s</td></tr>
                <tr><td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Shop Name</td><td style="padding:10px;border:1px solid #e0e0e0;">%s</td></tr>
                <tr><td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Email</td><td style="padding:10px;border:1px solid #e0e0e0;">%s</td></tr>
                <tr><td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Phone</td><td style="padding:10px;border:1px solid #e0e0e0;">%s</td></tr>
                <tr><td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Address</td><td style="padding:10px;border:1px solid #e0e0e0;">%s</td></tr>
                <tr><td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Status</td><td style="padding:10px;border:1px solid #e0e0e0;color:#e62e04;font-weight:600;">Pending Review</td></tr>
            </table>
            <p style="margin:0 0 24px;color:#666;">Please log in to the admin panel to review and respond.</p>
            """.formatted(req.getUserName(), req.getShopName(), req.getUserEmail(), req.getUserPhone(), req.getUserAddress());
        return baseTemplate("New Agent Registration", body, "Go to Admin Panel", frontendUrl + "/admin");
    }

    private String buildAdminReply(EmailRequest req) {
        String body = """
            <p style="margin:0 0 16px;">Hi <strong>%s</strong>,</p>
            <p style="margin:0 0 16px;">
                The <strong>YourBuildMart</strong> team has reviewed your request
                and sent you a response. Here it is:
            </p>
            <div style="background:#f9f9f9;border-left:4px solid #e62e04;padding:16px;margin:0 0 24px;border-radius:4px;">
                <p style="margin:0;color:#333;line-height:1.7;">%s</p>
            </div>
            <p style="margin:0 0 24px;color:#666;">
                You can view your full request history and any future replies
                by logging into your account and visiting the <strong>My Requests</strong> section.
            </p>
            <p style="margin:0 0 24px;color:#666;">
                If you have further questions, feel free to reach out to us
                again through our Contact page.
            </p>
            """.formatted(req.getUserName(), req.getAdminReply());
        return baseTemplate("Reply to Your Request", body, "View My Requests", frontendUrl + "/profile");
    }

    private String buildWelcome(EmailRequest req) {
        String body = """
            <p style="margin:0 0 16px;">Hi <strong>%s</strong>,</p>
            <p style="margin:0 0 16px;">Welcome to <strong>YourBuildMart</strong> — your one-stop destination for quality construction and building materials.</p>
            <table style="width:100%%;border-collapse:collapse;margin:0 0 24px;">
                <tr><td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;">🏗️ Browse thousands of building materials and products</td></tr>
                <tr><td style="padding:10px;border:1px solid #e0e0e0;">❤️ Save your favourites to your Wishlist</td></tr>
                <tr><td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;">📦 Place enquiries and track your orders</td></tr>
                <tr><td style="padding:10px;border:1px solid #e0e0e0;">🤝 Connect with trusted agents and suppliers</td></tr>
            </table>
            <p style="margin:0 0 24px;color:#666;">If you have any questions, feel free to reach out anytime through our Contact page.</p>
            """.formatted(req.getUserName());
        return baseTemplate("Welcome to YourBuildMart!", body, "Start Exploring", frontendUrl + "/products");
    }

    private String buildPasswordChanged(EmailRequest req) {
        String body = """
            <p style="margin:0 0 16px;">Hi <strong>%s</strong>,</p>
            <p style="margin:0 0 16px;">This is a confirmation that the password for your <strong>YourBuildMart</strong> account was successfully changed.</p>
            <table style="width:100%%;border-collapse:collapse;margin:0 0 24px;">
                <tr><td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;width:35%%;">Account</td><td style="padding:10px;border:1px solid #e0e0e0;">%s</td></tr>
                <tr><td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Time</td><td style="padding:10px;border:1px solid #e0e0e0;">%s</td></tr>
                <tr><td style="padding:10px;border:1px solid #e0e0e0;background:#f9f9f9;font-weight:600;">Status</td><td style="padding:10px;border:1px solid #e0e0e0;color:#2e7d32;font-weight:600;">Successfully Changed</td></tr>
            </table>
            <div style="background:#fff8f8;border-left:4px solid #e62e04;padding:16px;margin:0 0 24px;border-radius:4px;">
                <p style="margin:0;color:#333;">⚠️ If you did not make this change, please contact our support team immediately.</p>
            </div>
            """.formatted(req.getUserName(), req.getTo(), LocalDateTime.now().format(FMT));
        return baseTemplate("Your Password Was Changed", body, "Contact Support", frontendUrl + "/contact");
    }

    // ═══════════════════════════════════════════════════════════════════
    //  BASE TEMPLATE
    // ═══════════════════════════════════════════════════════════════════
    private String baseTemplate(String title, String bodyContent, String ctaText, String ctaUrl) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
              <title>%s</title>
            </head>
            <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;font-size:15px;color:#333;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:40px 16px;">
                    <table width="600" cellpadding="0" cellspacing="0"
                           style="max-width:600px;width:100%%;background:#fff;border-radius:8px;
                                  overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                      <tr>
                        <td style="background:#e62e04;padding:28px 32px;">
                          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                            YourBuildMart
                          </h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:32px;">
                          %s
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="background:#e62e04;border-radius:4px;">
                                <a href="%s"
                                   style="display:inline-block;padding:12px 28px;color:#fff;
                                          text-decoration:none;font-weight:600;font-size:14px;">
                                  %s
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="background:#f9f9f9;padding:20px 32px;border-top:1px solid #e0e0e0;
                                   text-align:center;color:#999;font-size:13px;">
                          © 2026 YourBuildMart. All rights reserved.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(title, bodyContent, ctaUrl, ctaText);
    }
}
