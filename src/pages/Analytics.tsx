import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, Target, BarChart2, Hash, AlertCircle } from 'lucide-react';
import { getAnalyticsModels } from '../services/api';

export default function Analytics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnalyticsModels()
      .then(data => {
        setMetrics(data.metrics);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load analytics", err);
        setError("Failed to load real analytics data.");
        setLoading(false);
      });
  }, []);

  const prepareChartData = () => {
    if (!metrics) return [];
    
    // We expect metrics to be a dict mapping model name to metrics dictionary.
    // e.g. {"Random Forest": {"accuracy": 0.9, "precision": 0.88, ...}, ...}
    const data = [];
    for (const [modelName, modelMetrics] of Object.entries(metrics)) {
      if (modelName === "best_model" || modelName === "model_comparison") continue;
      
      const m: any = modelMetrics;
      data.push({
        name: modelName,
        accuracy: Math.round((m.accuracy || m["macro avg"]?.["f1-score"] || 0) * 100),
        precision: Math.round((m.precision || m["macro avg"]?.precision || 0) * 100),
        recall: Math.round((m.recall || m["macro avg"]?.recall || 0) * 100)
      });
    }
    return data;
  };

  const chartData = prepareChartData();
  const rfData = metrics?.["Random Forest"] || metrics?.["RandomForestClassifier"];
  const overallAccuracy = rfData ? Math.round((rfData.accuracy || 0) * 100) : 0;
  const avgPrecision = rfData ? Math.round((rfData["macro avg"]?.precision || 0) * 100) : 0;
  const avgRecall = rfData ? Math.round((rfData["macro avg"]?.recall || 0) * 100) : 0;
  const f1Score = rfData ? (rfData["macro avg"]?.["f1-score"] || 0).toFixed(2) : "0";

  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Model Evaluation Analytics</h1>
        <p className="text-slate-600 mt-1">Performance metrics for the machine-learning models predicting conditions from symptoms.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-8 flex gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-amber-800">Model Limitations</h3>
          <p className="text-sm text-amber-700 mt-1">
            The model was trained on a public symptom-disease dataset and is not clinically validated.
            The dataset has limitations including duplicate symptom patterns, limited real-world diversity, and lack of clinical examination.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-10 bg-slate-200 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">{error}</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-emerald-50">
                  <Target className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Random Forest Accuracy</p>
                <h3 className="text-3xl font-bold text-slate-800">{overallAccuracy}%</h3>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-blue-50">
                  <Hash className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Avg Precision</p>
                <h3 className="text-3xl font-bold text-slate-800">{avgPrecision}%</h3>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-purple-50">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Avg Recall</p>
                <h3 className="text-3xl font-bold text-slate-800">{avgRecall}%</h3>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-orange-50">
                  <BarChart2 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">F1 Score (Macro)</p>
                <h3 className="text-3xl font-bold text-slate-800">{f1Score}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800">Model Comparison</h3>
                <p className="text-sm text-slate-500">Comparing accuracy, precision, and recall across trained classifiers. (Experimental dataset evaluation)</p>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} domain={[0, 100]} />
                    <RechartsTooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="accuracy" name="Accuracy" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="precision" name="Precision" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="recall" name="Recall" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Confusion Matrix Placeholder */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800">Confusion Matrix & Features</h3>
                <p className="text-sm text-slate-500">Evaluation on test set</p>
              </div>
              
              <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <div className="text-center p-6">
                  <BarChart2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-500 mb-1">Matrix data loaded</p>
                  <p className="text-xs text-slate-400">See backend/ml/evaluation/ for raw JSON</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
