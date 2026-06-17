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
  LogOut,
  Info,
  ShieldCheck,
  HeartPulse
} from 'lucide-react';
import Suppliers from './pages/Suppliers';
import BahanMakananPage from './pages/BahanMakanan';
import MenuPage from './pages/Menus';
import Sekolah from './pages/Sekolah';
import Distribusi from './pages/Distribusi';
import TraceabilityPage from './pages/Traceability';
import api from './api/axiosConfig';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [activeSidebar, setActiveSidebar] = useState<string>('dashboard');
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [selectedLaporan, setSelectedLaporan] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState({ suppliers: 0, bahan: 0, sekolah: 0, menu: 0 });

  const [laporanList, setLaporanList] = useState<any[]>([]);
  const [sekolahList, setSekolahList] = useState<any[]>([]);
  const [sppgList, setSppgList] = useState<any[]>([]);

  const [formJudul, setFormJudul] = useState('');
  const [formIsi, setFormIsi] = useState('');
  const [formTanggal, setFormTanggal] = useState('');
  const [formJumlahKorban, setFormJumlahKorban] = useState('');
  const [formIdSekolah, setFormIdSekolah] = useState('');
  const [formIdSppg, setFormIdSppg] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isSchool = loggedInUser?.email?.endsWith('.id');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const isEmailTaken = registeredUsers.some((user: any) => user.email === email);
    if (isEmailTaken) {
      alert("Email sudah terdaftar!");
      return;
    }
    setRegisteredUsers([...registeredUsers, { email, password }]);
    alert("Pendaftaran berhasil! Silakan masuk.");
    setEmail('');
    setPassword('');
    setCurrentView('login');
  };

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (registeredUsers.length === 0 && email === "admin@sekolah.id" && password === "password") {
        setLoggedInUser({ email: "admin@sekolah.id" });
        setCurrentView('dashboard');
        setActiveSidebar('dashboard');
        return;
    }
    if (registeredUsers.length === 0 && email === "admin@pangan.com" && password === "password") {
        setLoggedInUser({ email: "admin@pangan.com" });
        setCurrentView('dashboard');
        setActiveSidebar('dashboard');
        return;
    }
    const validUser = registeredUsers.find((user: any) => user.email === email && user.password === password);
    if (validUser) {
      setLoggedInUser(validUser);
      setCurrentView('dashboard');
      setActiveSidebar('dashboard');
      setEmail('');
      setPassword('');
    } else {
      alert("Email atau password salah.");
    }
  };

  const handleKirimLaporan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/laporan-keracunan', {
        id_laporan: formJudul,
        tanggal_laporan: formTanggal,
        jumlah_korban: parseInt(formJumlahKorban) || 0,
        deskripsi: formIsi,
        id_sekolah: parseInt(formIdSekolah),
        id_sppg: parseInt(formIdSppg),
      });
      alert('Laporan berhasil dikirim ke database!');
      setFormJudul(''); setFormIsi(''); setFormTanggal('');
      setFormJumlahKorban(''); setFormIdSekolah(''); setFormIdSppg('');
      setActiveSidebar('track_laporan');
      api.get('/laporan-keracunan').then(res => setLaporanList(res.data)).catch(() => {});
    } catch {
      alert('Gagal mengirim laporan. Pastikan backend berjalan.');
    }
  };

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (currentView === 'dashboard') {
      Promise.all([api.get('/suppliers'), api.get('/bahan-makanan'), api.get('/sekolah'), api.get('/menu')])
        .then(([sRes, bRes, skRes, mRes]) => {
          setDashboardStats({ suppliers: sRes.data.length, bahan: bRes.data.length, sekolah: skRes.data.length, menu: mRes.data.length });
          setSekolahList(skRes.data);
        }).catch(() => {});
      api.get('/sppg').then(res => setSppgList(res.data)).catch(() => {});
      api.get('/laporan-keracunan').then(res => setLaporanList(res.data)).catch(() => {});
    }
  }, [currentView, activeSidebar]);

  const sidebarMenus = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'buat_laporan', label: 'Buat Laporan', icon: Edit3, role: 'school' },
    { id: 'track_laporan', label: 'Riwayat Laporan', icon: MessageSquare },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, role: 'admin' },
    { id: 'bahan', label: 'Bahan Makanan', icon: Utensils, role: 'admin' },
    { id: 'menu', label: 'Menu', icon: ClipboardList, role: 'admin' },
    { id: 'sekolah', label: 'Sekolah', icon: Building2, role: 'admin' },
    { id: 'distribusi', label: 'Distribusi (SPPG)', icon: Box, role: 'admin' },
    { id: 'traceability', label: 'Traceability', icon: Search, role: 'admin' },
  ];

  const filteredMenus = sidebarMenus.filter(m => {
    if (!m.role) return true;
    return isSchool ? m.role === 'school' : m.role === 'admin';
  });

  const renderDashboardContent = () => {
    switch (activeSidebar) {
      case 'buat_laporan':
        return (
          <div className="max-w-4xl">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Buat Laporan Keracunan / Kendala</h3>
                <p className="text-gray-500 text-sm">Formulir pelaporan resmi. Data disimpan ke MongoDB.</p>
              </div>
              <form className="space-y-6" onSubmit={handleKirimLaporan}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">ID / Judul Laporan <span className="text-red-500">*</span></label>
                    <input type="text" value={formJudul} onChange={(e) => setFormJudul(e.target.value)} placeholder="Contoh: LAP-006" className="w-full border border-gray-300 rounded-lg p-3 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Tanggal Kejadian <span className="text-red-500">*</span></label>
                    <input type="date" value={formTanggal} onChange={(e) => setFormTanggal(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 outline-none" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Jumlah Korban <span className="text-red-500">*</span></label>
                    <input type="number" min="0" value={formJumlahKorban} onChange={(e) => setFormJumlahKorban(e.target.value)} placeholder="0" className="w-full border border-gray-300 rounded-lg p-3 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Sekolah <span className="text-red-500">*</span></label>
                    <select value={formIdSekolah} onChange={(e) => setFormIdSekolah(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 outline-none bg-white" required>
                      <option value="" disabled>Pilih Sekolah</option>
                      {sekolahList.map((s: any) => <option key={s.id_sekolah} value={s.id_sekolah}>{s.nama_sekolah}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">SPPG Terkait <span className="text-red-500">*</span></label>
                    <select value={formIdSppg} onChange={(e) => setFormIdSppg(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 outline-none bg-white" required>
                      <option value="" disabled>Pilih Distribusi</option>
                      {sppgList.map((sp: any) => <option key={sp.id_sppg} value={sp.id_sppg}>{sp.menu?.nama_menu || 'Menu'} → {sp.sekolah?.nama_sekolah || 'Sekolah'}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Deskripsi Kejadian <span className="text-red-500">*</span></label>
                  <textarea rows={5} value={formIsi} onChange={(e) => setFormIsi(e.target.value)} placeholder="Jelaskan detail kejadian..." className="w-full border border-gray-300 rounded-lg p-3 outline-none resize-none" required></textarea>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button type="submit" className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">Kirim Laporan Resmi</button>
                </div>
              </form>
            </div>
          </div>
        );
      case 'suppliers':
        return <Suppliers />;
      case 'bahan':
        return <BahanMakananPage />;
      case 'menu':
        return <MenuPage onReport={() => setActiveSidebar('buat_laporan')} />;
      case 'sekolah':
        return <Sekolah />;
      case 'distribusi':
        return <Distribusi />;
      case 'traceability':
        return <TraceabilityPage />;
      case 'track_laporan':
        if (selectedLaporan) {
          return (
            <div><button onClick={() => setSelectedLaporan(null)} className="mb-6 flex items-center text-blue-600 hover:underline"><ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar</button>
              <div className="bg-white rounded-xl border border-gray-100 p-8 max-w-3xl">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedLaporan.id_laporan || selectedLaporan._id}</h4>
                <p className="text-sm text-gray-500 mb-6">{selectedLaporan.tanggal_laporan} • Korban: {selectedLaporan.jumlah_korban} orang</p>
                <div className="bg-gray-50 p-6 rounded-lg text-gray-700 leading-relaxed mb-4">{selectedLaporan.deskripsi}</div>
                {selectedLaporan.detail_investigasi && <div className="bg-gray-50 p-4 rounded-lg text-gray-700 mb-4"><strong className="text-sm">Investigasi:</strong> {selectedLaporan.detail_investigasi}</div>}
                {selectedLaporan.riwayat_audit?.length > 0 && (
                  <div><h5 className="font-bold text-sm text-gray-700 mb-3">Riwayat Audit</h5>
                    {selectedLaporan.riwayat_audit.map((a: any, i: number) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-lg mb-2 flex items-start"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 mr-3 shrink-0" /><div><p className="text-sm font-medium">{a.status}</p><p className="text-xs text-gray-500">{a.tanggal} • {a.petugas}</p></div></div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }
        return (
          <div>
            {laporanList.length === 0 && <div className="bg-white rounded-xl border p-12 text-center text-gray-500">Belum ada laporan dari MongoDB.</div>}
            {laporanList.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead><tr className="bg-gray-50 border-b text-gray-500 text-sm"><th className="p-4">ID Laporan</th><th className="p-4">Tanggal</th><th className="p-4">Deskripsi</th><th className="p-4">Korban</th><th className="p-4 text-center">Aksi</th></tr></thead>
                  <tbody className="text-sm">
                    {laporanList.map((l: any, i: number) => (
                      <tr key={l._id || i} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-bold text-blue-600">{l.id_laporan || l._id}</td>
                        <td className="p-4 text-gray-600">{l.tanggal_laporan}</td>
                        <td className="p-4 font-medium text-gray-800">{l.deskripsi?.substring(0, 50)}...</td>
                        <td className="p-4"><span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-bold">{l.jumlah_korban} orang</span></td>
                        <td className="p-4 text-center"><button onClick={() => setSelectedLaporan(l)} className="text-blue-600 hover:underline">Detail</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'dashboard':
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border p-6 cursor-pointer" onClick={() => setActiveSidebar('track_laporan')}><MessageSquare className="w-12 h-12 text-blue-500 mb-4" /><p className="text-sm font-medium text-gray-500">Total Laporan</p><h3 className="text-3xl font-bold">{9407 + laporanList.length}</h3></div>
              {!isSchool && <><div className="bg-white rounded-xl shadow-sm border p-6 cursor-pointer" onClick={() => setActiveSidebar('bahan')}><Utensils className="w-12 h-12 text-green-500 mb-4" /><p className="text-sm font-medium text-gray-500">Bahan Makanan</p><h3 className="text-3xl font-bold">{dashboardStats.bahan}</h3></div>
              <div className="bg-white rounded-xl shadow-sm border p-6 cursor-pointer" onClick={() => setActiveSidebar('sekolah')}><Building2 className="w-12 h-12 text-purple-500 mb-4" /><p className="text-sm font-medium text-gray-500">Sekolah</p><h3 className="text-3xl font-bold">{dashboardStats.sekolah}</h3></div>
              <div className="bg-white rounded-xl shadow-sm border p-6 cursor-pointer" onClick={() => setActiveSidebar('menu')}><Box className="w-12 h-12 text-orange-500 mb-4" /><p className="text-sm font-medium text-gray-500">Menu</p><h3 className="text-3xl font-bold">{dashboardStats.menu}</h3></div></>}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6"><h3 className="text-lg font-bold mb-6">Laporan & Pengaduan Terbaru</h3>
                <div className="space-y-6">
                  {laporanList.slice(0, 3).map((l: any, i: number) => (
                    <div key={l._id || i} className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded transition" onClick={() => { setSelectedLaporan(l); setActiveSidebar('track_laporan'); }}><div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center mr-4"><MessageSquare className="w-4 h-4" /></div><div className="flex-1 border-b pb-4"><div className="flex justify-between font-bold text-sm"><h4>{l.id_laporan || 'Laporan'}</h4><span className="text-xs text-red-600">{l.jumlah_korban} korban</span></div><p className="text-xs text-gray-500 mt-1">{l.deskripsi?.substring(0, 60)}...</p></div></div>
                  ))}
                  {laporanList.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Belum ada laporan.</p>}
                </div>
              </div>
              <div className="bg-blue-600 rounded-xl p-8 text-white flex flex-col justify-between shadow-lg shadow-blue-200"><div><h3 className="text-xl font-bold mb-4 font-sans tracking-tight">Butuh Bantuan?</h3><p className="text-blue-100 text-sm mb-6 leading-relaxed">Gunakan fitur Laporan untuk melaporkan kendala di lapangan secara cepat.</p><button onClick={() => setActiveSidebar(isSchool ? 'buat_laporan' : 'track_laporan')} className="bg-white text-blue-600 font-bold py-2.5 px-6 rounded-lg hover:bg-blue-50 transition shadow-sm">Buka Laporan</button></div></div>
            </div>
          </>
        );
    }
  };

  if (currentView === 'landing') return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-blue-600 font-bold text-xl"><Utensils className="w-6 h-6" /><span>MBG<span className="text-gray-900 font-light">Trace</span></span></div>
        <button onClick={() => setCurrentView('login')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Login Akun</button>
      </nav>
      <header className="pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50 to-white text-center">
        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6"><Info className="w-4 h-4" /><span>Program Nasional Generasi Emas 2045</span></div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">Makan Bergizi <span className="text-blue-600">Gratis</span> Untuk Masa Depan Bangsa</h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">Inisiatif pemerintah untuk memastikan setiap siswa di Indonesia mendapatkan asupan nutrisi yang cukup.</p>
        <button onClick={() => setCurrentView('login')} className="px-10 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-200">Akses Portal Sekarang</button>
      </header>
      <section className="py-20 px-6 container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        <div><div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><HeartPulse className="w-8 h-8" /></div><h3 className="text-2xl font-bold mb-4">Gizi Seimbang</h3><p className="text-gray-500">Menu dirancang khusus oleh pakar nutrisi.</p></div>
        <div><div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><ShieldCheck className="w-8 h-8" /></div><h3 className="text-2xl font-bold mb-4">Keamanan Pangan</h3><p className="text-gray-500">Standar higienitas yang sangat ketat.</p></div>
        <div><div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Truck className="w-8 h-8" /></div><h3 className="text-2xl font-bold mb-4">Distribusi Efisien</h3><p className="text-gray-500">Jaringan logistik yang terintegrasi.</p></div>
      </section>
      <footer className="py-12 border-t text-center text-gray-500 text-sm">© 2026 MBG Trace - Mendukung Program Gizi Nasional.</footer>
    </div>
  );

  if (currentView === 'login') return (
    <div className="min-h-screen bg-sky-50 flex justify-center items-center p-4 font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md relative">
        <button onClick={() => setCurrentView('landing')} className="absolute top-6 left-6 text-sm text-blue-600 flex items-center hover:underline"><ArrowLeft className="w-4 h-4 mr-1" /> Beranda</button>
        <div className="text-center mt-6 mb-8"><Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" /><h1 className="text-2xl font-bold">Login Sistem MBG</h1><p className="text-sm text-gray-500 mt-2">Gunakan email sekolah (.id) atau manajemen (.com)</p></div>
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Akun" className="w-full border border-gray-300 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full border border-gray-300 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-blue-500" required />
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-700 transition duration-200">Masuk Sistem</button>
        </form>
        <p className="mt-6 text-sm text-center text-gray-600">Belum memiliki akun? <span onClick={() => setCurrentView('register')} className="text-blue-600 font-bold cursor-pointer hover:underline">Daftar Akun</span></p>
      </div>
    </div>
  );

  if (currentView === 'register') return (
    <div className="min-h-screen bg-sky-50 flex justify-center items-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <button onClick={() => setCurrentView('landing')} className="mb-4 text-sm text-blue-600 flex items-center hover:underline"><ArrowLeft className="w-4 h-4 mr-1" /> Kembali</button>
        <h2 className="text-xl font-bold mb-4">Daftar Akun Baru</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Sekolah / Admin" className="w-full border rounded p-2" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" minLength={6} className="w-full border rounded p-2" required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold">Daftar Sekarang</button>
        </form>
      </div>
    </div>
  );

  if (currentView === 'dashboard') return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-white border-r flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b"><h1 className="text-2xl font-bold text-blue-600">MBG Trace</h1><p className="text-xs font-semibold text-gray-400 mt-1 uppercase">Dashboard {isSchool ? 'Sekolah' : 'Manajemen'}</p></div>
        <nav className="flex-1 py-6 overflow-y-auto"><ul className="space-y-1">{filteredMenus.map(m => (
          <li key={m.id}><button onClick={() => setActiveSidebar(m.id)} className={`w-full flex items-center space-x-3 px-6 py-3 font-medium transition ${activeSidebar === m.id ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}><m.icon className="w-5 h-5" /><span>{m.label}</span></button></li>
        ))}</ul></nav>
        <div className="p-6 border-t"><button onClick={() => { setLoggedInUser(null); setCurrentView('landing'); }} className="flex items-center space-x-2 text-gray-500 hover:text-red-600 font-medium w-full transition"><LogOut className="w-5 h-5" /><span>Keluar</span></button></div>
      </aside>
      <main className="flex-1 overflow-y-auto"><div className="p-8"><header className="mb-8 flex justify-between items-center"><div><h2 className="text-2xl font-bold text-gray-800">{sidebarMenus.find(m => m.id === activeSidebar)?.label}</h2><p className="text-sm text-gray-500">Akses: {loggedInUser?.email}</p></div></header>{renderDashboardContent()}</div></main>
    </div>
  );

  return null;
}
