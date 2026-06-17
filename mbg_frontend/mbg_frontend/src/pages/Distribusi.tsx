import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Plus, Edit2, Trash2, Loader2, Save, Truck } from 'lucide-react';
import Modal from '../components/UI/Modal';
import FormInput from '../components/UI/FormInput';

interface Sppg { id_sppg: number; tanggal_distribusi: string | null; jumlah_porsi: number | null; alamat_sppg: string | null; id_menu: number; id_sekolah: number; menu?: any; sekolah?: any; }

const Distribusi: React.FC = () => {
  const [sppgs, setSppgs] = useState<Sppg[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [sekolahs, setSekolahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sppg | null>(null);
  const [formData, setFormData] = useState({ tanggal_distribusi: '', jumlah_porsi: '', alamat_sppg: '', id_menu: '', id_sekolah: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try { setLoading(true); const [s, m, sk] = await Promise.all([api.get('/sppg'), api.get('/menu'), api.get('/sekolah')]); setSppgs(s.data); setMenus(m.data); setSekolahs(sk.data); } catch {} finally { setLoading(false); }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    const payload = { tanggal_distribusi: formData.tanggal_distribusi || null, jumlah_porsi: formData.jumlah_porsi ? parseInt(formData.jumlah_porsi) : null, alamat_sppg: formData.alamat_sppg || null, id_menu: parseInt(formData.id_menu), id_sekolah: parseInt(formData.id_sekolah) };
    try { if (editing) { await api.put(`/sppg/${editing.id_sppg}`, payload); } else { await api.post('/sppg', payload); } setIsModalOpen(false); fetchData(); }
    catch { alert('Gagal menyimpan.'); } finally { setIsSubmitting(false); }
  };
  const handleDelete = async (id: number) => {
    if (window.confirm('Hapus distribusi ini?')) { try { await api.delete(`/sppg/${id}`); setSppgs(sppgs.filter(s => s.id_sppg !== id)); } catch { alert('Gagal menghapus.'); } }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Status Distribusi (SPPG)</h3>
        <button onClick={() => { setEditing(null); setFormData({ tanggal_distribusi: new Date().toISOString().split('T')[0], jumlah_porsi: '', alamat_sppg: '', id_menu: '', id_sekolah: '' }); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">+ Tambah Distribusi</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm"><th className="p-4 font-semibold">Tanggal</th><th className="p-4 font-semibold">Menu</th><th className="p-4 font-semibold">Sekolah</th><th className="p-4 font-semibold">Porsi</th><th className="p-4 font-semibold text-right">Aksi</th></tr></thead>
          <tbody className="text-sm">
            {sppgs.map(item => (
              <tr key={item.id_sppg} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 flex items-center"><Truck size={14} className="text-gray-400 mr-2" />{item.tanggal_distribusi || '-'}</td>
                <td className="p-4 text-gray-600">{item.menu?.nama_menu || '-'}</td>
                <td className="p-4 text-gray-600">{item.sekolah?.nama_sekolah || '-'}</td>
                <td className="p-4 font-semibold">{item.jumlah_porsi ?? '-'}</td>
                <td className="p-4 text-right">
                  <button onClick={() => { setEditing(item); setFormData({ tanggal_distribusi: item.tanggal_distribusi?.split(' ')[0] || '', jumlah_porsi: item.jumlah_porsi?.toString() || '', alamat_sppg: item.alamat_sppg || '', id_menu: item.id_menu?.toString() || '', id_sekolah: item.id_sekolah?.toString() || '' }); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900 mr-3"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(item.id_sppg)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {sppgs.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">Belum ada data distribusi.</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Distribusi' : 'Tambah Distribusi'}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Tanggal Distribusi" type="date" value={formData.tanggal_distribusi} onChange={(e) => setFormData({...formData, tanggal_distribusi: e.target.value})} />
          <FormInput label="Jumlah Porsi" type="number" value={formData.jumlah_porsi} onChange={(e) => setFormData({...formData, jumlah_porsi: e.target.value})} placeholder="350" />
          <FormInput label="Alamat SPPG" isTextArea value={formData.alamat_sppg} onChange={(e) => setFormData({...formData, alamat_sppg: e.target.value})} placeholder="Lokasi dapur" />
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Menu</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" value={formData.id_menu} onChange={(e) => setFormData({...formData, id_menu: e.target.value})} required>
              <option value="">Pilih Menu</option>{menus.map((m: any) => <option key={m.id_menu} value={m.id_menu}>{m.nama_menu}</option>)}
            </select></div>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Sekolah</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" value={formData.id_sekolah} onChange={(e) => setFormData({...formData, id_sekolah: e.target.value})} required>
              <option value="">Pilih Sekolah</option>{sekolahs.map((s: any) => <option key={s.id_sekolah} value={s.id_sekolah}>{s.nama_sekolah}</option>)}
            </select></div>
          <div className="flex justify-end mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-4 py-2 text-gray-600">Batal</button>
            <button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}{editing ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Distribusi;
