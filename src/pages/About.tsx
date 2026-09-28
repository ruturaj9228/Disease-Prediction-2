import { Database, Server, Smartphone, Brain, ArrowRight, Layers, AlertTriangle } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">About AI HealthAssist</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          An academic prototype exploring machine-learning-based disease prediction from symptoms through a conversational interface.
        </p>
      </div>

      {/* Project Objective */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Project Objective</h2>
        <p className="text-slate-600 leading-relaxed">
          The goal of this project is to bridge the gap between complex medical datasets and intuitive user experiences. By utilizing Natural Language Processing (NLP) for symptom extraction and Machine Learning classifiers for disease prediction, the system aims to provide users with organized health information based on their everyday descriptions of how they feel.
        </p>
      </section>

      {/* System Architecture */}
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Planned System Architecture</h2>
        <div className="bg-slate-50 p-6 md:p-12 rounded-3xl border border-slate-200 overflow-x-auto">
          <div className="min-w-[600px] flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-blue-200">
                <Smartphone className="h-8 w-8" />
              </div>
              <span className="text-sm font-semibold text-slate-700">User Interface</span>
              <span className="text-xs text-slate-500">React Frontend</span>
            </div>
            
            <ArrowRight className="h-6 w-6 text-slate-300" />
            
            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-purple-200">
                <Server className="h-8 w-8" />
              </div>
              <span className="text-sm font-semibold text-slate-700">API Gateway</span>
              <span className="text-xs text-slate-500">FastAPI Backend</span>
            </div>
            
            <ArrowRight className="h-6 w-6 text-slate-300" />
            
            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-emerald-200">
                <Layers className="h-8 w-8" />
              </div>
              <span className="text-sm font-semibold text-slate-700">NLP Module</span>
              <span className="text-xs text-slate-500">Symptom Extraction</span>
            </div>
            
            <ArrowRight className="h-6 w-6 text-slate-300" />
            
            {/* Step 4 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-orange-200">
                <Brain className="h-8 w-8" />
              </div>
              <span className="text-sm font-semibold text-slate-700">ML Engine</span>
              <span className="text-xs text-slate-500">Scikit-Learn Models</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Technology Stack */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Technology Stack</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Frontend (Phase 1)</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'Recharts'].map(tech => (
                  <span key={tech} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">{tech}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Backend (Planned)</h3>
              <div className="flex flex-wrap gap-2">
                {['Python', 'FastAPI', 'scikit-learn', 'PostgreSQL'].map(tech => (
                  <span key={tech} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">{tech}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Dataset */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary-500" />
            Dataset
          </h2>
          <p className="text-slate-600 mb-4">
            Primary symptom-disease dataset will be integrated during the ML development phase. 
          </p>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100">
            The dataset is expected to contain generalized mappings of symptoms to common conditions, intended strictly for academic classification training rather than clinical diagnosis.
          </div>
        </section>
      </div>

      {/* Limitations */}
      <section className="bg-rose-50 p-8 rounded-3xl border border-rose-100">
        <h2 className="text-xl font-bold text-rose-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          System Limitations
        </h2>
        <ul className="space-y-3 text-rose-800">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0"></span>
            <span><strong>Dataset Bias:</strong> Models are only as good as their training data and may not represent all demographics or rare conditions.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0"></span>
            <span><strong>Prediction Uncertainty:</strong> ML algorithms output probabilities, not definitive answers. Many conditions share similar symptom profiles.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0"></span>
            <span><strong>Not Clinically Validated:</strong> The system has not undergone clinical trials and is not an approved medical device.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0"></span>
            <span><strong>Informational Only:</strong> AI prediction should never replace professional medical advice, diagnosis, or treatment.</span>
          </li>
        </ul>
      </section>
      
    </div>
  );
}
