import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Mic, Activity, Info, ChevronRight } from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

type Message = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isFollowUp?: boolean;
};

const SUGGESTED_SYMPTOMS = ['Fever', 'Headache', 'Cough', 'Body pain', 'Fatigue'];

export default function Chat() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "Tell me what you're experiencing.",
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    // Mock assistant response sequence
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: "I understand. I'll ask a few questions to better understand what you're experiencing."
        }
      ]);
      
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 2).toString(),
              sender: 'assistant',
              text: "Do you also have body pain, cough, nausea, or vomiting?",
              isFollowUp: true
            }
          ]);
        }, 1500);
      }, 1000);
      
    }, 1500);
  };

  const handleAnalyze = () => {
    navigate('/result');
  };

  const hasFollowUp = messages.some(m => m.isFollowUp);

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex w-80 flex-col border-r border-slate-200 bg-white">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary-600" />
            Assessment Info
          </h2>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Guidelines</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 bg-primary-100 text-primary-700 rounded-full p-0.5"><ChevronRight className="h-3 w-3" /></div>
                  Describe symptoms naturally
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 bg-primary-100 text-primary-700 rounded-full p-0.5"><ChevronRight className="h-3 w-3" /></div>
                  Mention duration if possible
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 bg-primary-100 text-primary-700 rounded-full p-0.5"><ChevronRight className="h-3 w-3" /></div>
                  Include severity (mild, severe)
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2 text-blue-800 font-medium text-sm">
                <Info className="h-4 w-4" />
                Phase 1 Demo
              </div>
              <p className="text-xs text-blue-700">
                This is a UI prototype. Natural Language Processing and Machine Learning prediction APIs will be integrated in later phases.
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
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Ready to assess symptoms
            </div>
          </div>
          {hasFollowUp && (
            <button 
              onClick={handleAnalyze}
              className="btn-primary py-1.5 px-4 text-sm shadow-sm"
            >
              Analyze Symptoms
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="lg:hidden mb-4">
             <MedicalDisclaimer />
          </div>
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-sm'
                    : msg.isFollowUp 
                      ? 'bg-amber-50 border border-amber-200 text-slate-800 rounded-tl-sm'
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
            {messages.length === 1 && (
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
                placeholder="Type your symptoms here..."
                className="w-full pl-12 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
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
