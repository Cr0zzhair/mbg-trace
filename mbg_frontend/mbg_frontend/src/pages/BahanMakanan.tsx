import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Plus, Edit2, Trash2, Loader2, Save, Utensils } from 'lucide-react';
import Modal from '../components/UI/Modal';
import FormInput from '../components/UI/FormInput';

interface Supplier {
  id_supplier: number;
  nama_supplier: string;
}

interface BahanMakanan {
  id_bahan: number;
  nama_bahan: string;
  tanggal_kadaluarsa: string | null;
  id_supplier: number;
  supplier?: Supplier;
}

const BahanMakananPage: React.FC = () => {
  const [bahan, setBahan] = useState<BahanMakanan[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBahan, setEditingBahan] = useState<BahanMakanan | null>(null);
  const [formData, setFormData] = useState({
    nama_bahan: '',
    tanggal_kadaluarsa: '',
    id_supplier: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bahanRes, suppliersRes] = await Promise.all([
        api.get('/bahan-makanan'),
        api.get('/suppliers')
      ]);
      setBahan(bahanRes.data);
      setSuppliers(suppliersRes.data);
      setError(null);
    } catch (err) {
      setError('Gagal mengambil data. Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingBahan(null);
    setFormData({ nama_bahan: '', tanggal_kadaluarsa: '', id_supplier: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: BahanMakanan) => {
    setEditingBahan(item);
    setFormData({
      nama_bahan: item.nama_bahan,
      tanggal_kadaluarsa: item.tanggal_kadaluarsa || '',
      id_supplier: item.id_supplier?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        nama_bahan: formData.nama_bahan,
        tanggal_kadaluarsa: formData.tanggal_kadaluarsa || null,
        id_supplier: parseInt(formData.id_supplier)
      };
      if (editingBahan) {
        await api.put(`/bahan-makanan/${editingBahan.id_bahan}`, payload);
      } else {
        await api.post('/bahan-makanan', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Gagal menyimpan data bahan makanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Hapus bahan makanan ini?')) {
      try {
        await api.delete(`/bahan-makanan/${id}`);
        setBahan(bahan.filter(b => b.id_bahan !== id));
      } catch (err) {
        alert('Gagal menghapus.');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-gray-500">Memuat data bahan makanan...</p>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Manajemen data bahan makanan.</p>
        <button
          onClick={handleOpenAddModal}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Tambah Bahan
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Bahan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Kadaluarsa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bahan.map((item) => (
              <tr key={item.id_bahan} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Utensils size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{item.nama_bahan}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.tanggal_kadaluarsa || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.supplier?.nama_supplier || suppliers.find(s => s.id_supplier === item.id_supplier)?.nama_supplier || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDelete(item.id_bahan)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {bahan.length === 0 && !error && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                  Belum ada data bahan makanan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBahan ? 'Edit Bahan Makanan' : 'Tambah Bahan Makanan'}
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Nama Bahan"
            required
            value={formData.nama_bahan}
            onChange={(e) => setFormData({...formData, nama_bahan: e.target.value})}
            placeholder="Contoh: Beras, Ayam, Sawi"
          />
          <FormInput
            label="Tanggal Kadaluarsa"
            type="date"
            value={formData.tanggal_kadaluarsa}
            onChange={(e) => setFormData({...formData, tanggal_kadaluarsa: e.target.value})}
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.id_supplier}
              onChange={(e) => setFormData({...formData, id_supplier: e.target.value})}
              required
            >
              <option value="">Pilih Supplier</option>
              {suppliers.map(s => (
                <option key={s.id_supplier} value={s.id_supplier}>{s.nama_supplier}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-4 py-2 text-gray-600">Batal</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
              {editingBahan ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BahanMakananPage;
