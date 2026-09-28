import { describe, it, expect } from 'vitest';
import { extractSymptoms, extractDuration, extractSeverity, checkSafetyFlags, detectUnknownSymptoms } from './extractor';
import { createInitialState, processUserMessage } from '../chat/engine';

describe('Symptom Extractor', () => {
  it('1. Single symptom', () => {
    const res = extractSymptoms("I have fever");
    expect(res.present).toContain("high_fever");
  });

  it('2. Multiple symptoms', () => {
    const res = extractSymptoms("I have fever, headache and cough");
    expect(res.present).toContain("high_fever");
    expect(res.present).toContain("headache");
    expect(res.present).toContain("cough");
  });

  it('3. Negation', () => {
    const res = extractSymptoms("I don't have cough");
    expect(res.absent).toContain("cough");
    expect(res.present.length).toBe(0);
  });

  it('4. Mixed positive/negative', () => {
    const res = extractSymptoms("I have fever but no cough");
    expect(res.present).toContain("high_fever");
    expect(res.absent).toContain("cough");
  });

  it('5. Synonyms', () => {
    const res = extractSymptoms("My head hurts");
    expect(res.present).toContain("headache");
  });

  it('6. Duration', () => {
    const dur = extractDuration("I have had fever for three days");
    expect(dur).toBe("for three days");
  });

  it('7. Severity', () => {
    const sev = extractSeverity("My headache is severe");
    expect(sev).toBe("severe");
  });

  it('8. Ambiguous symptom', () => {
    const res = extractSymptoms("Maybe I have fever");
    expect(res.unknown).toContain("high_fever");
  });

  it('9. Unknown symptom', () => {
    const res = extractSymptoms("I have an unusual eye sensation");
    expect(res.present.length).toBe(0);
    expect(detectUnknownSymptoms("I have an unusual eye sensation", res)).toBe(true);
  });

  it('10. Safety phrase', () => {
    expect(checkSafetyFlags("I'm having severe difficulty breathing")).toBe(true);
  });
});

describe('Chat Engine', () => {
  it('11. Repeated question prevention', () => {
    let state = createInitialState();
    state = processUserMessage("I have fever", state);
    expect(state.questions_asked).toContain('duration');
    
    // User answers duration
    state = processUserMessage("For two days", state);
    // Should NOT ask duration again
    const lastMessage = state.messages[state.messages.length - 1].text;
    expect(lastMessage).not.toContain("How long");
    // Should ask about related symptoms
    expect(state.questions_asked).toContain('related_symptoms_1');
  });

  it('12. Conversation reset', () => {
    let state = createInitialState();
    state = processUserMessage("I have a fever", state);
    expect(Object.keys(state.symptoms).length).toBeGreaterThan(0);
    
    // Simulating reset is just calling createInitialState() again in React
    state = createInitialState();
    expect(Object.keys(state.symptoms).length).toBe(0);
  });
});
