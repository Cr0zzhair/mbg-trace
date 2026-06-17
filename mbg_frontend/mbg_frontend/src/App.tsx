import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Calendar,
  Building2,
  Paperclip,
  ArrowUp,
  Edit3,
  RefreshCw,
  FileText,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
  Utensils,
  LogIn,
  LayoutDashboard,
  Truck,
  ClipboardList,
  Box,
  Search,
  ArrowUpRight,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import Suppliers from './pages/Suppliers';
import BahanMakananPage from './pages/BahanMakanan';
import MenuPage from './pages/Menus';
import SekolahPage from './pages/SekolahPage';
import SppgPage from './pages/SppgPage';
import TraceabilityPage from './pages/Traceability';
import Dashboard from './pages/Dashboard';
import api from './api/axiosConfig';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [activeTab, setActiveTab] = useState<string>('pengaduan');
  const [activeSidebar, setActiveSidebar] = useState<string>('dashboard');
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [customLokasi, setCustomLokasi] = useState("");
  const [dashboardStats, setDashboardStats] = useState({ suppliers: 0, bahan: 0, sekolah: 0, menu: 0 });
  // State untuk menyimpan daftar akun (Simulasi Database)
  const [registeredUsers, setRegisteredUsers] = useState([]);
  
  // State untuk menyimpan siapa yang sedang login
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [selectedLaporan, setSelectedLaporan] = useState<any>(null);

  const [laporanList, setLaporanList] = useState([
    { id: 'LAP-001', tanggal: '15 Jun 2026', judul: 'Nasi keras dan dingin di SD 01', kategori: 'Kualitas Makanan', status: 'Menunggu', pelapor: 'Orang Tua Siswa', deskripsi: 'Nasi yang dibagikan kepada siswa hari ini sangat keras dan sudah dingin, mohon dicek ke supplier.' },
    { id: 'LAP-002', tanggal: '14 Jun 2026', judul: 'Susu cair kemasan bocor', kategori: 'Distribusi', status: 'Diproses', pelapor: 'Guru SMP 12', deskripsi: 'Ada 5 kotak susu yang bocor saat kardus dibuka, membilas makanan lainnya.' },
    { id: 'LAP-003', tanggal: '10 Jun 2026', judul: 'Lauk pauk tidak sesuai menu', kategori: 'Kualitas Makanan', status: 'Selesai', pelapor: 'Siswa SMA 3', deskripsi: 'Di jadwal tertulis ayam teriyaki, tapi yang datang telor dadar biasa.' },
  ]);

  const [formJudul, setFormJudul] = useState('');
  const [formIsi, setFormIsi] = useState('');
  const [formTanggal, setFormTanggal] = useState('');
  const [formKategori, setFormKategori] = useState('');

  // State untuk input form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Cek apakah email sudah pernah didaftarkan
    const isEmailTaken = registeredUsers.some((user: any) => user.email === email);
    if (isEmailTaken) {
      alert("Email sudah terdaftar! Gunakan email lain.");
      return;
    }

    // Simpan user baru ke dalam state array
    setRegisteredUsers([...registeredUsers, { email, password }] as any);
    alert("Pendaftaran berhasil! Silakan masuk dengan akun Anda.");
    
    // Kosongkan form dan arahkan ke halaman login
    setEmail('');
    setPassword('');
    setCurrentView('login');
  };

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validUser = registeredUsers.find(
      (user: any) => user.email === email && user.password === password
    );

    if (validUser) {
      setLoggedInUser(validUser);
      setCurrentView('dashboard');
      setActiveSidebar('dashboard');
      setEmail('');
      setPassword('');
    } else {
      alert("Email atau password salah. Silakan coba lagi atau daftar jika belum memiliki akun.");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (currentView === 'dashboard') {
      Promise.all([
        api.get('/suppliers'),
        api.get('/bahan-makanan'),
        api.get('/sekolah'),
        api.get('/menu')
      ]).then(([sRes, bRes, skRes, mRes]) => {
        setDashboardStats({
          suppliers: sRes.data.length,
          bahan: bRes.data.length,
          sekolah: skRes.data.length,
          menu: mRes.data.length
        });
      }).catch(() => {});
    }
  }, [currentView, activeSidebar]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Konfigurasi Menu Sidebar
  const sidebarMenus = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'bahan', label: 'Bahan Makanan', icon: Utensils },
    { id: 'menu', label: 'Menu', icon: ClipboardList },
    { id: 'sekolah', label: 'Sekolah', icon: Building2 },
    { id: 'distribusi', label: 'Distribusi (SPPG)', icon: Box },
    { id: 'traceability', label: 'Traceability', icon: Search },
    { id: 'track_laporan', label: 'Laporan & Pengaduan', icon: MessageSquare },
  ];

  const handleKirimLaporan = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formJudul || !formIsi || !formTanggal || !customLokasi || !formKategori) {
      alert("Mohon lengkapi semua data laporan yang berbintang (*)");
      return;
    }

    // Generate ID unik otomatis (Contoh: LAP-9411)
    const nextId = `LAP-${laporanList.length + 101}`;

    // Format tanggal agar rapi (Contoh dari 2026-06-17 menjadi 17 Jun 2026)
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const tanggalFormatted = new Date(formTanggal).toLocaleDateString('id-ID', options);

    // Buat objek laporan baru
    const laporanBaru = {
      id: nextId,
      tanggal: tanggalFormatted,
      judul: formJudul,
      kategori: formKategori === 'makanan' ? 'Kualitas Makanan' : formKategori,
      status: 'Menunggu',
      pelapor: `Anonim (${customLokasi})`, // Menyimpan info sekolah dari input manual
      deskripsi: formIsi
    };

    // Masukkan ke dalam daftar list laporan di dashboard
    setLaporanList([laporanBaru, ...laporanList]);

    alert(`Laporan Anda Berhasil Dikirim dengan ID: ${nextId}! Anda bisa mengecek statusnya melalui Dashboard.`);

    // Reset Form setelah berhasil dikirim
    setFormJudul('');
    setFormIsi('');
    setFormTanggal('');
    setCustomLokasi('');
    setFormKategori('');
  };

  // Render Konten Dashboard Berdasarkan Menu Aktif
  const renderDashboardContent = () => {
    switch (activeSidebar) {
      case 'suppliers':
        return <Suppliers />;

      case 'bahan':
        return <BahanMakananPage />;

      case 'menu':
        return <MenuPage />;

      case 'sekolah':
        return <SekolahPage />;

      case 'distribusi':
        return <SppgPage />;

      case 'traceability':
        return <TraceabilityPage />;
      
      case 'track_laporan':
        // Jika ada laporan yang dipilih, tampilkan halaman Detail
        if (selectedLaporan) {
          return (
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <button 
                  onClick={() => setSelectedLaporan(null)}
                  className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold text-gray-800">Detail Laporan: {selectedLaporan.id}</h3>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl">
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedLaporan.judul}</h4>
                    <p className="text-sm text-gray-500 flex items-center space-x-4">
                      <span><Calendar className="w-4 h-4 inline mr-1" /> {selectedLaporan.tanggal}</span>
                      <span><MessageCircle className="w-4 h-4 inline mr-1" /> {selectedLaporan.kategori}</span>
                    </p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                    selectedLaporan.status === 'Selesai' ? 'bg-green-100 text-green-700' : 
                    selectedLaporan.status === 'Diproses' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedLaporan.status}
                  </span>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h5 className="text-sm font-bold text-gray-700 mb-2">Informasi Pelapor</h5>
                    <p className="text-gray-600 text-sm">{selectedLaporan.pelapor}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-700 mb-2">Deskripsi Laporan</h5>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 text-sm leading-relaxed">
                      {selectedLaporan.deskripsi}
                    </div>
                  </div>
                  
                  {/* Status Tracking Timeline Simulator */}
                  <div className="pt-6 mt-6 border-t border-gray-100">
                    <h5 className="text-sm font-bold text-gray-700 mb-4">Tracking Tindak Lanjut</h5>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                <CheckCircle2 className="w-5 h-5"/>
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-gray-100 shadow-sm bg-white">
                                <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className="font-bold text-gray-900 text-sm">Laporan Diterima</div>
                                </div>
                                <div className="text-gray-500 text-xs">Sistem mencatat laporan masuk.</div>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Jika tidak ada laporan yang dipilih, tampilkan halaman Tabel List Laporan
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Daftar Pengaduan & Laporan</h3>
              <div className="relative">
                <input type="text" placeholder="Cari laporan..." className="border border-gray-300 rounded-lg py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                    <th className="p-4 font-semibold">ID Laporan</th>
                    <th className="p-4 font-semibold">Tanggal</th>
                    <th className="p-4 font-semibold">Judul</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {laporanList.map((laporan) => (
                    <tr key={laporan.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4 font-bold text-blue-600">{laporan.id}</td>
                      <td className="p-4 text-gray-600">{laporan.tanggal}</td>
                      <td className="p-4 font-medium text-gray-800">{laporan.judul}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          laporan.status === 'Selesai' ? 'bg-green-100 text-green-700' : 
                          laporan.status === 'Diproses' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {laporan.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => setSelectedLaporan(laporan)}
                          className="bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'dashboard':
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative group hover:shadow-md transition cursor-pointer" onClick={() => setActiveSidebar('suppliers')}>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-blue-500"><Truck className="w-6 h-6" /></div>
                <ArrowUpRight className="w-5 h-5 text-gray-300 absolute top-6 right-6 group-hover:text-blue-500 transition" />
                <p className="text-sm font-medium text-gray-500 mb-1">Total Suppliers</p>
                <h3 className="text-3xl font-bold text-gray-900">{dashboardStats.suppliers}</h3>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative group hover:shadow-md transition cursor-pointer" onClick={() => setActiveSidebar('bahan')}>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 text-green-500"><Utensils className="w-6 h-6" /></div>
                <ArrowUpRight className="w-5 h-5 text-gray-300 absolute top-6 right-6 group-hover:text-green-500 transition" />
                <p className="text-sm font-medium text-gray-500 mb-1">Bahan Makanan</p>
                <h3 className="text-3xl font-bold text-gray-900">{dashboardStats.bahan}</h3>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative group hover:shadow-md transition cursor-pointer" onClick={() => setActiveSidebar('sekolah')}>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 text-purple-500"><Building2 className="w-6 h-6" /></div>
                <ArrowUpRight className="w-5 h-5 text-gray-300 absolute top-6 right-6 group-hover:text-purple-500 transition" />
                <p className="text-sm font-medium text-gray-500 mb-1">Sekolah Terdaftar</p>
                <h3 className="text-3xl font-bold text-gray-900">{dashboardStats.sekolah}</h3>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative group hover:shadow-md transition cursor-pointer" onClick={() => setActiveSidebar('menu')}>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4 text-orange-500"><Box className="w-6 h-6" /></div>
                <ArrowUpRight className="w-5 h-5 text-gray-300 absolute top-6 right-6 group-hover:text-orange-500 transition" />
                <p className="text-sm font-medium text-gray-500 mb-1">Menu Produksi</p>
                <h3 className="text-3xl font-bold text-gray-900">{dashboardStats.menu}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Laporan & Pengaduan Terbaru</h3>
                  <button onClick={() => setActiveSidebar('track_laporan')} className="text-sm text-blue-600 font-medium hover:underline">Lihat Semua</button>
                </div>
                <div className="space-y-6">
                  {laporanList.slice(0, 3).map((laporan) => (
                    <div key={laporan.id} className="flex items-start group cursor-pointer" onClick={() => { setSelectedLaporan(laporan); setActiveSidebar('track_laporan'); }}>
                      <div className="mt-1 mr-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          laporan.status === 'Selesai' ? 'bg-green-50 text-green-500' : 
                          laporan.status === 'Diproses' ? 'bg-yellow-50 text-yellow-500' : 'bg-red-50 text-red-500'
                        }`}>
                          {laporan.status === 'Selesai' ? <CheckCircle2 className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                        </div>
                      </div>
                      <div className="flex-1 border-b border-gray-50 pb-4 group-hover:border-blue-100 transition">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-gray-900">{laporan.judul}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            laporan.status === 'Selesai' ? 'bg-green-100 text-green-700' : 
                            laporan.status === 'Diproses' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>{laporan.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{laporan.deskripsi}</p>
                        <span className="text-[10px] text-gray-400 mt-2 block">{laporan.tanggal} • {laporan.id}</span>
                      </div>
                    </div>
                  ))}
                  {laporanList.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">Belum ada laporan masuk.</p>
                  )}
                </div>
              </div>
              <div className="bg-blue-600 rounded-xl shadow-md p-8 text-white flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-4">Butuh Bantuan?</h3>
                  <p className="text-blue-100 text-sm leading-relaxed mb-6">Gunakan fitur Traceability untuk melacak sumber makanan secara instan jika terdapat laporan masalah kesehatan.</p>
                  <button onClick={() => setActiveSidebar('traceability')} className="bg-white text-blue-600 font-bold py-2.5 px-6 rounded-lg hover:bg-blue-50 transition shadow-sm">Mulai Melacak</button>
                </div>
                <div className="mt-12 pt-6 border-t border-blue-500/50">
                  <p className="text-xs text-blue-200">Sistem Traceability MBG v1.0.0</p>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  if (currentView === 'register') {
    return (
      <div className="min-h-screen bg-sky-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Daftar Akun Baru</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded p-2 mt-1 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" required minLength="6"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded p-2 mt-1 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
              Daftar Sekarang
            </button>
          </form>
          <p className="mt-4 text-sm text-center text-gray-600">
            Sudah punya akun? <span onClick={() => setCurrentView('login')} className="text-blue-600 cursor-pointer hover:underline">Masuk</span>
          </p>
        </div>
      </div>
    );
  }

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-sky-50 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
        <button 
          onClick={() => setCurrentView('landing')}
          className="absolute top-6 left-6 flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold z-20 bg-white/50 px-4 py-2 rounded-lg backdrop-blur-sm transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md relative z-10">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight text-center">Masuk ke Akun Anda</h1>
            <p className="text-sm text-gray-500 mt-2 text-center">Layanan Pengaduan Makan Bergizi Gratis</p>
          </div>


          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email / Username</label>
              <input 
                type="email" required placeholder="Masukkan email anda" 
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 focus:bg-white text-gray-700" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kata Sandi</label>
              <input 
                type="password" required placeholder="Masukkan kata sandi" 
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 focus:bg-white text-gray-700" 
              />
            </div>
            
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-600">Ingat Saya</span>
              </label>
              <a href="#" className="text-sm text-blue-600 font-semibold hover:underline">Lupa Sandi?</a>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition duration-200 mt-6 flex justify-center items-center space-x-2 shadow-lg shadow-blue-200">
              <LogIn className="w-5 h-5" />
              <span>Masuk Sistem</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-50 flex font-sans">
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
          <div className="p-6 pb-8 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-blue-600 tracking-tight">MBG Trace</h1>
            <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Dashboard Sistem</p>
          </div>
          
          <nav className="flex-1 py-6">
            <ul className="space-y-1">
              {sidebarMenus.map((menu) => (
                <li key={menu.id}>
                  <button 
                    onClick={() => setActiveSidebar(menu.id)}
                    className={`w-full flex items-center space-x-3 px-6 py-3 font-medium transition ${
                      activeSidebar === menu.id 
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                    }`}
                  >
                    <menu.icon className="w-5 h-5" />
                    <span>{menu.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-6 border-t border-gray-100">
            <button onClick={() => { setCurrentView('landing'); setActiveSidebar('dashboard'); }} className="flex items-center space-x-2 text-gray-500 hover:text-red-600 font-medium transition w-full">
              <LogOut className="w-5 h-5" /><span>Keluar</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <header className="mb-8 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {sidebarMenus.find(m => m.id === activeSidebar)?.label || 'Dashboard'}
              </h2>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">AD</div>
              </div>
            </header>

            {/* Area Render Konten Dinamis Berdasarkan Menu Sidebar Aktif */}
            {renderDashboardContent()}

          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 font-sans text-gray-800">
      <div className="relative bg-gradient-to-br from-blue-800 via-blue-600 to-sky-500 pb-40 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-15 pointer-events-none">
          <Utensils className="w-[400px] h-[400px] md:w-[700px] md:h-[700px] text-white -rotate-12" strokeWidth={0.5} />
        </div>
        
        <nav className="relative z-10 container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center border-b border-white/20">
          <div className="flex items-center space-x-8 mb-4 md:mb-0">
            <div className="flex items-center space-x-2 text-white font-bold text-2xl tracking-tighter">
              <MessageSquare className="w-8 h-8" />
              <span>MBG<span className="font-light">LAPOR!</span></span>
            </div>
            <div className="hidden md:flex space-x-6 text-white/90 text-sm font-medium">
              <a href="#" className="hover:text-white transition">Tentang MBG Lapor</a>
              <a href="#" className="hover:text-white transition">FAQ</a>
            </div>
          </div>

          <div className="flex space-x-3">
            <button onClick={() => setCurrentView('login')} className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded transition shadow-md">Masuk</button>
            <button onClick={() => setCurrentView('register')} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition shadow-md">Daftar</button>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-6 pt-16 pb-12 text-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Layanan Pengaduan Program Makan Gizi Gratis (MBG)</h1>
          <p className="text-lg md:text-xl font-medium text-white/90">Sampaikan laporan Anda terkait Program Makan Bergizi Gratis (MBG) langsung kepada instansi berwenang.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-20 mb-16">
        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-10 max-w-5xl mx-auto border border-blue-50">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">Sampaikan Laporan Anda</h2>

          <form className="space-y-5" onSubmit={handleKirimLaporan}>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Judul Laporan <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={formJudul}
                onChange={(e) => setFormJudul(e.target.value)}
                placeholder="Ketik Judul Laporan Anda" 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Isi Laporan <span className="text-red-500">*</span></label>
              <textarea 
                rows={5} 
                value={formIsi}
                onChange={(e) => setFormIsi(e.target.value)}
                placeholder="Ketik Isi Laporan Anda" 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Tanggal Kejadian <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type="date" 
                  value={formTanggal}
                  onChange={(e) => setFormTanggal(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-600" 
                  required
                />
                <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Lokasi Kejadian <span className="text-red-500">*</span></label>
                <div className="mt-1">
                  <input 
                    type="text"
                    value={customLokasi}
                    onChange={(e) => setCustomLokasi(e.target.value)}
                    placeholder="Ketik nama sekolah disini"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-600 bg-white"
                    required 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Kategori Laporan <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select 
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-600 bg-white"
                    required
                  >
                    <option value="" disabled>Pilih Kategori</option>
                    <option value="makanan">Kualitas Makanan</option> 
                    <option value="Distribusi">Distribusi</option> 
                  </select>
                  <ChevronDown className="w-5 h-5 text-gray-500 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col md:flex-row items-start md:items-center justify-between">
              <button type="button" className="flex items-center space-x-2 border border-blue-500 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition mb-4 md:mb-0">
                <Paperclip className="w-4 h-4" />
                <span className="text-sm font-semibold">Upload Lampiran</span>
              </button>
            </div>

            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg text-lg uppercase tracking-wider transition duration-200 shadow-md shadow-blue-200 mt-4">
              Kirim Laporan
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 mb-8 border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute top-8 left-0 w-full h-0.5 bg-gray-300 hidden md:block z-0"></div>
            <div className="absolute top-8 left-0 w-1/4 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 hidden md:block z-0"></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-200"><Edit3 className="w-7 h-7" /></div>
                <h3 className="font-bold text-gray-900 mb-2">Tulis Laporan</h3>
                <p className="text-sm text-gray-500">Laporkan keluhan atau aspirasi anda dengan jelas dan lengkap</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-300 text-white flex items-center justify-center mb-4"><RefreshCw className="w-7 h-7" /></div>
                <h3 className="font-bold text-gray-900 mb-2">Proses Verifikasi</h3>
                <p className="text-sm text-gray-500">Dalam 3 hari, laporan diverifikasi dan diteruskan</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-300 text-white flex items-center justify-center mb-4"><FileText className="w-7 h-7" /></div>
                <h3 className="font-bold text-gray-900 mb-2">Tindak Lanjut</h3>
                <p className="text-sm text-gray-500">Instansi menindaklanjuti laporan Anda</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-300 text-white flex items-center justify-center mb-4"><MessageCircle className="w-7 h-7" /></div>
                <h3 className="font-bold text-gray-900 mb-2">Beri Tanggapan</h3>
                <p className="text-sm text-gray-500">Anda dapat menanggapi kembali balasan instansi</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-300 text-white flex items-center justify-center mb-4"><CheckCircle2 className="w-7 h-7" /></div>
                <h3 className="font-bold text-gray-900 mb-2">Selesai</h3>
                <p className="text-sm text-gray-500">Laporan Anda terselesaikan</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-700 py-16 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10">
          <h3 className="text-lg font-bold tracking-widest mb-4 text-blue-100">JUMLAH LAPORAN SEKARANG</h3>
          <p className="text-6xl md:text-8xl font-bold tracking-tight">{9407 + laporanList.length}</p>
        </div>
      </div>

      <footer className="bg-white py-12 text-center">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-gray-700 mb-8 mt-4">
            <a href="#" className="hover:text-blue-600 transition">BERANDA</a>
            <a href="#" className="hover:text-blue-600 transition">TENTANG KAMI</a>
            <a href="#" className="hover:text-blue-600 transition">HUBUNGI KAMI</a>
          </div>
          <p className="text-sm text-gray-500 mb-6">Copyright MBG Trace 2026. Hak cipta dilindungi Undang-Undang.</p>
        </div>
      </footer>

      {showScrollTop && (
        <button onClick={scrollToTop} className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all z-50 animate-bounce">
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}