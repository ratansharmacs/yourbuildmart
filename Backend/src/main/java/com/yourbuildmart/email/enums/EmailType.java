package com.yourbuildmart.email.enums;

public enum EmailType {

    // ── Auth / Account ──────────────────────────────────────────────────
    WELCOME_EMAIL,            // user registered
    PASSWORD_CHANGED,         // user changed password
    ACCOUNT_DISABLED,         // admin disabled user account
    ACCOUNT_DELETED,          // admin deleted user account

    // ── Enquiry (Order) ─────────────────────────────────────────────────
    ENQUIRY_CONFIRMATION,     // user placed an enquiry → confirmation to user
    ADMIN_NEW_ENQUIRY_ALERT,  // user placed an enquiry → alert to admin

    // ── Contact form ────────────────────────────────────────────────────
    CONTACT_CONFIRMATION,     // user submitted contact form → confirmation to user
    ADMIN_NEW_CONTACT_ALERT,  // user submitted contact form → alert to admin

    // ── Agent registration ───────────────────────────────────────────────
    AGENT_CONFIRMATION,       // agent submitted registration → confirmation to agent
    ADMIN_NEW_AGENT_ALERT,    // agent submitted registration → alert to admin
    ADMIN_REPLY,              // admin replied to any inquiry → notification to user

}
