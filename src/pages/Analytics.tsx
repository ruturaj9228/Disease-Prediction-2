import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, Target, BarChart2, Hash, AlertCircle } from 'lucide-react';

const MOCK_MODEL_METRICS = [
  { name: 'Decision Tree', accuracy: 82, precision: 80, recall: 83, f1: 81 },
  { name: 'Random Forest', accuracy: 91, precision: 89, recall: 92, f1: 90 },
  { name: 'Naive Bayes', accuracy: 76, precision: 74, recall: 78, f1: 76 },
  { name: 'KNN', accuracy: 84, precision: 83, recall: 85, f1: 84 },
  { name: 'SVM', accuracy: 88, precision: 87, recall: 89, f1: 88 },
];

const METRIC_CARDS = [
  { title: 'Overall Accuracy', value: '91.4%', icon: Target, trend: '+2.1%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: 'Avg Precision', value: '89.2%', icon: Hash, trend: '+1.5%', color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Avg Recall', value: '92.1%', icon: Brain, trend: '+3.2%', color: 'text-purple-600', bg: 'bg-purple-50' },
  { title: 'F1 Score', value: '0.90', icon: BarChart2, trend: '+0.02', color: 'text-orange-600', bg: 'bg-orange-50' },
];

export default function Analytics() {
  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Model Evaluation Analytics</h1>
        <p className="text-slate-600 mt-1">Performance metrics for the machine-learning models predicting conditions from symptoms.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-8 flex gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-amber-800">Demo Metrics Warning</h3>
          <p className="text-sm text-amber-700 mt-1">
            Actual values will be populated after model training is complete and connected to the backend. The data displayed below is for layout demonstration only.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {METRIC_CARDS.map((metric, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${metric.bg}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                {metric.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{metric.title}</p>
              <h3 className="text-3xl font-bold text-slate-800">{metric.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Model Comparison</h3>
            <p className="text-sm text-slate-500">Comparing accuracy, precision, and recall across trained classifiers.</p>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MOCK_MODEL_METRICS}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
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
            <h3 className="text-lg font-bold text-slate-800">Confusion Matrix</h3>
            <p className="text-sm text-slate-500">Random Forest Performance</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <div className="text-center p-6">
              <BarChart2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500 mb-1">Visualization Placeholder</p>
              <p className="text-xs text-slate-400">Heatmap will be generated after real inference testing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
