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
  const [formData, setFormData] = useState({
    nama_supplier: '',
    alamat: '',
    no_telp: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
      setError(null);
    } catch (err) {
      setError('Gagal mengambil data supplier. Pastikan backend berjalan.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setFormData({ nama_supplier: '', alamat: '', no_telp: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      nama_supplier: supplier.nama_supplier,
      alamat: supplier.alamat || '',
      no_telp: supplier.no_telp || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id_supplier}`, formData);
      } else {
        await api.post('/suppliers', formData);
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      alert('Gagal menyimpan data supplier.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus supplier ini?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        setSuppliers(suppliers.filter(s => s.id_supplier !== id));
      } catch (err) {
        alert('Gagal menghapus supplier.');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-gray-500">Memuat data supplier...</p>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Daftar semua supplier yang terdaftar dalam sistem.</p>
        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Tambah Supplier
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Telp</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map((supplier) => (
              <tr key={supplier.id_supplier} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.nama_supplier}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{supplier.alamat || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.no_telp || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleOpenEditModal(supplier)}
                    className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900 transition-colors"
                    onClick={() => handleDelete(supplier.id_supplier)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && !error && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                  Belum ada data supplier.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier' : 'Tambah Supplier Baru'}
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Nama Supplier"
            required
            value={formData.nama_supplier}
            onChange={(e) => setFormData({...formData, nama_supplier: e.target.value})}
            placeholder="Contoh: PT. Tani Sejahtera"
          />
          <FormInput
            label="Alamat"
            isTextArea
            value={formData.alamat}
            onChange={(e) => setFormData({...formData, alamat: e.target.value})}
            placeholder="Alamat lengkap supplier..."
          />
          <FormInput
            label="Nomor Telepon"
            value={formData.no_telp}
            onChange={(e) => setFormData({...formData, no_telp: e.target.value})}
            placeholder="Contoh: 08123456789"
          />
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="mr-3 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : (
                <Save size={18} className="mr-2" />
              )}
              {editingSupplier ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
