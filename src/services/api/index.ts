const API_BASE = '/api';

export interface ChatMessageRequest {
  session_id: string;
  message: string;
}

export const sendChatMessage = async (data: ChatMessageRequest) => {
  const res = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
};

export const getAssessment = async (sessionId: string) => {
  const res = await fetch(`${API_BASE}/assessment/${sessionId}`);
  if (!res.ok) throw new Error("Failed to fetch assessment");
  return res.json();
};

export const resetAssessment = async (sessionId: string) => {
  const res = await fetch(`${API_BASE}/assessment/${sessionId}/reset`, { method: 'POST' });
  if (!res.ok) throw new Error("Failed to reset assessment");
  return res.json();
};

export const predictDisease = async (sessionId: string) => {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId })
  });
  if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Prediction failed");
  }
  return res.json();
};

export const getHealthStatus = async () => {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
};
