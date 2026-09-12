/**
 * BeautyIQ URL Security & SSRF Protection
 * Validates external URLs, enforces HTTP/HTTPS protocols, and blocks
 * dangerous protocols, internal IP ranges (SSRF), loopback, and metadata endpoints.
 */

export class UrlValidator {
  // Block internal / private IPv4 and IPv6 addresses and cloud metadata
  private static DANGEROUS_HOSTNAMES = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "169.254.169.254", // AWS/GCP/Azure instance metadata
    "metadata.google.internal",
    "::1",
  ];

  /**
   * Evaluates if a URL is safe for external display and fetching
   */
  static isSafeExternalUrl(urlStr: string): { isValid: boolean; reason?: string } {
    if (!urlStr || typeof urlStr !== "string") {
      return { isValid: false, reason: "URL must be a non-empty string." };
    }

    const trimmed = urlStr.trim();

    // Check for dangerous protocol prefixes
    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith("javascript:") ||
      lower.startsWith("data:") ||
      lower.startsWith("vbscript:") ||
      lower.startsWith("file:")
    ) {
      return { isValid: false, reason: "Dangerous URL protocol rejected." };
    }

    try {
      const parsed = new URL(trimmed);

      // Must be http or https
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return { isValid: false, reason: `Protocol "${parsed.protocol}" is not permitted.` };
      }

      const hostname = parsed.hostname.toLowerCase();

      // Check dangerous hostnames
      if (this.DANGEROUS_HOSTNAMES.includes(hostname)) {
        return { isValid: false, reason: `Target host "${hostname}" is prohibited (SSRF protection).` };
      }

      // Check private IPv4 ranges:
      // 10.0.0.0 - 10.255.255.255
      // 172.16.0.0 - 172.31.255.255
      // 192.168.0.0 - 192.168.255.255
      const ipv4Match = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
      if (ipv4Match) {
        const [, octet1, octet2] = ipv4Match.map(Number);
        if (
          octet1 === 10 ||
          (octet1 === 172 && octet2 >= 16 && octet2 <= 31) ||
          (octet1 === 192 && octet2 === 168) ||
          octet1 === 127
        ) {
          return { isValid: false, reason: "Private/internal IP addresses are prohibited." };
        }
      }

      // Reject non-standard dangerous ports if specified
      if (parsed.port && !["80", "443", "8080", "8443"].includes(parsed.port)) {
        return { isValid: false, reason: `Port "${parsed.port}" is not permitted for external listings.` };
      }

      return { isValid: true };
    } catch {
      return { isValid: false, reason: "Malformed URL format." };
    }
  }
}
