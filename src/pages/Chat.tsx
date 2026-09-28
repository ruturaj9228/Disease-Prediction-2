import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Mic, Activity, Info, ChevronRight, AlertTriangle, Edit2, RotateCcw } from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { createInitialState, processUserMessage, ConversationState } from '../services/chat/engine';
import { analyzeSymptoms } from '../services/api/predictService';

const SUGGESTED_SYMPTOMS = ['Fever', 'Headache', 'Cough', 'Body pain', 'Fatigue'];

export default function Chat() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatState, setChatState] = useState<ConversationState>(createInitialState());
  const [isEditing, setIsEditing] = useState(false);
  const [editedSymptoms, setEditedSymptoms] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'UNKNOWN'>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    setInput('');
    setIsTyping(true);
    
    // Process message with our local NLP engine
    setTimeout(() => {
      const newState = processUserMessage(text, chatState);
      setChatState(newState);
      setIsTyping(false);
    }, 600); // Small delay to simulate typing
  };

  const handleAnalyze = async () => {
    setIsTyping(true);
    try {
      // Build boolean symptom vector for the predictor
      const featureDict: Record<string, boolean> = {};
      Object.entries(chatState.symptoms).forEach(([sym, status]) => {
        if (status === 'PRESENT') {
          featureDict[sym] = true;
        } else {
          featureDict[sym] = false;
        }
      });
      
      const result = await analyzeSymptoms(featureDict);
      
      // Navigate to Result page with the output
      navigate('/result', { state: { result, chatState } });
    } catch (err: any) {
      console.error(err);
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          id: Date.now().toString(),
          sender: 'system',
          text: `Prediction Error: ${err.message}`
        }]
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to start a new assessment?")) {
      setChatState(createInitialState());
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setChatState(prev => ({ ...prev, symptoms: editedSymptoms }));
    } else {
      setEditedSymptoms(chatState.symptoms);
    }
    setIsEditing(!isEditing);
  };

  const updateSymptomStatus = (sym: string, status: 'PRESENT' | 'ABSENT' | 'UNKNOWN') => {
    setEditedSymptoms(prev => ({ ...prev, [sym]: status }));
  };

  const presentSymptoms = Object.entries(chatState.symptoms).filter(([_, s]) => s === 'PRESENT');
  const absentSymptoms = Object.entries(chatState.symptoms).filter(([_, s]) => s === 'ABSENT');

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex w-80 flex-col border-r border-slate-200 bg-white">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary-600" />
            Assessment Info
          </h2>
          <button onClick={handleReset} className="text-slate-500 hover:text-slate-800">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            
            {/* Assessment Summary Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Symptoms Identified</h3>
                {Object.keys(chatState.symptoms).length > 0 && (
                  <button onClick={handleEditToggle} className="text-primary-600 hover:text-primary-800 flex items-center gap-1 text-xs font-medium">
                    <Edit2 className="h-3 w-3" /> {isEditing ? 'Save' : 'Edit'}
                  </button>
                )}
              </div>
              
              {Object.keys(chatState.symptoms).length === 0 ? (
                <p className="text-sm text-slate-500 italic">No symptoms identified yet.</p>
              ) : (
                <div className="space-y-4">
                  {/* PRESENT */}
                  {(presentSymptoms.length > 0 || isEditing) && (
                    <div>
                      <p className="text-xs font-medium text-emerald-700 mb-1">Present:</p>
                      <ul className="space-y-1">
                        {Object.entries(isEditing ? editedSymptoms : chatState.symptoms)
                          .filter(([_, s]) => s === 'PRESENT')
                          .map(([sym]) => (
                            <li key={sym} className="text-sm text-slate-700 flex items-center gap-1.5">
                              <span className="text-emerald-500">✓</span> {sym.replace(/_/g, ' ')}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* ABSENT */}
                  {(absentSymptoms.length > 0 || isEditing) && (
                    <div>
                      <p className="text-xs font-medium text-red-700 mb-1">Explicitly Absent:</p>
                      <ul className="space-y-1">
                        {Object.entries(isEditing ? editedSymptoms : chatState.symptoms)
                          .filter(([_, s]) => s === 'ABSENT')
                          .map(([sym]) => (
                            <li key={sym} className="text-sm text-slate-700 flex items-center gap-1.5">
                              <span className="text-red-500">✕</span> {sym.replace(/_/g, ' ')}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Duration and Severity */}
                  {chatState.duration && (
                    <div className="text-sm pt-2 border-t border-slate-200">
                      <span className="font-medium text-slate-600">Duration:</span> {chatState.duration}
                    </div>
                  )}
                  {chatState.severity && (
                    <div className="text-sm">
                      <span className="font-medium text-slate-600">Severity:</span> {chatState.severity}
                    </div>
                  )}
                </div>
              )}
              
              {/* EDIT MODE CONTROLS */}
              {isEditing && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                  <p className="text-xs text-slate-500 mb-2">Change status:</p>
                  {Object.keys(editedSymptoms).map(sym => (
                    <div key={sym} className="flex flex-col text-xs bg-white p-2 rounded border border-slate-200">
                      <span className="font-medium capitalize mb-1">{sym.replace(/_/g, ' ')}</span>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={editedSymptoms[sym] === 'PRESENT'} onChange={() => updateSymptomStatus(sym, 'PRESENT')} /> Yes</label>
                        <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={editedSymptoms[sym] === 'ABSENT'} onChange={() => updateSymptomStatus(sym, 'ABSENT')} /> No</label>
                        <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={editedSymptoms[sym] === 'UNKNOWN'} onChange={() => updateSymptomStatus(sym, 'UNKNOWN')} /> ?</label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2 text-blue-800 font-medium text-sm">
                <Info className="h-4 w-4" />
                Phase 3 Engine Active
              </div>
              <p className="text-xs text-blue-700">
                Natural Language processing and local extraction engine is active.
              </p>
            </div>
            
            <MedicalDisclaimer className="mt-4" />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        {/* Chat Header */}
        <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-slate-800">AI HealthAssist</h1>
            {chatState.assessment_status === 'emergency' ? (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-medium">
                <AlertTriangle className="h-3 w-3" />
                Safety Alert
              </div>
            ) : chatState.assessment_status === 'ready' ? (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium">
                Ready for Analysis
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Collecting Information
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleReset}
              className="lg:hidden text-slate-500 p-2"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            {(chatState.assessment_status === 'ready' || presentSymptoms.length > 0) && (
              <button 
                onClick={handleAnalyze}
                disabled={isTyping}
                className="btn-primary py-1.5 px-4 text-sm shadow-sm"
              >
                Analyze Symptoms
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="lg:hidden mb-4">
             <MedicalDisclaimer />
          </div>
          
          {chatState.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-sm'
                    : msg.sender === 'system'
                      ? 'bg-red-50 border border-red-200 text-red-800 w-full rounded'
                      : chatState.assessment_status === 'emergency' && msg === chatState.messages[chatState.messages.length - 1]
                        ? 'bg-red-50 border-2 border-red-200 text-red-900 rounded-tl-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                }`}
              >
                <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm py-4 px-5 shadow-sm flex space-x-1.5 items-center">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-4 pb-safe">
          <div className="max-w-4xl mx-auto">
            {/* Suggested Chips */}
            {chatState.messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTED_SYMPTOMS.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => handleSend(`I've been experiencing ${symptom.toLowerCase()}`)}
                    className="text-xs sm:text-sm px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200 hover:bg-slate-200 transition-colors"
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex items-center">
              <button className="absolute left-3 p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Mic className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder={chatState.assessment_status === 'emergency' ? "Assessment halted due to safety flags..." : "Type your symptoms here..."}
                disabled={chatState.assessment_status === 'emergency'}
                className="w-full pl-12 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || chatState.assessment_status === 'emergency'}
                className="absolute right-2 p-2.5 bg-primary-600 text-white rounded-lg disabled:opacity-50 disabled:bg-slate-300 transition-colors hover:bg-primary-700"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
