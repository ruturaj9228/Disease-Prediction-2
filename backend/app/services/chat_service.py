import time
import uuid
import re
from typing import Dict, List, Optional
from ..schemas.api_schemas import AssessmentResponse, Message
from .symptom_service import (
    extract_symptoms, extract_duration, extract_severity,
    check_safety_flags, detect_unknown_symptoms
)

_sessions: Dict[str, dict] = {}

def create_initial_state(session_id: str = None) -> dict:
    if not session_id:
        session_id = str(uuid.uuid4())
    state = {
        "session_id": session_id,
        "symptoms": {},
        "duration": None,
        "severity": None,
        "messages": [
            {
                "id": f"init-{int(time.time())}",
                "sender": "assistant",
                "text": "Hello. I am the AI HealthAssist symptom checker. Please describe your symptoms. (Note: I am an experimental AI and cannot provide medical diagnosis.)"
            }
        ],
        "questions_asked": [],
        "answered_questions": [],
        "current_question": None,
        "assessment_status": "collecting"
    }
    _sessions[session_id] = state
    return state

def get_session(session_id: str) -> Optional[dict]:
    return _sessions.get(session_id)

def reset_session(session_id: str) -> dict:
    return create_initial_state(session_id)

def interpret_yes_no(message: str) -> str:
    msg = message.lower().strip()
    # Remove punctuation
    msg = re.sub(r'[^\w\s]', '', msg)
    
    yes_words = {"yes", "yeah", "yep", "correct", "i do", "i have", "definitely", "absolutely"}
    no_words = {"no", "nope", "nah", "i dont", "i do not", "not really", "none", "nothing", "no i dont"}
    unknown_words = {"i dont know", "not sure", "maybe", "possibly", "uncertain", "dont know"}
    
    if msg in yes_words:
        return "YES"
    if msg in no_words:
        return "NO"
    if msg in unknown_words:
        return "UNKNOWN"
        
    for word in yes_words:
        if msg.startswith(word + " "):
            return "YES"
    for word in no_words:
        if msg.startswith(word + " "):
            return "NO"
    for word in unknown_words:
        if msg.startswith(word + " "):
            return "UNKNOWN"
            
    return "NONE"

