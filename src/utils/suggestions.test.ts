import { describe, it, expect } from 'vitest';
import { getSuggestions, replaceLastMatchedPhrase } from './suggestions';

describe('Symptom Suggestions', () => {
  it('matches prefix "head"', () => {
    const results = getSuggestions('head');
    expect(results.some(r => r.id === 'headache')).toBe(true);
  });

  it('matches partial phrase "head hur"', () => {
    const results = getSuggestions('head hur');
    expect(results.some(r => r.id === 'headache')).toBe(true);
  });

  it('matches synonyms "body ache"', () => {
    const results = getSuggestions('body ache');
    expect(results.some(r => r.id === 'muscle_pain')).toBe(true);
  });

  it('matches synonyms "throwing up"', () => {
    const results = getSuggestions('throwing up');
    expect(results.some(r => r.id === 'vomiting')).toBe(true);
  });

  it('matches phrases "skin itchy"', () => {
    const results = getSuggestions('skin itchy');
    expect(results.some(r => r.id === 'itching')).toBe(true);
  });

  it('fuzzy matches "headche"', () => {
    const results = getSuggestions('headche');
    expect(results.some(r => r.id === 'headache')).toBe(true);
  });

  it('returns nothing for unrelated text', () => {
    const results = getSuggestions('xyzqwe asdfg');
    expect(results.length).toBe(0);
  });

  it('excludes already selected symptoms', () => {
    const results = getSuggestions('headache', ['headache']);
    expect(results.some(r => r.id === 'headache')).toBe(false);
  });
  
  it('replaces the matched phrase properly', () => {
    const sug = { id: 'headache', displayName: 'Headache', matchType: 'exact', score: 0 } as any;
    expect(replaceLastMatchedPhrase("i don't have a head", sug)).toBe("i don't have a Headache");
  });
});
