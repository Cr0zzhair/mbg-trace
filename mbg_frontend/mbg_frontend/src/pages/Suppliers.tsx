import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Plus, Edit2, Trash2, Loader2, Save } from 'lucide-react';
import Modal from '../components/UI/Modal';
import FormInput from '../components/UI/FormInput';

interface Supplier {
  id_supplier: number;
  nama_supplier: string;
  alamat: string;
  no_telp: string;
}

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({ nama_supplier: '', alamat: '', no_telp: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    try { setLoading(true); const res = await api.get('/suppliers'); setSuppliers(res.data); setError(null); }
    catch { setError('Gagal mengambil data supplier.'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      if (editingSupplier) { await api.put(`/suppliers/${editingSupplier.id_supplier}`, formData); }
      else { await api.post('/suppliers', formData); }
      setIsModalOpen(false); fetchSuppliers();
    } catch { alert('Gagal menyimpan.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Hapus supplier ini?')) {
      try { await api.delete(`/suppliers/${id}`); setSuppliers(suppliers.filter(s => s.id_supplier !== id)); }
      catch { alert('Gagal menghapus.'); }
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Daftar Suppliers</h3>
        <button onClick={() => { setEditingSupplier(null); setFormData({ nama_supplier: '', alamat: '', no_telp: '' }); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">+ Tambah Supplier</button>
      </div>
      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg"><p className="text-red-700 text-sm">{error}</p></div>}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
            <th className="p-4 font-semibold">Nama Supplier</th><th className="p-4 font-semibold">Alamat</th><th className="p-4 font-semibold">No. Telp</th><th className="p-4 font-semibold text-right">Aksi</th>
          </tr></thead>
          <tbody className="text-sm">
            {suppliers.map(s => (
              <tr key={s.id_supplier} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{s.nama_supplier}</td>
                <td className="p-4 text-gray-600">{s.alamat || '-'}</td>
                <td className="p-4 text-gray-600">{s.no_telp || '-'}</td>
                <td className="p-4 text-right">
                  <button onClick={() => { setEditingSupplier(s); setFormData({ nama_supplier: s.nama_supplier, alamat: s.alamat || '', no_telp: s.no_telp || '' }); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900 mr-3"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(s.id_supplier)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">Belum ada data supplier.</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSupplier ? 'Edit Supplier' : 'Tambah Supplier Baru'}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Nama Supplier" required value={formData.nama_supplier} onChange={(e) => setFormData({...formData, nama_supplier: e.target.value})} placeholder="Contoh: PT. Tani Sejahtera" />
          <FormInput label="Alamat" isTextArea value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} placeholder="Alamat lengkap" />
          <FormInput label="No. Telepon" value={formData.no_telp} onChange={(e) => setFormData({...formData, no_telp: e.target.value})} placeholder="08xxxxxxxxx" />
          <div className="flex justify-end mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-4 py-2 text-gray-600">Batal</button>
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}{editingSupplier ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
