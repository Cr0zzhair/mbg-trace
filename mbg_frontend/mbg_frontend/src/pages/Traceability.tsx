import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { Search, Loader2, ArrowRight, ShieldCheck, Truck, Utensils, ClipboardList } from 'lucide-react';

interface TraceNode {
  type: 'report' | 'menu' | 'bahan' | 'supplier';
  title: string;
  subtitle: string;
  date?: string;
}

const TraceabilityPage: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [searchType, setSearchType] = useState<'report' | 'supplier'>('report');
  const [loading, setLoading] = useState(false);
  const [traceData, setTraceData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;

    setLoading(true);
    setError(null);
    try {
      const endpoint = searchType === 'report' ? `/trace/report/${searchId}` : `/trace/supplier/${searchId}`;
      const response = await api.get(endpoint);
      setTraceData(response.data);
    } catch (err) {
      setError('Data tidak ditemukan atau terjadi kesalahan server.');
      setTraceData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Lacak Rantai Pasok (Traceability)</h3>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as any)}
          >
            <option value="report">ID Laporan Keracunan</option>
            <option value="supplier">ID Supplier</option>
          </select>
          <div className="flex-1 relative">
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Masukkan ${searchType === 'report' ? 'ID Laporan (e.g. 1)' : 'ID Supplier'}`}
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : 'Cari'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 mb-8 text-center">
          {error}
        </div>
      )}

      {traceData && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-100 p-6 rounded-2xl flex items-center">
            <ShieldCheck className="text-green-600 mr-4" size={32} />
            <div>
              <h4 className="font-bold text-green-900">Hasil Penelusuran Berhasil</h4>
              <p className="text-green-700 text-sm">Menampilkan rantai distribusi untuk ID: {searchId}</p>
            </div>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>

            {/* Nodes */}
            <div className="space-y-8 relative z-10">
              {/* This is a simplified view of the logic. 
                  Real trace logic would map the API response. */}
              
              <TraceCard 
                icon={<ClipboardList size={20} />}
                title="Titik Akhir (Laporan)"
                subtitle={`Laporan ID: ${traceData.report?.id || 'N/A'} - ${traceData.report?.gejala || 'Informasi Gejala'}`}
                color="bg-blue-600"
              />

              <div className="flex justify-center my-2 text-gray-300">
                <ArrowRight className="rotate-90" />
              </div>

              <TraceCard 
                icon={<Utensils size={20} />}
                title="Menu Terkait"
                subtitle={traceData.menu?.nama_menu || 'N/A'}
                color="bg-purple-600"
              />

              <div className="flex justify-center my-2 text-gray-300">
                <ArrowRight className="rotate-90" />
              </div>

              <TraceCard 
                icon={<Truck size={20} />}
                title="Sumber (Supplier)"
                subtitle={traceData.supplier?.nama_supplier || 'N/A'}
                color="bg-orange-600"
              />
            </div>
          </div>
        </div>
      )}

      {!traceData && !loading && !error && (
        <div className="text-center py-20 text-gray-400">
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p>Masukkan ID untuk melacak riwayat makanan.</p>
        </div>
      )}
    </div>
  );
};

const TraceCard = ({ icon, title, subtitle, color }: { icon: any, title: string, subtitle: string, color: string }) => (
  <div className="flex items-center group">
    <div className={`w-16 h-16 rounded-full ${color} text-white flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 z-10`}>
      {icon}
    </div>
    <div className="ml-6 flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group-hover:border-blue-200 transition-colors">
      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</h5>
      <p className="text-lg font-bold text-gray-900">{subtitle}</p>
    </div>
  </div>
);

export default TraceabilityPage;
