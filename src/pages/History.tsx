import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, ChevronRight, Clock } from 'lucide-react';

const DEMO_HISTORY = [
  {
    id: '1',
    date: '2023-10-24T10:30:00Z',
    symptoms: ['Fever', 'Headache', 'Body pain'],
    condition: 'Viral Infection',
    confidence: 78,
    status: 'Completed',
  },
  {
    id: '2',
    date: '2023-09-15T14:20:00Z',
    symptoms: ['Sore throat', 'Cough', 'Runny nose'],
    condition: 'Common Cold',
    confidence: 85,
    status: 'Completed',
  },
  {
    id: '3',
    date: '2023-08-02T09:15:00Z',
    symptoms: ['Stomach ache', 'Nausea'],
    condition: 'Gastroenteritis',
    confidence: 62,
    status: 'Reviewed',
  }
];

export default function History() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = DEMO_HISTORY.filter(item => 
    item.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assessment History</h1>
          <p className="text-slate-600 mt-1">Review your past symptom assessments and predictions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search symptoms or conditions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-64"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-lg mb-6 text-sm">
        <span className="font-semibold">Note:</span> This is a demonstration view. Actual history will be populated from the database in a later phase.
      </div>

      {filteredHistory.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Symptoms Reported</th>
                  <th className="px-6 py-4 font-medium">Possible Condition</th>
                  <th className="px-6 py-4 font-medium">Confidence</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-slate-600 text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.symptoms.slice(0, 2).map((sym, idx) => (
                          <span key={idx} className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200">
                            {sym}
                          </span>
                        ))}
                        {item.symptoms.length > 2 && (
                          <span className="inline-block px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-xs border border-slate-200">
                            +{item.symptoms.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800">{item.condition}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500" 
                            style={{ width: `${item.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-600 font-medium">{item.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to="/result" className="inline-flex items-center text-primary-600 hover:text-primary-800">
                        View Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 text-slate-400">
            <Clock className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No assessments found</h3>
          <p className="text-slate-500 mb-6">You haven't completed any symptom assessments that match your search.</p>
          <Link to="/chat" className="btn-primary">
            Start New Assessment
          </Link>
        </div>
      )}
    </div>
  );
}
