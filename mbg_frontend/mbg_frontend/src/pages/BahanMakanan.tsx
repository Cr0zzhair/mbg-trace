import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Plus, Edit2, Trash2, Loader2, Save, Utensils } from 'lucide-react';
import Modal from '../components/UI/Modal';
import FormInput from '../components/UI/FormInput';

interface BahanMakanan {
  id_bahan: number;
  nama_bahan: string;
  tanggal_kadaluarsa: string | null;
  id_supplier: number;
  supplier?: { id_supplier: number; nama_supplier: string };
}

const BahanMakananPage: React.FC = () => {
  const [bahan, setBahan] = useState<BahanMakanan[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBahan, setEditingBahan] = useState<BahanMakanan | null>(null);
  const [formData, setFormData] = useState({ nama_bahan: '', tanggal_kadaluarsa: '', id_supplier: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { setLoading(true); const [b, s] = await Promise.all([api.get('/bahan-makanan'), api.get('/suppliers')]); setBahan(b.data); setSuppliers(s.data); setError(null); }
    catch { setError('Gagal mengambil data.'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    const payload = { nama_bahan: formData.nama_bahan, tanggal_kadaluarsa: formData.tanggal_kadaluarsa || null, id_supplier: parseInt(formData.id_supplier) };
    try {
      if (editingBahan) { await api.put(`/bahan-makanan/${editingBahan.id_bahan}`, payload); }
      else { await api.post('/bahan-makanan', payload); }
      setIsModalOpen(false); fetchData();
    } catch { alert('Gagal menyimpan.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Hapus bahan makanan ini?')) {
      try { await api.delete(`/bahan-makanan/${id}`); setBahan(bahan.filter(b => b.id_bahan !== id)); } catch { alert('Gagal menghapus.'); }
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Stok Bahan Makanan</h3>
        <button onClick={() => { setEditingBahan(null); setFormData({ nama_bahan: '', tanggal_kadaluarsa: '', id_supplier: '' }); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">+ Tambah Bahan</button>
      </div>
      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg"><p className="text-red-700 text-sm">{error}</p></div>}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
            <th className="p-4 font-semibold">Nama Bahan</th><th className="p-4 font-semibold">Supplier</th><th className="p-4 font-semibold">Tanggal Kadaluarsa</th><th className="p-4 font-semibold text-right">Aksi</th>
          </tr></thead>
          <tbody className="text-sm">
            {bahan.map(item => (
              <tr key={item.id_bahan} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800 flex items-center"><Utensils size={14} className="text-gray-400 mr-2" />{item.nama_bahan}</td>
                <td className="p-4 text-gray-600">{item.supplier?.nama_supplier || suppliers.find(s => s.id_supplier === item.id_supplier)?.nama_supplier || '-'}</td>
                <td className="p-4 text-gray-600">{item.tanggal_kadaluarsa || '-'}</td>
                <td className="p-4 text-right">
                  <button onClick={() => { setEditingBahan(item); setFormData({ nama_bahan: item.nama_bahan, tanggal_kadaluarsa: item.tanggal_kadaluarsa || '', id_supplier: item.id_supplier?.toString() || '' }); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900 mr-3"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(item.id_bahan)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {bahan.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">Belum ada data bahan makanan.</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBahan ? 'Edit Bahan' : 'Tambah Bahan Makanan'}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Nama Bahan" required value={formData.nama_bahan} onChange={(e) => setFormData({...formData, nama_bahan: e.target.value})} placeholder="Contoh: Beras, Ayam" />
          <FormInput label="Tanggal Kadaluarsa" type="date" value={formData.tanggal_kadaluarsa} onChange={(e) => setFormData({...formData, tanggal_kadaluarsa: e.target.value})} />
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.id_supplier} onChange={(e) => setFormData({...formData, id_supplier: e.target.value})} required>
              <option value="">Pilih Supplier</option>
              {suppliers.map((s: any) => <option key={s.id_supplier} value={s.id_supplier}>{s.nama_supplier}</option>)}
            </select>
          </div>
          <div className="flex justify-end mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-4 py-2 text-gray-600">Batal</button>
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}{editingBahan ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BahanMakananPage;
