import { extractSymptoms, extractDuration, extractSeverity, checkSafetyFlags, detectUnknownSymptoms, SymptomStatus, ExtractedSymptoms } from '../nlp/extractor';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
}

export interface ConversationState {
  symptoms: Record<string, SymptomStatus>;
  duration: string | null;
  severity: string | null;
  messages: ChatMessage[];
  questions_asked: string[];
  assessment_status: 'collecting' | 'ready' | 'emergency';
}

export const createInitialState = (): ConversationState => ({
  symptoms: {},
  duration: null,
  severity: null,
  messages: [
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Hello. I am the AI HealthAssist symptom checker. Please describe your symptoms. (Note: I am an experimental AI and cannot provide medical diagnosis.)"
    }
  ],
  questions_asked: [],
  assessment_status: 'collecting'
});

export const processUserMessage = (message: string, state: ConversationState): ConversationState => {
  const newState = { ...state, messages: [...state.messages] };
  
  // Add user message
  newState.messages.push({
    id: Date.now().toString(),
    sender: 'user',
    text: message
  });

  // Check safety flags
  if (checkSafetyFlags(message)) {
    newState.assessment_status = 'emergency';
    newState.messages.push({
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: "Some of the symptoms you've described may require urgent medical attention. Please seek immediate medical care rather than relying on this AI assessment."
    });
    return newState;
  }

  // Extract
  const extracted = extractSymptoms(message);
  const duration = extractDuration(message);
  const severity = extractSeverity(message);
  
  let hasNewInfo = false;

  // Update symptoms state
  extracted.present.forEach(sym => {
    if (newState.symptoms[sym] !== 'PRESENT') {
      newState.symptoms[sym] = 'PRESENT';
      hasNewInfo = true;
    }
  });
  extracted.absent.forEach(sym => {
    if (newState.symptoms[sym] !== 'ABSENT') {
      newState.symptoms[sym] = 'ABSENT';
      hasNewInfo = true;
    }
  });
  extracted.unknown.forEach(sym => {
    if (!newState.symptoms[sym]) {
      newState.symptoms[sym] = 'UNKNOWN';
      hasNewInfo = true;
    }
  });

  if (duration && !newState.duration) {
    newState.duration = duration;
    hasNewInfo = true;
  }
  
  if (severity && !newState.severity) {
    newState.severity = severity;
    hasNewInfo = true;
  }

  // Handle completely unknown symptoms
  if (detectUnknownSymptoms(message, extracted) && extracted.present.length === 0 && extracted.absent.length === 0) {
    newState.messages.push({
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: "I've noted that you're experiencing a symptom, but I don't have a matching symptom category in the current prediction model. Could you describe any other common symptoms like fever, headache, cough, or pain?"
    });
    return newState;
  }

  // Generate response
  const presentSymptoms = Object.entries(newState.symptoms)
    .filter(([_, status]) => status === 'PRESENT')
    .map(([sym]) => sym.replace(/_/g, ' '));
    
  const unknownSymptoms = Object.entries(newState.symptoms)
    .filter(([_, status]) => status === 'UNKNOWN')
    .map(([sym]) => sym.replace(/_/g, ' '));

  if (hasNewInfo) {
    let responseText = "";
    
    // Address uncertainty
    if (unknownSymptoms.length > 0 && !newState.questions_asked.includes('uncertainty')) {
      responseText = `You mentioned you might have ${unknownSymptoms.join(', ')}. Have you verified this or do you feel it strongly? `;
      newState.questions_asked.push('uncertainty');
    } else {
      if (presentSymptoms.length > 0) {
        responseText = `I've noted: ${presentSymptoms.join(', ')}. `;
      }
      
      // Follow-up question engine
      if (!newState.duration && !newState.questions_asked.includes('duration')) {
        responseText += "How long have you been experiencing these symptoms?";
        newState.questions_asked.push('duration');
      } else if (presentSymptoms.length < 3 && !newState.questions_asked.includes('related_symptoms_1')) {
        responseText += "Are you also experiencing any common symptoms like fatigue, nausea, vomiting, or cough?";
        newState.questions_asked.push('related_symptoms_1');
      } else if (presentSymptoms.length >= 3 && !newState.questions_asked.includes('safety_check')) {
        responseText += "Do you have any difficulty breathing or severe chest pain?";
        newState.questions_asked.push('safety_check');
      } else {
        newState.assessment_status = 'ready';
        responseText = "Thanks. I have enough information to analyze the symptoms you've provided.";
      }
    }
    
    newState.messages.push({
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: responseText.trim()
    });
  } else {
    // No new extractable info
    newState.messages.push({
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: "Could you provide more specific symptoms, such as any pain, fever, skin changes, or digestive issues?"
    });
  }

  return newState;
};
