import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Truck, Utensils, School, Package, Loader2, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    suppliers: 0,
    bahan: 0,
    sekolah: 0,
    menu: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sRes, bRes, skRes, mRes] = await Promise.all([
          api.get('/suppliers'),
          api.get('/bahan-makanan'),
          api.get('/sekolah'),
          api.get('/menu')
        ]);
        setStats({
          suppliers: sRes.data.length,
          bahan: bRes.data.length,
          sekolah: skRes.data.length,
          menu: mRes.data.length
        });
      } catch (err) {
        console.error('Gagal mengambil statistik dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Suppliers', value: stats.suppliers, icon: <Truck className="text-blue-500" />, path: '/suppliers', color: 'bg-blue-50' },
    { name: 'Bahan Makanan', value: stats.bahan, icon: <Utensils className="text-green-500" />, path: '/bahan-makanan', color: 'bg-green-50' },
    { name: 'Sekolah Terdaftar', value: stats.sekolah, icon: <School className="text-purple-500" />, path: '/sekolah', color: 'bg-purple-50' },
    { name: 'Menu Produksi', value: stats.menu, icon: <Package className="text-orange-500" />, path: '/menu', color: 'bg-orange-50' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link key={stat.name} to={stat.path} className="group">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.color} rounded-xl group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <ArrowUpRight className="text-gray-300 group-hover:text-blue-500" size={18} />
              </div>
              <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Aktivitas Sistem Terbaru</h3>
            <button className="text-sm text-blue-600 font-medium hover:underline">Lihat Semua</button>
          </div>
          <div className="space-y-6">
            {[
              { type: 'supplier', title: 'Supplier Baru Ditambahkan', desc: 'PT. Pangan Jaya telah terverifikasi.', time: '10 Menit lalu' },
              { type: 'menu', title: 'Produksi Menu Selesai', desc: 'Menu "Nasi Ayam" siap didistribusikan.', time: '1 Jam lalu' },
              { type: 'alert', title: 'Laporan Masuk', desc: 'Laporan traceability baru dari Sekolah A.', time: '3 Jam lalu' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 mt-1 border border-gray-100">
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500 mb-1">{activity.desc}</p>
                  <span className="text-xs text-gray-400 font-medium">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg shadow-blue-200">
          <h3 className="text-xl font-bold mb-4">Butuh Bantuan?</h3>
          <p className="text-blue-100 text-sm mb-6 leading-relaxed">
            Gunakan fitur Traceability untuk melacak sumber makanan secara instan jika terdapat laporan masalah kesehatan.
          </p>
          <Link 
            to="/traceability" 
            className="inline-block bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors"
          >
            Mulai Melacak
          </Link>
          <div className="mt-12 pt-8 border-t border-blue-500/30">
            <p className="text-xs text-blue-200">Sistem Traceability MBG v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
