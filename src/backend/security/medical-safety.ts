/**
 * BeautyIQ Medical & Safety Disclaimer Guardrail
 * BeautyIQ is an AI-powered skincare discovery & recommendation platform, NOT a medical diagnosis system.
 * This guardrail detects clinical/medical skin conditions and attaches required dermatological disclaimers,
 * while preventing any claims of cure, prescription, or guaranteed medical results.
 */

export interface MedicalSafetyEvaluation {
  hasClinicalConditions: boolean;
  detectedTerms: string[];
  safetyDisclaimer: string;
  recommendedAction: string;
}

export const STANDARD_BEAUTYIQ_MEDICAL_DISCLAIMER =
  "Medical & Safety Notice: BeautyIQ provides cosmetic and skincare product discovery suggestions based on published cosmetic formulations. BeautyIQ is NOT a medical diagnosis or treatment system. Suggestions do not constitute dermatological advice, prescription, or clinical treatment. If you experience persistent, painful, inflamed, or severe skin conditions, please consult a certified board dermatologist or healthcare professional.";

const CLINICAL_SKIN_CONDITIONS = [
  "eczema",
  "atopic dermatitis",
  "dermatitis",
  "psoriasis",
  "rosacea",
  "fungal acne",
  "cystic acne",
  "severe acne",
  "bleeding",
  "infection",
  "hives",
  "urticaria",
  "melanoma",
  "tretinoin",
  "accutane",
  "isotretinoin",
  "hydroquinone",
  "steroid",
  "open wound",
  "burn",
];

const PROHIBITED_MEDICAL_CLAIMS = [
  "guaranteed cure",
  "cures acne",
  "diagnosed with",
  "prescription recommended",
  "100% treatment guarantee",
  "clinically cures",
];

export class MedicalSafetyService {
  /**
   * Evaluate a user query or requirement text for clinical concerns requiring safety warnings
   */
  static evaluateText(text: string): MedicalSafetyEvaluation {
    if (!text || typeof text !== "string") {
      return {
        hasClinicalConditions: false,
        detectedTerms: [],
        safetyDisclaimer: STANDARD_BEAUTYIQ_MEDICAL_DISCLAIMER,
        recommendedAction: "Standard cosmetic product discovery.",
      };
    }

    const lower = text.toLowerCase();
    const detectedTerms: string[] = [];

    for (const term of CLINICAL_SKIN_CONDITIONS) {
      if (lower.includes(term)) {
        detectedTerms.push(term);
      }
    }

    const hasClinicalConditions = detectedTerms.length > 0;

    return {
      hasClinicalConditions,
      detectedTerms,
      safetyDisclaimer: STANDARD_BEAUTYIQ_MEDICAL_DISCLAIMER,
      recommendedAction: hasClinicalConditions
        ? "Clinical or severe skin condition mentioned. Recommend consultation with a certified dermatologist before starting active chemical exfoliants or intensive treatments."
        : "Standard cosmetic product discovery.",
    };
  }

  /**
   * Sanitize AI or recommendation output text to prevent prohibited clinical cure/guarantee claims
   */
  static sanitizeOutputClaims(text: string): string {
    let sanitized = text;
    for (const claim of PROHIBITED_MEDICAL_CLAIMS) {
      const regex = new RegExp(claim, "gi");
      sanitized = sanitized.replace(regex, "cosmetic skincare support");
    }
    return sanitized;
  }
}
