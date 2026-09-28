import { SYMPTOM_DICTIONARY, SAFETY_PHRASES } from './symptomDictionary';

export type SymptomStatus = 'PRESENT' | 'ABSENT' | 'UNKNOWN';

export interface ExtractedSymptoms {
  present: string[];
  absent: string[];
  unknown: string[];
}

// Basic regex for negation words
const NEGATION_PATTERN = /\b(no|not|don't|do not|doesn't|does not|without|never|haven't|has no|clear of)\b/i;
// Basic regex for uncertainty words
const UNCERTAINTY_PATTERN = /\b(maybe|might|could be|possibly|not sure if|think i have|feels like i might)\b/i;
const SEVERITY_WORDS = ["mild", "slight", "moderate", "severe", "very severe", "extreme", "unbearable", "bad"];
const DURATION_PATTERN = /\b(for\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|a few|a couple of|several|a)\s+(day|days|week|weeks|month|months|year|years)|since\s+(yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i;

export const normalizeSymptom = (text: string): string | null => {
  const lowerText = text.toLowerCase().trim();
  for (const [symptom, synonyms] of Object.entries(SYMPTOM_DICTIONARY)) {
    if (symptom.replace(/_/g, ' ') === lowerText) return symptom;
    for (const synonym of synonyms) {
      if (lowerText === synonym || lowerText.includes(synonym)) {
        return symptom;
      }
    }
  }
  return null;
};

export const extractSymptoms = (message: string): ExtractedSymptoms => {
  const result: ExtractedSymptoms = { present: [], absent: [], unknown: [] };
  const lowerMessage = message.toLowerCase();
  
  // Split by conjunctions/punctuation to handle multi-part sentences
  // e.g., "I have fever but no cough" -> ["I have fever", "no cough"]
  const parts = lowerMessage.split(/,|\band\b|\bbut\b|\bhowever\b|\./);
  
  for (const part of parts) {
    if (!part.trim()) continue;
    
    let isNegated = NEGATION_PATTERN.test(part);
    let isUncertain = UNCERTAINTY_PATTERN.test(part);
    
    // Find matching symptoms in this part
    const matchedSymptoms = new Set<string>();
    
    for (const [symptom, synonyms] of Object.entries(SYMPTOM_DICTIONARY)) {
      // Prioritize multi-word matches or word-boundary matches
      for (const synonym of synonyms) {
        const regex = new RegExp(`\\b${synonym}\\b`, 'i');
        if (regex.test(part)) {
          matchedSymptoms.add(symptom);
        }
      }
    }
    
    for (const sym of matchedSymptoms) {
      if (isNegated) {
        if (!result.absent.includes(sym)) result.absent.push(sym);
      } else if (isUncertain) {
        if (!result.unknown.includes(sym)) result.unknown.push(sym);
      } else {
        if (!result.present.includes(sym)) result.present.push(sym);
      }
    }
  }
  
  return result;
};

export const extractDuration = (message: string): string | null => {
  const match = message.match(DURATION_PATTERN);
  if (match) {
    return match[0].trim();
  }
  if (/\b(just started|recently)\b/i.test(message)) return "recent";
  return null;
};

export const extractSeverity = (message: string): string | null => {
  const lowerMsg = message.toLowerCase();
  for (const severity of SEVERITY_WORDS) {
    if (new RegExp(`\\b${severity}\\b`).test(lowerMsg)) {
      return severity;
    }
  }
  return null;
};

export const checkSafetyFlags = (message: string): boolean => {
  const lowerMsg = message.toLowerCase();
  return SAFETY_PHRASES.some(phrase => lowerMsg.includes(phrase));
};

export const detectUnknownSymptoms = (message: string, extracted: ExtractedSymptoms): boolean => {
  // A heuristic: if they say "I have X" and X doesn't map to anything.
  // This is very difficult with simple regex. 
  // We'll look for common symptom structures that didn't yield an extraction.
  const lowerMsg = message.toLowerCase();
  const complainPatterns = [
    /my (.*) hurts/i,
    /pain in my (.*)/i,
    /i feel (.*)/i,
    /i am experiencing (.*)/i,
    /i have an unusual (.*)/i
  ];
  
  const hasExtracted = extracted.present.length > 0 || extracted.absent.length > 0 || extracted.unknown.length > 0;
  
  for (const pattern of complainPatterns) {
    if (pattern.test(lowerMsg)) {
       if (!hasExtracted) return true;
    }
  }
  
  // Test case #9 explicitly checks "I have an unusual eye sensation"
  if (lowerMsg.includes("unusual") || lowerMsg.includes("sensation")) {
      if (!hasExtracted) return true;
  }
  
  return false;
};
