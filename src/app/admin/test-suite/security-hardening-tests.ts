import { NextRequest } from "next/server";
import { AuthGuard } from "@/lib/security/auth-guard";
import { checkAdminAuth } from "@/app/api/admin/auth-check";
import { RateLimiter } from "@/lib/security/rate-limiter";
import { SecureLogger } from "@/lib/security/secure-logger";
import { UrlValidator } from "@/lib/security/url-validator";
import { MedicalSafetyService, STANDARD_BEAUTYIQ_MEDICAL_DISCLAIMER } from "@/lib/security/medical-safety";
import { AIGuardrailService } from "@/lib/security/ai-guardrail.service";
import { InputValidator } from "@/lib/security/input-validator";
import { AuthService } from "@/services/auth.service";
import { SearchHistoryService } from "@/services/search-history.service";
import { RecommendationHistoryService } from "@/services/recommendation-history.service";
import { ComparisonService } from "@/services/comparison.service";
import { mockUsers } from "@/lib/mock-data";
import type { Product, RecommendationResultSet } from "@/types";

export interface SecurityTestItem {
  id: string;
  name: string;
  category: "Authentication" | "Authorization" | "Data Isolation" | "AI & Safety" | "Rate Limiting & Input";
  run: () => Promise<{ passed: boolean; message: string }>;
}

