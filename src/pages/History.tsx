import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, ChevronRight, Clock, Trash2, AlertCircle } from 'lucide-react';
import { getHistory, deleteHistory, getHistoryDetail } from '../services/api';

export default function History() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getHistory();
      setHistoryData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this assessment?")) {
      try {
        await deleteHistory(id);
        fetchHistory();
      } catch (err: any) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      setLoading(true);
      const detail = await getHistoryDetail(id);
      
      const chatState = {
        session_id: detail.session_id,
        messages: detail.messages,
        symptoms: detail.symptoms.reduce((acc: any, curr: any) => {
          acc[curr.name] = curr.status;
          return acc;
        }, {}),
        status: detail.status,
        duration: detail.duration,
        severity: detail.severity,
        safety_flag: detail.safety_flag,
      };

      const result = {
        prediction: detail.prediction.predicted_condition,
        model_score: detail.prediction.model_score,
        top_predictions: detail.prediction.top_predictions,
        symptoms_used: detail.prediction.symptoms_used,
        assessment_id: detail.assessment_id
      };

      navigate('/result', { state: { result, chatState } });
    } catch (err: any) {
      alert("Failed to load details: " + err.message);
      setLoading(false);
    }
  };

  const filteredHistory = historyData.filter(item => 
    (item.prediction && item.prediction.toLowerCase().includes(searchTerm.toLowerCase()))
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
              placeholder="Search conditions..." 
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-10 bg-slate-200 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Symptoms Count</th>
                  <th className="px-6 py-4 font-medium">Possible Condition</th>
                  <th className="px-6 py-4 font-medium">Confidence</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr key={item.assessment_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-slate-600 text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{item.symptoms_count} symptoms</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800 capitalize">
                        {item.prediction ? item.prediction.replace(/_/g, ' ') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.model_score ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary-500" 
                              style={{ width: `${Math.round(item.model_score * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-600 font-medium">{Math.round(item.model_score * 100)}%</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDelete(item.assessment_id)} className="text-red-500 hover:text-red-700 mr-4">
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                      <button onClick={() => handleViewDetails(item.assessment_id)} className="inline-flex items-center text-primary-600 hover:text-primary-800">
                        View
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </button>
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
