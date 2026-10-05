import { SensitiveFinding } from "../types/finding";
import { redactText } from "./redactor";
import { anonymizeText } from "./anonymizer";
import { tokenizeText } from "./tokenizer";
import { TokenMapping } from "../types/storage";

export class SanitizerEngine {
  /**
   * Transforms raw prompt into safe prompt applying redaction, anonymization, and tokenization.
   */
  public sanitize(
    text: string,
    findings: SensitiveFinding[]
  ): {
    safePrompt: string;
    tokensGenerated: TokenMapping[];
  } {
    if (!text || !findings || findings.length === 0) {
      return { safePrompt: text, tokensGenerated: [] };
    }

    // Step 1: Tokenize
    const { sanitizedText: afterTokenize, tokensGenerated } = tokenizeText(text, findings);

    // Step 2: Anonymize
    const afterAnonymize = anonymizeText(afterTokenize, findings);

    // Step 3: Redact remaining sensitive items
    const safePrompt = redactText(afterAnonymize, findings);

    return {
      safePrompt,
      tokensGenerated,
    };
  }
}

export const defaultSanitizerEngine = new SanitizerEngine();
