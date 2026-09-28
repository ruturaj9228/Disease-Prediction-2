import { Link } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, Activity, HeartPulse, ListChecks, ShieldAlert } from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function Result() {
  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      {/* Demo Banner */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
        <BrainCircuit className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium">Demo Result</h3>
          <p className="text-sm text-blue-700">
            Machine-learning model will be connected in a later phase. This is a frontend layout demonstration using placeholder data.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <Link to="/chat" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Assessment
      </Link>

      <div className="space-y-6">
        {/* Primary Result Card */}
        <div className="glass-card bg-white p-6 md:p-8 rounded-2xl border-t-4 border-t-primary-500 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Activity className="h-48 w-48" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">AI-Assisted Prediction</p>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Viral Infection</h1>
                <p className="text-slate-600">Based on the symptom profile provided, this is the most likely condition.</p>
              </div>
              
              <div className="bg-primary-50 rounded-xl p-4 min-w-[140px] border border-primary-100 flex flex-col items-center justify-center shrink-0">
                <span className="text-sm text-primary-700 font-medium mb-1">Confidence</span>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-primary-700">78</span>
                  <span className="text-primary-600 font-medium">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout for details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - 2/3 */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Symptoms Considered */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-slate-400" />
                Symptoms Considered
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Fever', 'Headache', 'Body pain', 'Fatigue'].map((sym) => (
                  <span key={sym} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm border border-slate-200">
                    {sym}
                  </span>
                ))}
              </div>
            </div>

            {/* Why this prediction? */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-slate-400" />
                Why This Prediction?
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                The combination of acute fever, headache, general body aches, and sudden onset fatigue strongly correlates with common viral presentations in the dataset. Lack of localized symptoms (like severe throat pain or chest congestion) reduced the probability of specific bacterial infections.
              </p>
            </div>

            {/* Other Possibilities */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Other Possible Conditions</h3>
              <div className="space-y-4">
                {[
                  { name: 'Common Cold', conf: '45%' },
                  { name: 'Seasonal Influenza', conf: '32%' },
                  { name: 'Tension Headache', conf: '12%' },
                ].map((condition, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                    <span className="font-medium text-slate-700">{condition.name}</span>
                    <span className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">{condition.conf} match</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column - 1/3 */}
          <div className="space-y-6">
            
            {/* Warning Signs */}
            <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
              <h3 className="text-rose-800 font-semibold mb-3 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                Warning Signs
              </h3>
              <p className="text-sm text-rose-700 mb-3">Seek immediate medical care if you experience:</p>
              <ul className="space-y-2 text-sm text-rose-700/90 list-disc list-inside">
                <li>Difficulty breathing</li>
                <li>Persistent chest pain</li>
                <li>Confusion or severe drowsiness</li>
                <li>Fever above 103°F (39.4°C)</li>
              </ul>
            </div>

            {/* Supportive Guidance */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-emerald-500" />
                Supportive Guidance
              </h3>
              <p className="text-xs text-slate-500 mb-4 uppercase tracking-wider font-medium">Example guidance — clinical knowledge base will be connected later.</p>
              <div className="space-y-3">
                {[
                  'Rest and avoid strenuous activity',
                  'Stay hydrated with water or clear fluids',
                  'Monitor temperature and symptoms',
                  'Consider over-the-counter pain relievers if appropriate'
                ].map((tip, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                    <p className="text-sm text-slate-600">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Disclaimer */}
        <MedicalDisclaimer />
        
        <div className="flex justify-center pt-4">
           <Link to="/history" className="btn-secondary">
             Save to History
           </Link>
        </div>
      </div>
    </div>
  );
}