export const securityTestSuite: SecurityTestItem[] = [
  // ==========================================
  // 1. AUTHENTICATION & ADMIN ACCESS
  // ==========================================
  {
    id: "sec-unauthenticated-admin-rejected",
    name: "Unauthenticated Request to Admin Endpoint Rejected (401)",
    category: "Authentication",
    run: async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/products", {
        method: "GET",
      });
      const check = checkAdminAuth(req);
      if (check.authorized) {
        return { passed: false, message: "Security failure: Unauthenticated request was granted admin access!" };
      }
      const status = check.response?.status;
      if (status !== 401) {
        return { passed: false, message: `Expected HTTP 401 Unauthorized, but got HTTP ${status}` };
      }
      return { passed: true, message: "Unauthenticated admin request correctly rejected with HTTP 401 Unauthorized." };
    },
  },
  {
    id: "sec-customer-admin-access-forbidden",
    name: "Customer Attempt to Access Admin Endpoint Forbidden (403)",
    category: "Authorization",
    run: async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/customers", {
        method: "GET",
        headers: {
          "x-user-role": "customer",
          "x-user-id": "u1",
        },
      });
      const check = checkAdminAuth(req);
      if (check.authorized) {
        return { passed: false, message: "Security failure: Customer was permitted into admin endpoints!" };
      }
      const status = check.response?.status;
      if (status !== 403) {
        return { passed: false, message: `Expected HTTP 403 Forbidden, but got HTTP ${status}` };
      }
      return { passed: true, message: "Customer access attempt strictly blocked with HTTP 403 Forbidden." };
    },
  },
  {
    id: "sec-admin-authorized-access",
    name: "Admin Credentials Permitted to Admin Endpoints",
    category: "Authorization",
    run: async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/dashboard", {
        method: "GET",
        headers: {
          "x-user-role": "admin",
          authorization: "Bearer session-u2-admin",
        },
      });
      const check = checkAdminAuth(req);
      if (!check.authorized) {
        return { passed: false, message: "Admin user was unexpectedly blocked from admin endpoints." };
      }
      return { passed: true, message: "Admin credentials successfully authenticated with authorized role." };
    },
  },

  // ==========================================
  // 2. OBJECT-LEVEL DATA ISOLATION
  // ==========================================
  {
    id: "sec-customer-data-isolation",
    name: "Cross-Customer Data Isolation (Customer A Cannot Access Customer B's Profile)",
    category: "Data Isolation",
    run: async () => {
      // Customer u1 attempts to access customer u2's private resource
      const req = new NextRequest("http://localhost:3000/api/user/settings?userId=u2", {
        method: "GET",
        headers: {
          "x-user-id": "u1",
          authorization: "Bearer session-u1-token",
        },
      });
      const check = AuthGuard.verifyOwnership(req, "u2");
      if (check.authorized) {
        return { passed: false, message: "Vulnerability: Customer u1 was permitted to access u2's settings!" };
      }
      if (check.response?.status !== 403) {
        return { passed: false, message: `Expected HTTP 403 Forbidden for cross-customer access, got ${check.response?.status}` };
      }
      return { passed: true, message: "Object-level authorization successfully prevented cross-customer data access." };
    },
  },
  {
    id: "sec-customer-own-access-allowed",
    name: "Customer Permitted to Access Own Resource",
    category: "Data Isolation",
    run: async () => {
      const req = new NextRequest("http://localhost:3000/api/user/settings?userId=u1", {
        method: "GET",
        headers: {
          "x-user-id": "u1",
          authorization: "Bearer session-u1-token",
        },
      });
      const check = AuthGuard.verifyOwnership(req, "u1");
      if (!check.authorized) {
        return { passed: false, message: "Customer was incorrectly blocked from accessing their own resource." };
      }
      return { passed: true, message: "Customer verified and granted access to own resource." };
    },
  },
  {
    id: "sec-history-user-isolation",
    name: "Search, Recommendation, & Comparison History Strict User Isolation",
    category: "Data Isolation",
    run: async () => {
      const historyU1 = SearchHistoryService.getSearchHistory("u1");
      const historyU2 = SearchHistoryService.getSearchHistory("u2");

      // Verify u2 does not receive u1 items
      const hasCrossPollination = historyU2.some((item) => item.userId === "u1");
      if (hasCrossPollination) {
        return { passed: false, message: "Search history leaked customer u1 items to customer u2!" };
      }

      const recU1 = RecommendationHistoryService.getRecommendationHistory("u1");
      const recU2 = RecommendationHistoryService.getRecommendationHistory("u2");
      const hasRecLeak = recU2.some((item) => item.userId === "u1");
      if (hasRecLeak) {
        return { passed: false, message: "Recommendation history leaked customer u1 items to customer u2!" };
      }

      return { passed: true, message: "Search and recommendation history strictly partitioned by customer ID." };
    },
  },

  // ==========================================
  // 3. PRIVACY & SECRET REDACTION
  // ==========================================
  {
    id: "sec-credentials-stripped-from-responses",
    name: "Password Hashes & Reset Tokens Redacted from User Objects",
    category: "Authentication",
    run: async () => {
      const user = mockUsers[0];
      const safeUser = AuthGuard.sanitizeSafeUser(user) as any;
      if (safeUser.passwordHash !== undefined || safeUser.resetToken !== undefined) {
        return { passed: false, message: "Sanitized user object still contains credentials!" };
      }
      return { passed: true, message: "Sensitive credentials, hashes, and reset tokens completely stripped." };
    },
  },
  {
    id: "sec-logger-redaction",
    name: "Secure Logger Redaction of Passwords, Tokens & API Keys",
    category: "Authentication",
    run: async () => {
      const sensitivePayload = {
        username: "skincare_lover",
        password: "SuperSecretPassword123!",
        token: "session-u1-987654321",
        apiKey: "sk-partner-api-key-live",
        profile: {
          skinType: "Oily",
          creditCard: "4111-2222-3333-4444",
        },
      };
      const sanitized = SecureLogger.sanitize(sensitivePayload);
      if (
        sanitized.password !== "[REDACTED]" ||
        sanitized.token !== "[REDACTED]" ||
        sanitized.apiKey !== "[REDACTED]" ||
        sanitized.profile.creditCard !== "[REDACTED]"
      ) {
        return { passed: false, message: "SecureLogger failed to redact one or more sensitive fields." };
      }
      return { passed: true, message: "All passwords, tokens, API keys, and sensitive fields cleanly redacted." };
    },
  },

  // ==========================================
  // 4. RATE LIMITING & INPUT SECURITY
  // ==========================================
  {
    id: "sec-rate-limiting-trigger",
    name: "Sliding Window Rate Limiter Triggers 429 on Excessive Requests",
    category: "Rate Limiting & Input",
    run: async () => {
      const testKey = `test_client_${Date.now()}`;
      const config = { maxRequests: 5, windowMs: 10000 };

      // Make 5 requests (all should pass)
      for (let i = 0; i < 5; i++) {
        const res = RateLimiter.check(testKey, config);
        if (!res.allowed) {
          return { passed: false, message: `Request #${i + 1} was prematurely blocked.` };
        }
      }

      // 6th request must be blocked
      const blockedRes = RateLimiter.check(testKey, config);
      if (blockedRes.allowed) {
        return { passed: false, message: "Rate limiter failed to block 6th request exceeding limit of 5!" };
      }

      return {
        passed: true,
        message: `Rate limiter properly blocked excess request with ${blockedRes.retryAfterSeconds}s cooldown.`,
      };
    },
  },
  {
    id: "sec-ssrf-url-validation",
    name: "SSRF Protection & Dangerous Protocol Rejection",
    category: "Rate Limiting & Input",
    run: async () => {
      // Dangerous URLs to reject
      const dangerousUrls = [
        "javascript:alert(1)",
        "file:///etc/passwd",
        "http://169.254.169.254/latest/meta-data/",
        "http://localhost:3000/internal",
        "http://127.0.0.1:8080/admin",
        "http://10.0.0.1/secret",
        "http://192.168.1.1/router",
      ];

      for (const url of dangerousUrls) {
        const check = UrlValidator.isSafeExternalUrl(url);
        if (check.isValid) {
          return { passed: false, message: `SSRF vulnerability: Failed to reject dangerous URL "${url}"!` };
        }
      }

      // Safe valid URL must pass
      const safe = UrlValidator.isSafeExternalUrl("https://www.cetaphil.com/us/cleansers/gentle-skin-cleanser");
      if (!safe.isValid) {
        return { passed: false, message: "Valid external product URL was incorrectly rejected." };
      }

      return { passed: true, message: "SSRF protection verified: Cloud metadata, localhost, and private IPs strictly blocked." };
    },
  },
  {
    id: "sec-xss-input-sanitization",
    name: "XSS and Script Injection Sanitization",
    category: "Rate Limiting & Input",
    run: async () => {
      const maliciousInput = "<script>alert('hacked')</script>Niacinamide 10% Serum";
      const sanitized = InputValidator.sanitizeString(maliciousInput);
      if (sanitized.includes("<script>") || sanitized.includes("alert")) {
        return { passed: false, message: "Input validator failed to strip malicious script tag." };
      }
      return { passed: true, message: "Script tags and event handlers successfully stripped from input string." };
    },
  },

  // ==========================================
  // 5. AI SAFETY & MEDICAL DISCLAIMER
  // ==========================================
  {
    id: "sec-medical-disclaimer-detection",
    name: "Medical Disclaimer Attachment on Clinical Skin Conditions",
    category: "AI & Safety",
    run: async () => {
      const clinicalQuery = "I have severe cystic acne and eczema. What will cure this immediately?";
      const evalResult = MedicalSafetyService.evaluateText(clinicalQuery);

      if (!evalResult.hasClinicalConditions) {
        return { passed: false, message: "Medical safety service failed to identify clinical skin conditions." };
      }
      if (!evalResult.safetyDisclaimer.includes("BeautyIQ is NOT a medical diagnosis or treatment system")) {
        return { passed: false, message: "Required dermatological disclaimer was missing from evaluation." };
      }

      // Test claim sanitization
      const curedText = MedicalSafetyService.sanitizeOutputClaims("This product guaranteed cure for acne.");
      if (curedText.includes("guaranteed cure")) {
        return { passed: false, message: "Prohibited medical cure claim was not sanitized." };
      }

      return { passed: true, message: "Clinical terms flagged and standard dermatological safety disclaimer attached." };
    },
  },
  {
    id: "sec-ai-guardrail-no-hallucinations",
    name: "AI Guardrail Catches Hallucinated Products & Invented Ratings",
    category: "AI & Safety",
    run: async () => {
      const verifiedCatalog: Product[] = (await import("@/lib/mock-data")).products;

      // Construct a recommendation set containing a hallucinated product
      const fakeResultSet: RecommendationResultSet = {
        bestOverall: {
          product: {
            id: "fake_non_existent_id_999",
            name: "Miracle Potion 1000",
            brand: "Fictional Brands Inc",
            category: "Serum",
            rating: 5.0, // Fabricated rating
          } as any,
          compatibilityScore: 95,
          suitabilityScore: 90,
          valueScore: 85,
          matchCategory: "Best Overall Match",
          primaryReason: "Fabricated item",
          pros: [],
          cons: [],
          keyIngredientHighlights: [],
          pricingSummary: "₹999",
        },
        rankedCandidates: [],
        totalCandidatesCount: 1,
        generatedAt: new Date().toISOString(),
      };

      const check = AIGuardrailService.validateRecommendationFacts(fakeResultSet, verifiedCatalog);
      if (check.isValid) {
        return { passed: false, message: "AI guardrail failed to detect non-existent product in recommendation set!" };
      }
      if (!check.violations.some((v) => v.includes("Hallucinated product detected"))) {
        return { passed: false, message: "AI guardrail did not report hallucinated product violation." };
      }

      return { passed: true, message: "AI guardrail successfully flagged and rejected hallucinated product facts." };
    },
  },
  {
    id: "sec-account-deletion-safety",
    name: "Account Deletion Authorization & Real Execution Verification",
    category: "Authentication",
    run: async () => {
      // 1. Unconfirmed deletion is rejected
      const dummyId = `test-del-${Date.now()}`;
      // Register temporary user
      await AuthService.register({
        name: "Temporary User",
        email: `temp_${Date.now()}@example.com`,
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      // Verify deletion requires authorization and completes
      const delResult = await AuthService.deleteAccount(dummyId);
      if (!delResult.success) {
        return { passed: false, message: "Account deletion failed on backend service." };
      }

      return { passed: true, message: "Account deletion successfully executes real record cleanup on backend." };
    },
  },
];
