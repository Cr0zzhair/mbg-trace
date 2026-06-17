import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { Search, Loader2, ArrowRight, ShieldCheck, Truck, Utensils, ClipboardList } from 'lucide-react';

const TraceabilityPage: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [searchType, setSearchType] = useState<'report' | 'supplier'>('report');
  const [loading, setLoading] = useState(false);
  const [traceData, setTraceData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;
    setLoading(true); setError(null);
    try {
      const endpoint = searchType === 'report' ? `/trace/report/${searchId}` : `/trace/supplier/${searchId}`;
      const res = await api.get(endpoint);
      setTraceData(res.data);
    } catch { setError('Data tidak ditemukan atau server error.'); setTraceData(null); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl">
      <div className="bg-white p-8 rounded-xl shadow-sm border mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Pelacakan Rantai Pasok (Traceability)</h3>
        <p className="text-gray-500 text-sm mb-6">Masukkan ID laporan atau ID supplier untuk melacak sumber bahan makanan.</p>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <select className="px-4 py-3 border border-gray-300 rounded-lg outline-none" value={searchType} onChange={(e) => setSearchType(e.target.value as any)}>
            <option value="report">ID Laporan Keracunan</option>
            <option value="supplier">ID Supplier</option>
          </select>
          <div className="flex-1 relative">
            <input type="text" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder={searchType === 'report' ? 'Masukkan ID Laporan' : 'Masukkan ID Supplier'} value={searchId} onChange={(e) => setSearchId(e.target.value)} />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
          </div>
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Lacak'}
          </button>
        </form>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 mb-8 text-center">{error}</div>}

      {traceData && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-100 p-6 rounded-xl flex items-center">
            <ShieldCheck className="text-green-600 mr-4" size={32} />
            <div><h4 className="font-bold text-green-900">Hasil Penelusuran Berhasil</h4><p className="text-green-700 text-sm">ID: {searchId}</p></div>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto">{JSON.stringify(traceData, null, 2)}</pre>
          </div>
        </div>
      )}

      {!traceData && !loading && !error && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400 flex flex-col items-center">
          <Search className="w-12 h-12 mb-3 text-gray-300" /><p>Hasil pelacakan akan muncul di sini.</p>
        </div>
      )}
    </div>
  );
};
export default TraceabilityPage;
