import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, Brain, Activity, ShieldAlert, HeartPulse, Stethoscope, Search, Shield } from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function Home() {
  return (
    <div className="flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              AI-powered symptom understanding, <span className="text-primary-600">made conversational.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl">
              Describe what you're experiencing in your own words. AI HealthAssist helps organize your symptoms and provides an AI-assisted prediction for informational purposes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/chat" className="btn-primary text-lg px-8 py-4">
                Start Symptom Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a href="#how-it-works" className="btn-secondary text-lg px-8 py-4">
                How It Works
              </a>
            </div>
            <div className="pt-4">
              <MedicalDisclaimer />
            </div>
          </div>
          
          {/* Hero Visual - Chat Demo */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-100 to-blue-50 rounded-[2.5rem] transform rotate-3 scale-105 -z-10"></div>
            <div className="glass-card p-6 md:p-8 relative z-10 border border-white/40 shadow-2xl rounded-3xl bg-white/90">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-primary-100 p-2 rounded-full">
                  <Activity className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Health Assistant Demo</h3>
                  <p className="text-xs text-slate-500">Not a real medical diagnosis</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-primary-600 text-white rounded-2xl rounded-tr-sm py-3 px-4 max-w-[85%] shadow-sm">
                    <p className="text-sm md:text-base">I've had a fever and headache since yesterday.</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm py-3 px-4 max-w-[85%] shadow-sm">
                    <p className="text-sm md:text-base">I understand. I'll ask a few questions to better understand your symptoms.</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm py-3 px-4 max-w-[85%] shadow-sm">
                    <p className="text-sm md:text-base">Are you also experiencing any body pain, nausea, or coughing?</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center bg-slate-50 rounded-xl p-2 border border-slate-200">
                <div className="text-slate-400 text-sm ml-2">Type your symptoms...</div>
                <div className="ml-auto bg-primary-600 p-2 rounded-lg">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">A seamless journey from describing your symptoms to exploring possible conditions.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: MessageSquare, title: "1. Describe Symptoms", desc: "Chat naturally about what you're feeling." },
              { icon: Search, title: "2. AI Understands", desc: "System extracts key medical symptoms." },
              { icon: Brain, title: "3. Model Predicts", desc: "Machine learning finds matching conditions." },
              { icon: HeartPulse, title: "4. Get Guidance", desc: "Review possibilities and supportive advice." },
            ].map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 text-primary-600 shadow-sm border border-primary-100">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-slate-500">{step.desc}</p>
                
                {idx < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-gradient-to-r from-primary-100 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Capabilities */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Planned Capabilities</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">This prototype is being designed with these core features in mind.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MessageSquare, title: "Conversational Assessment", desc: "Natural language interface for symptom collection without rigid forms." },
              { icon: Search, title: "AI Symptom Extraction", desc: "NLP translates everyday descriptions into standardized medical terms." },
              { icon: Brain, title: "Machine-Learning Prediction", desc: "Algorithms match symptoms against established dataset patterns." },
              { icon: Stethoscope, title: "Prediction Explanation", desc: "Transparent reasoning showing which symptoms led to the prediction." },
              { icon: ShieldAlert, title: "Safety/Red-Flag Awareness", desc: "Built-in detection for severe symptoms that require immediate attention." },
              { icon: HeartPulse, title: "Supportive Health Guidance", desc: "Curated next steps and self-care information based on the prediction." },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <feature.icon className="h-8 w-8 text-primary-500 mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Conversational? */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-900 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-800 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-primary-800 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Why Conversational?</h2>
              <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                Traditional symptom checkers rely on endless checkboxes and complex medical terminology. By using conversational AI, you can describe how you feel in your own words, just as you would to a person.
              </p>
              <Link to="/chat" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-primary-900 font-bold transition-transform hover:scale-105 shadow-lg">
                Try the Chat Interface
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Notice */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-slate-200 rounded-full mb-4 text-slate-600">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Safety & Limitations</h2>
          <p className="text-slate-600">
            This prototype provides informational predictions and does not replace professional medical diagnosis or treatment. The models are trained on limited datasets for academic purposes and have not been clinically validated.
          </p>
        </div>
      </section>
    </div>
  );
}
