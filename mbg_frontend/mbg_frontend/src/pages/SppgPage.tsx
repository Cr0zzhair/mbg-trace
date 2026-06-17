import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Plus, Edit2, Trash2, Loader2, Save, Truck } from 'lucide-react';
import Modal from '../components/UI/Modal';
import FormInput from '../components/UI/FormInput';

interface Sppg {
  id_sppg: number;
  tanggal_distribusi: string | null;
  jumlah_porsi: number | null;
  alamat_sppg: string | null;
  id_menu: number;
  id_sekolah: number;
  menu?: { id_menu: number; nama_menu: string };
  sekolah?: { id_sekolah: number; nama_sekolah: string };
}

const SppgPage: React.FC = () => {
  const [sppgs, setSppgs] = useState<Sppg[]>([]);
  const [menus, setMenus] = useState<{ id_menu: number; nama_menu: string }[]>([]);
  const [sekolahs, setSekolahs] = useState<{ id_sekolah: number; nama_sekolah: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSppg, setEditingSppg] = useState<Sppg | null>(null);
  const [formData, setFormData] = useState({
    tanggal_distribusi: '',
    jumlah_porsi: '',
    alamat_sppg: '',
    id_menu: '',
    id_sekolah: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sppgRes, menuRes, sekolahRes] = await Promise.all([
        api.get('/sppg'),
        api.get('/menu'),
        api.get('/sekolah')
      ]);
      setSppgs(sppgRes.data);
      setMenus(menuRes.data);
      setSekolahs(sekolahRes.data);
      setError(null);
    } catch {
      setError('Gagal mengambil data distribusi.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingSppg(null);
    setFormData({ tanggal_distribusi: new Date().toISOString().split('T')[0], jumlah_porsi: '', alamat_sppg: '', id_menu: '', id_sekolah: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Sppg) => {
    setEditingSppg(item);
    setFormData({
      tanggal_distribusi: item.tanggal_distribusi?.split(' ')[0] || '',
      jumlah_porsi: item.jumlah_porsi?.toString() || '',
      alamat_sppg: item.alamat_sppg || '',
      id_menu: item.id_menu?.toString() || '',
      id_sekolah: item.id_sekolah?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        tanggal_distribusi: formData.tanggal_distribusi || null,
        jumlah_porsi: formData.jumlah_porsi ? parseInt(formData.jumlah_porsi) : null,
        alamat_sppg: formData.alamat_sppg || null,
        id_menu: parseInt(formData.id_menu),
        id_sekolah: parseInt(formData.id_sekolah)
      };
      if (editingSppg) {
        await api.put(`/sppg/${editingSppg.id_sppg}`, payload);
      } else {
        await api.post('/sppg', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      alert('Gagal menyimpan data distribusi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Hapus data distribusi ini?')) {
      try {
        await api.delete(`/sppg/${id}`);
        setSppgs(sppgs.filter(s => s.id_sppg !== id));
      } catch {
        alert('Gagal menghapus.');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-gray-500">Memuat data distribusi...</p>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Data distribusi makanan ke sekolah.</p>
        <button onClick={handleOpenAddModal} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm">
          <Plus size={20} className="mr-2" /> Tambah Distribusi
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sekolah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Porsi</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sppgs.map((item) => (
              <tr key={item.id_sppg} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Truck size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{item.tanggal_distribusi || '-'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.menu?.nama_menu || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.sekolah?.nama_sekolah || '-'}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.jumlah_porsi ?? '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenEditModal(item)} className="text-blue-600 hover:text-blue-900 mr-4"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(item.id_sppg)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {sppgs.length === 0 && !error && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Belum ada data distribusi.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSppg ? 'Edit Distribusi' : 'Tambah Distribusi Baru'}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Tanggal Distribusi" type="date" value={formData.tanggal_distribusi} onChange={(e) => setFormData({...formData, tanggal_distribusi: e.target.value})} />
          <FormInput label="Jumlah Porsi" type="number" value={formData.jumlah_porsi} onChange={(e) => setFormData({...formData, jumlah_porsi: e.target.value})} placeholder="Contoh: 350" />
          <FormInput label="Alamat SPPG" isTextArea value={formData.alamat_sppg} onChange={(e) => setFormData({...formData, alamat_sppg: e.target.value})} placeholder="Alamat dapur / lokasi produksi" />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Menu</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.id_menu} onChange={(e) => setFormData({...formData, id_menu: e.target.value})} required>
              <option value="">Pilih Menu</option>
              {menus.map(m => <option key={m.id_menu} value={m.id_menu}>{m.nama_menu}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sekolah</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.id_sekolah} onChange={(e) => setFormData({...formData, id_sekolah: e.target.value})} required>
              <option value="">Pilih Sekolah</option>
              {sekolahs.map(s => <option key={s.id_sekolah} value={s.id_sekolah}>{s.nama_sekolah}</option>)}
            </select>
          </div>
          <div className="flex justify-end mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-4 py-2 text-gray-600">Batal</button>
            <button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
              {editingSppg ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SppgPage;
