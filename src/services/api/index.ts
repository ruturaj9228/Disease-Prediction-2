const API_BASE = import.meta.env.VITE_API_URL || '/api';

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

export const getHistory = async () => {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
};

export const getHistoryDetail = async (assessmentId: string) => {
  const res = await fetch(`${API_BASE}/history/${assessmentId}`);
  if (!res.ok) throw new Error("Failed to fetch assessment detail");
  return res.json();
};

export const deleteHistory = async (assessmentId: string) => {
  const res = await fetch(`${API_BASE}/history/${assessmentId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error("Failed to delete assessment");
  return res.json();
};

export const getGuidance = async (assessmentId: string) => {
  const res = await fetch(`${API_BASE}/assessment/${assessmentId}/guidance`);
  if (!res.ok) {
    if (res.status === 404) return { available: false, message: "Supportive information is not currently available for this condition." };
    throw new Error("Failed to fetch guidance");
  }
  return res.json();
};

export const getAnalyticsModels = async () => {
  // Let's assume we can fetch analytics from backend, or if not implemented yet we'll add it later.
  // Actually, we'll implement it shortly.
  const res = await fetch(`${API_BASE}/analytics/models`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
};
