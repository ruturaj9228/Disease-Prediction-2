import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, Target, BarChart2, Hash, AlertCircle, List } from 'lucide-react';
import { getAnalyticsModels } from '../services/api';

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnalyticsModels()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load analytics", err);
        setError("Model evaluation data could not be loaded.");
        setLoading(false);
      });
  }, []);

  const prepareChartData = () => {
    if (!data?.metrics?.experiment_b_cleaned) return [];
    return data.metrics.experiment_b_cleaned.map((m: any) => ({
      name: m.model,
      accuracy: Math.round((m.accuracy || 0) * 100),
      precision: Math.round((m.macro_precision || 0) * 100),
      recall: Math.round((m.macro_recall || 0) * 100)
    }));
  };

  const chartData = prepareChartData();
  const rfData = data?.metrics?.experiment_b_cleaned?.find((m: any) => m.model === 'Random Forest');
  
  const overallAccuracy = rfData ? Math.round((rfData.accuracy) * 100) : null;
  const avgPrecision = rfData ? Math.round((rfData.macro_precision) * 100) : null;
  const avgRecall = rfData ? Math.round((rfData.macro_recall) * 100) : null;
  const f1Score = rfData ? (rfData.macro_f1).toFixed(2) : null;

  const renderConfusionMatrix = () => {
    if (!data?.confusion_matrix) return <p className="text-sm text-slate-500">Not available</p>;
    const matrix = data.confusion_matrix;
    return (
      <div className="w-full overflow-auto max-h-[300px] border border-slate-100 rounded-lg bg-white mt-2 min-w-0 relative">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${matrix.length}, minmax(14px, 1fr))` }} className="gap-[1px] bg-slate-100 p-1 min-w-max">
          {matrix.map((row: number[], i: number) => 
            row.map((val: number, j: number) => {
              const intensity = val > 0 ? Math.min(val / 2, 1) : 0;
              const bg = `rgba(14, 165, 233, ${intensity + (val > 0 ? 0.1 : 0)})`;
              return (
                <div 
                  key={`${i}-${j}`} 
                  title={`True: ${i}, Pred: ${j} = ${val}`}
                  className="aspect-square w-full min-w-[14px] text-[8px] flex items-center justify-center text-slate-700 bg-white hover:ring-1 hover:ring-primary-500 hover:z-10 relative"
                  style={{ backgroundColor: bg }}
                >
                  {val > 0 ? val : ''}
                </div>
              )
            })
          )}
        </div>
      </div>
    );
  };

  const renderFeatureImportance = () => {
    if (!data?.feature_importance) return null;
    const topFeatures = data.feature_importance.slice(0, 10);
    return (
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 mt-8 min-w-0 w-full overflow-hidden">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <List className="h-5 w-5 text-slate-400" />
            Feature Importance
          </h3>
          <p className="text-sm text-slate-500">Top 10 most influential symptoms for the Random Forest model.</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={topFeatures}
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <YAxis dataKey="feature" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <RechartsTooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }}
                formatter={(val: any) => typeof val === 'number' ? val.toFixed(4) : val}
              />
              <Bar dataKey="importance" name="Importance" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

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
            <p className="mt-2 text-slate-500">Loading model evaluation...</p>
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
                <h3 className="text-3xl font-bold text-slate-800">{overallAccuracy !== null ? `${overallAccuracy}%` : 'N/A'}</h3>
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
                <h3 className="text-3xl font-bold text-slate-800">{avgPrecision !== null ? `${avgPrecision}%` : 'N/A'}</h3>
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
                <h3 className="text-3xl font-bold text-slate-800">{avgRecall !== null ? `${avgRecall}%` : 'N/A'}</h3>
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
                <h3 className="text-3xl font-bold text-slate-800">{f1Score !== null ? f1Score : 'N/A'}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-0 w-full">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0 w-full">
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
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
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

            {/* Confusion Matrix */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col min-w-0 w-full">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-slate-400 shrink-0" />
                  Confusion Matrix
                </h3>
                <p className="text-sm text-slate-500">Evaluation on test set (Random Forest)</p>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-2 sm:p-4 w-full min-w-0 overflow-hidden">
                {renderConfusionMatrix()}
                <p className="text-xs text-slate-400 mt-4 text-center px-2">
                  Showing true vs predicted class distribution. Hover over cells for counts.
                </p>
              </div>
            </div>
          </div>
          
          {/* Feature Importance */}
          {renderFeatureImportance()}
        </>
      )}
    </div>
  );
}
