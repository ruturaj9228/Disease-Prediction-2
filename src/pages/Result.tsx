import { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, Activity, HeartPulse, ListChecks, ShieldAlert, BookOpen } from 'lucide-react';
import { getGuidance } from '../services/api';

export default function Result() {
  const location = useLocation();
  const data = location.state;

  if (!data || !data.result) {
    return <Navigate to="/chat" />;
  }

  const { result, chatState } = data;
  const primaryPrediction = result.prediction;
  const confidencePercent = result.model_score ? Math.round(result.model_score * 100) : 100;
  
  const [guidance, setGuidance] = useState<any>(null);
  const [loadingGuidance, setLoadingGuidance] = useState(true);

  useEffect(() => {
    if (result.assessment_id) {
      getGuidance(result.assessment_id)
        .then(setGuidance)
        .catch(err => {
          console.error("Failed to load guidance:", err);
          setGuidance({ available: false, message: "Supportive information is not currently available for this condition in this prototype." });
        })
        .finally(() => setLoadingGuidance(false));
    } else {
      setLoadingGuidance(false);
      setGuidance({ available: false, message: "No assessment ID available." });
    }
  }, [result.assessment_id]);
  
  const otherPredictions = result.top_predictions.filter((p: any) => p.disease !== primaryPrediction).slice(0, 3);
  const isUrgent = chatState?.status === 'emergency' || chatState?.safety_flag === true;

  const renderWarningSigns = () => (
    <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
      <h3 className="text-rose-800 font-semibold mb-3 flex items-center gap-2">
        <ShieldAlert className="h-5 w-5" />
        Warning Signs
      </h3>
      <p className="text-sm text-rose-700 mb-3">Seek immediate medical care if you experience:</p>
      
      {loadingGuidance ? (
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-rose-200 rounded w-full"></div>
          <div className="h-3 bg-rose-200 rounded w-5/6"></div>
        </div>
      ) : guidance?.available && guidance?.warning_signs?.length > 0 ? (
        <ul className="space-y-2 text-sm text-rose-700/90 list-disc list-inside">
          {guidance.warning_signs.map((sign: string, idx: number) => (
            <li key={idx}>{sign}</li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-2 text-sm text-rose-700/90 list-disc list-inside">
          <li>Difficulty breathing</li>
          <li>Persistent chest pain</li>
          <li>Confusion or severe drowsiness</li>
          <li>Fever above 103°F (39.4°C)</li>
        </ul>
      )}
      
      {!loadingGuidance && guidance?.available && guidance?.when_to_seek_care?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-rose-200">
          <h4 className="font-semibold text-rose-800 text-sm mb-2">When to Seek Professional Care</h4>
          <ul className="space-y-1 text-sm text-rose-700/90 list-disc list-inside">
            {guidance.when_to_seek_care.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      {/* Navigation */}
      <Link to="/chat" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Assessment
      </Link>

      <div className="space-y-6">
        {/* Urgent State Banner */}
        {isUrgent && (
          <div className="bg-red-600 text-white p-6 rounded-2xl shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="h-8 w-8" />
              <h2 className="text-2xl font-bold">URGENT MEDICAL ATTENTION</h2>
            </div>
            <p className="text-red-100 font-medium">
              The symptoms entered include warning signs that may require prompt professional medical evaluation. Seek appropriate medical/emergency care immediately.
            </p>
          </div>
        )}

        {isUrgent && renderWarningSigns()}

        {/* Primary Result Card */}
        <div className="glass-card bg-white p-6 md:p-8 rounded-2xl border-t-4 border-t-primary-500 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Activity className="h-48 w-48" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Highest-Scoring Possible Condition</p>
                <h1 className="text-3xl font-bold text-slate-900 mb-2 capitalize">{primaryPrediction.replace(/_/g, ' ')}</h1>
                <p className="text-slate-600">Highest-scoring possible condition identified by the experimental model.</p>
              </div>
              
              <div className="bg-primary-50 rounded-xl p-4 min-w-[140px] border border-primary-100 flex flex-col items-center justify-center shrink-0">
                <span className="text-sm text-primary-700 font-medium mb-1">Experimental Model Score</span>
                <div className="flex items-baseline mb-2">
                  <span className="text-3xl font-bold text-primary-700">{confidencePercent}</span>
                  <span className="text-primary-600 font-medium">%</span>
                </div>
                <p className="text-[10px] text-primary-600/80 text-center leading-tight">
                  Model score is an experimental machine-learning output and does not represent the probability of having this condition.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Symptoms Considered */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-slate-400" />
              Symptoms Considered
            </h3>
            {result.symptoms_used.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.symptoms_used.map((sym: string) => (
                  <span key={sym} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm border border-slate-200 capitalize">
                    {sym.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No specific symptoms matched.</p>
            )}
          </div>

          {/* Model Context */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-slate-400" />
              Features associated with this model prediction
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-sm border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-500">MODEL</span>
                <span className="col-span-2 text-slate-700">Random Forest</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-500">INPUT</span>
                <span className="col-span-2 text-slate-700">132 symptom features</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-500">OUTPUT</span>
                <span className="col-span-2 text-slate-700">Highest-scoring possible condition</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm pt-1">
                <span className="font-medium text-slate-500">LIMITATION</span>
                <span className="col-span-2 text-slate-700 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">Experimental model — not clinically validated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Other Possibilities */}
        {otherPredictions.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Other Possible Conditions</h3>
            <p className="text-sm text-slate-500 mb-4">Other conditions receiving relatively high model scores.</p>
            <div className="space-y-3">
              {otherPredictions.map((condition: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700 capitalize">{condition.disease.replace(/_/g, ' ')}</span>
                  <span className="text-sm bg-white px-2 py-1 rounded text-slate-600 font-medium shadow-sm border border-slate-200">
                    {Math.round(condition.model_score * 100)}% score
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isUrgent && renderWarningSigns()}

        {/* Supportive Guidance (Full Width layout as requested) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-emerald-500" />
            Supportive Guidance
          </h3>
          
          {loadingGuidance ? (
            <div className="animate-pulse space-y-3 mt-4">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-4/5"></div>
            </div>
          ) : !guidance?.available ? (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
              <p className="text-sm text-slate-600 italic">
                {guidance?.message || "Supportive information is not currently available for this condition in this prototype."}
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-slate-700 mb-6 leading-relaxed">{guidance.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column of Guidance */}
                <div className="space-y-6">
                  {guidance.supportive_care && guidance.supportive_care.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        Supportive Care
                      </h4>
                      <ul className="space-y-2">
                        {guidance.supportive_care.map((tip: string, idx: number) => (
                          <li key={idx} className="text-sm text-slate-700 leading-relaxed pl-4 relative">
                            <span className="absolute left-0 top-2 w-1 h-1 bg-slate-300 rounded-full"></span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {guidance.general_precautions && guidance.general_precautions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        General Precautions
                      </h4>
                      <ul className="space-y-2">
                        {guidance.general_precautions.map((tip: string, idx: number) => (
                          <li key={idx} className="text-sm text-slate-700 leading-relaxed pl-4 relative">
                            <span className="absolute left-0 top-2 w-1 h-1 bg-slate-300 rounded-full"></span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right Column of Guidance */}
                <div className="space-y-6">
                  {guidance.things_to_avoid && guidance.things_to_avoid.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-red-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Things to Avoid
                      </h4>
                      <ul className="space-y-2">
                        {guidance.things_to_avoid.map((tip: string, idx: number) => (
                          <li key={idx} className="text-sm text-slate-700 leading-relaxed pl-4 relative">
                            <span className="absolute left-0 top-2 w-1 h-1 bg-slate-300 rounded-full"></span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  Sources
                </h4>
                {guidance.source && guidance.source.name ? (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                    <div>
                      <span className="text-slate-400 mr-2">Source:</span>
                      {guidance.source.url ? (
                        <a href={guidance.source.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-600 hover:text-primary-800 hover:underline">
                          {guidance.source.name}
                        </a>
                      ) : (
                        <span className="font-medium text-slate-700">{guidance.source.name}</span>
                      )}
                    </div>
                    {guidance.source.last_reviewed && (
                      <div>
                        <span className="text-slate-400 mr-2">Reviewed:</span>
                        <span>{guidance.source.last_reviewed}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Source information is not currently available.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 border-t border-slate-200 pt-8">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Medical Disclaimer</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              AI HealthAssist is an experimental educational prototype. Its predictions are based on the symptoms provided and are not medical diagnoses. Supportive information is for general educational purposes and should not replace evaluation by a qualified healthcare professional.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center pt-4">
           <Link to="/history" className="btn-secondary">
             View Assessment History
           </Link>
        </div>
      </div>
    </div>
  );
}