def process_user_message(session_id: str, message: str) -> dict:
    state = get_session(session_id)
    if not state:
        state = create_initial_state(session_id)
        
    state["messages"].append({
        "id": str(int(time.time() * 1000)),
        "sender": "user",
        "text": message
    })

    if check_safety_flags(message):
        state["assessment_status"] = "emergency"
        state["messages"].append({
            "id": str(int(time.time() * 1000) + 1),
            "sender": "assistant",
            "text": "Some of the symptoms you've described may require urgent medical attention. Please seek immediate medical care rather than relying on this AI assessment."
        })
        return state

    extracted = extract_symptoms(message)
    duration = extract_duration(message)
    severity = extract_severity(message)

    yes_no_intent = interpret_yes_no(message)
    current_q = state.get("current_question")
    
    # Handle implicit meaning based on current question
    if current_q and yes_no_intent != "NONE":
        q_type = current_q.get("type")
        targets = current_q.get("targets", [])
        
        if yes_no_intent == "YES":
            if q_type in ["symptom_group", "safety_check"]:
                # If they just said "yes", without specifying which one.
                # If they didn't explicitly mention symptoms, we might assume they have them
                if not extracted["present"] and not extracted["absent"]:
                    for t in targets:
                        extracted["present"].append(t)
        elif yes_no_intent == "NO":
            if q_type in ["symptom_group", "safety_check", "uncertainty"]:
                for t in targets:
                    if t not in extracted["present"]:
                        extracted["absent"].append(t)
        elif yes_no_intent == "UNKNOWN":
            if q_type in ["symptom_group", "safety_check", "uncertainty"]:
                for t in targets:
                    if t not in extracted["present"] and t not in extracted["absent"]:
                        extracted["unknown"].append(t)
                        
    # Update state
    has_new_info = False
    for sym in extracted['present']:
        if state['symptoms'].get(sym) != 'PRESENT':
            state['symptoms'][sym] = 'PRESENT'
            has_new_info = True
    for sym in extracted['absent']:
        if state['symptoms'].get(sym) != 'ABSENT':
            state['symptoms'][sym] = 'ABSENT'
            has_new_info = True
    for sym in extracted['unknown']:
        if sym not in state['symptoms']:
            state['symptoms'][sym] = 'UNKNOWN'
            has_new_info = True

    if duration and not state['duration']:
        state['duration'] = duration
        has_new_info = True
        
    if severity and not state['severity']:
        state['severity'] = severity
        has_new_info = True

    # Mark current question as answered
    if current_q:
        q_type = current_q.get("type")
        targets = current_q.get("targets", [])
        
        answered = False
        if yes_no_intent != "NONE":
            answered = True
        elif q_type == "duration" and duration:
            answered = True
        elif q_type == "severity" and severity:
            answered = True
        elif q_type in ["symptom_group", "safety_check"]:
            # If they provided explicit symptoms that overlap with the targets
            if any(t in extracted["present"] or t in extracted["absent"] for t in targets):
                answered = True

        if answered:
            state["answered_questions"].append(q_type)
            state["current_question"] = None

    if detect_unknown_symptoms(message, extracted) and not extracted['present'] and not extracted['absent'] and yes_no_intent == "NONE":
        state["messages"].append({
            "id": str(int(time.time() * 1000) + 1),
            "sender": "assistant",
            "text": "I've noted that you're experiencing a symptom, but I don't have a matching symptom category in the current prediction model. Could you describe any other common symptoms like fever, headache, cough, or pain?"
        })
        return state

    present_symptoms = [sym.replace('_', ' ') for sym, status in state['symptoms'].items() if status == 'PRESENT']
    unknown_symptoms = [sym.replace('_', ' ') for sym, status in state['symptoms'].items() if status == 'UNKNOWN']

    response_text = ""
    next_question = None

    if present_symptoms:
        response_text = f"I've noted: {', '.join(present_symptoms)}. "

    # Determine next question
    if unknown_symptoms and 'uncertainty' not in state['answered_questions'] and 'uncertainty' not in state['questions_asked']:
        response_text += f"You mentioned you might have {', '.join(unknown_symptoms)}. Have you verified this or do you feel it strongly?"
        next_question = {"type": "uncertainty", "targets": unknown_symptoms}
    elif not state['duration'] and 'duration' not in state['answered_questions'] and 'duration' not in state['questions_asked']:
        response_text += "How long have you been experiencing these symptoms?"
        next_question = {"type": "duration", "targets": []}
    elif len(present_symptoms) > 0 and 'safety_check' not in state['answered_questions'] and 'safety_check' not in state['questions_asked']:
        response_text += "Do you have any difficulty breathing or severe chest pain?"
        next_question = {"type": "safety_check", "targets": ["breathlessness", "chest_pain"]}
    elif len(present_symptoms) > 0 and len(present_symptoms) < 3 and 'related_symptoms_1' not in state['answered_questions'] and 'related_symptoms_1' not in state['questions_asked']:
        potential_targets = ["fatigue", "nausea", "vomiting", "cough"]
        # Only ask about ones we don't know yet
        remaining_targets = [t for t in potential_targets if t not in state['symptoms']]
        if remaining_targets:
            response_text += f"Are you also experiencing any common symptoms like {', '.join(remaining_targets).replace('_', ' ')}?"
            next_question = {"type": "related_symptoms_1", "targets": remaining_targets}
        else:
            state['questions_asked'].append('related_symptoms_1') # skip it
            state['assessment_status'] = 'ready'
            response_text += "Thanks. I have enough information to analyze the symptoms you've provided."
    else:
        if len(present_symptoms) > 0:
            state['assessment_status'] = 'ready'
            response_text += "Thanks. I have enough information to analyze the symptoms you've provided."
        else:
            if not has_new_info and not state.get("current_question"):
                response_text = "Could you provide more specific symptoms, such as any pain, fever, skin changes, or digestive issues?"
            elif not response_text:
                response_text = "Could you provide more specific symptoms, such as any pain, fever, skin changes, or digestive issues?"

    if next_question:
        state['current_question'] = next_question
        state['questions_asked'].append(next_question['type'])
    else:
        # If we reached ready but there's a current question that was asked but not answered
        if not response_text and state.get('current_question'):
            pass # Keep waiting for answer

    if response_text:
        state["messages"].append({
            "id": str(int(time.time() * 1000) + 1),
            "sender": "assistant",
            "text": response_text.strip()
        })

    return state
