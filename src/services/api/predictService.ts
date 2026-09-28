export interface PredictionResult {
  prediction: string;
  model_score: number | null;
  top_predictions: Array<{ disease: string; model_score: number }>;
  symptoms_used: string[];
}

export const analyzeSymptoms = async (symptomsObj: Record<string, boolean>): Promise<PredictionResult> => {
  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(symptomsObj)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (err: any) {
    console.error("Prediction API failed:", err);
    throw err;
  }
};
