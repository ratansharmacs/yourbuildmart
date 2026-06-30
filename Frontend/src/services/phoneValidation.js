/**
 * YBM Phone Validation Utility
 * Supports: India, UAE/Dubai, USA, UK, Europe, Saudi Arabia, and more
 */

export const COUNTRY_PHONE_RULES = {
  IN: { name: "India",         code: "+91",  pattern: /^\+91[6-9]\d{9}$/,         digits: 10, example: "+91 98765 43210" },
  AE: { name: "UAE / Dubai",   code: "+971", pattern: /^\+971[0-9]\d{8}$/,         digits: 9,  example: "+971 50 123 4567" },
  US: { name: "USA",           code: "+1",   pattern: /^\+1[2-9]\d{9}$/,           digits: 10, example: "+1 212 555 0100" },
  GB: { name: "UK",            code: "+44",  pattern: /^\+44[1-9]\d{9}$/,          digits: 10, example: "+44 20 7946 0958" },
  DE: { name: "Germany",       code: "+49",  pattern: /^\+49[1-9]\d{8,11}$/,       digits: "9-12", example: "+49 30 12345678" },
  FR: { name: "France",        code: "+33",  pattern: /^\+33[1-9]\d{8}$/,          digits: 9,  example: "+33 1 23 45 67 89" },
  SA: { name: "Saudi Arabia",  code: "+966", pattern: /^\+966[5][0-9]\d{7}$/,      digits: 9,  example: "+966 51 234 5678" },
  SG: { name: "Singapore",     code: "+65",  pattern: /^\+65[689]\d{7}$/,          digits: 8,  example: "+65 9123 4567" },
  AU: { name: "Australia",     code: "+61",  pattern: /^\+61[2-9]\d{8}$/,          digits: 9,  example: "+61 2 1234 5678" },
  CN: { name: "China",         code: "+86",  pattern: /^\+86[1][0-9]\d{9}$/,       digits: 11, example: "+86 139 1234 5678" },
};

/**
 * Detect country from phone number prefix and validate accordingly.
 * Falls back to a general international format if no country matches.
 *
 * @param {string} raw - The raw phone number string entered by the user
 * @returns {{ valid: boolean, error: string|null, country: string|null, normalised: string }}
 */
export function validatePhone(raw) {
  if (!raw || !raw.trim()) {
    return { valid: false, error: "Phone number is required.", country: null, normalised: "" };
  }

  // Strip spaces, dashes, parentheses, dots for matching
  const cleaned = raw.replace(/[\s\-().]/g, "");

  if (!cleaned.startsWith("+")) {
    return {
      valid: false,
      error: "Phone must start with country code (e.g. +91 for India, +971 for UAE).",
      country: null,
      normalised: cleaned,
    };
  }

  // Try known country rules (longest prefix first to avoid +1 matching +1xxx)
  for (const [iso, rule] of Object.entries(COUNTRY_PHONE_RULES).sort(
    (a, b) => b[1].code.length - a[1].code.length
  )) {
    if (cleaned.startsWith(rule.code)) {
      if (rule.pattern.test(cleaned)) {
        return { valid: true, error: null, country: rule.name, normalised: cleaned };
      } else {
        return {
          valid: false,
          error: `Invalid ${rule.name} number. Format: ${rule.example}`,
          country: rule.name,
          normalised: cleaned,
        };
      }
    }
  }

  // Generic fallback: E.164 format — + followed by 7-15 digits
  if (/^\+[1-9]\d{6,14}$/.test(cleaned)) {
    return { valid: true, error: null, country: "International", normalised: cleaned };
  }

  return {
    valid: false,
    error: "Invalid phone number. Use international format: +[country code][number]",
    country: null,
    normalised: cleaned,
  };
}

/**
 * Auto-format phone as the user types — adds spaces for readability.
 * Preserves the leading + and country code.
 */
export function formatPhoneDisplay(raw) {
  // Just clean extra spaces/dashes entered by user — don't over-format
  return raw.replace(/\s+/g, " ").trim();
}
