import { SYMPTOM_DICTIONARY } from './symptomDictionary';

const levenshtein = (a: string, b: string) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  return matrix[b.length][a.length];
};

export const formatDisplayName = (key: string) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export interface Suggestion {
  id: string;
  displayName: string;
  matchType: 'exact' | 'prefix' | 'phrase' | 'fuzzy';
  score: number;
}

export function getSuggestions(input: string, excludeIds: string[] = []): Suggestion[] {
  const query = input.trim().toLowerCase();
  if (query.length < 2) return [];

  // Extract the last few words to allow matching in a sentence
  const words = query.split(/\s+/);
  const recentPhrases = [
    query,
    words.slice(-1).join(' '),
    words.slice(-2).join(' '),
    words.slice(-3).join(' '),
  ].filter(p => p.length >= 2);

  const results = new Map<string, Suggestion>();

  for (const [symptomKey, synonyms] of Object.entries(SYMPTOM_DICTIONARY)) {
    if (excludeIds.includes(symptomKey)) continue;

    const displayName = formatDisplayName(symptomKey);
    const allTerms = [displayName.toLowerCase(), ...synonyms.map(s => s.toLowerCase())];

    for (const term of allTerms) {
      for (const phrase of recentPhrases) {
        if (term === phrase) {
          if (!results.has(symptomKey) || results.get(symptomKey)!.score > 0) {
            results.set(symptomKey, { id: symptomKey, displayName, matchType: 'exact', score: 0 });
          }
        } else if (term.startsWith(phrase)) {
          if (!results.has(symptomKey) || results.get(symptomKey)!.score > 1) {
            results.set(symptomKey, { id: symptomKey, displayName, matchType: 'prefix', score: 1 });
          }
        } else if (term.includes(phrase)) {
          if (!results.has(symptomKey) || results.get(symptomKey)!.score > 2) {
            results.set(symptomKey, { id: symptomKey, displayName, matchType: 'phrase', score: 2 });
          }
        } else if (Math.abs(term.length - phrase.length) <= 2) {
          const dist = levenshtein(phrase, term);
          if (dist <= 2 && dist <= term.length / 3) {
            if (!results.has(symptomKey) || results.get(symptomKey)!.score > 3 + dist) {
              results.set(symptomKey, { id: symptomKey, displayName, matchType: 'fuzzy', score: 3 + dist });
            }
          }
        }
      }
    }
  }

  return Array.from(results.values())
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);
}

export function replaceLastMatchedPhrase(input: string, suggestion: Suggestion): string {
  const query = input.trim().toLowerCase();
  const words = query.split(/\s+/);
  
  // Try to find which phrase matched the best
  const possiblePhrases = [
    words.slice(-1).join(' '),
    words.slice(-2).join(' '),
    words.slice(-3).join(' '),
    query
  ].filter(p => p.length >= 2);
  
  let bestPhrase = possiblePhrases[0];
  
  // Just a simple replacement of the last matching phrase
  const synonyms = [formatDisplayName(suggestion.id).toLowerCase(), ...(SYMPTOM_DICTIONARY[suggestion.id] || []).map(s => s.toLowerCase())];
  
  for (const phrase of possiblePhrases) {
    for (const term of synonyms) {
      if (term.includes(phrase) || levenshtein(phrase, term) <= 2) {
        bestPhrase = phrase;
        break;
      }
    }
  }
  
  // Case insensitive replace of the last occurrence of bestPhrase
  const idx = input.toLowerCase().lastIndexOf(bestPhrase);
  if (idx >= 0) {
    return input.substring(0, idx) + suggestion.displayName + input.substring(idx + bestPhrase.length);
  }
  
  return input + ' ' + suggestion.displayName;
}
