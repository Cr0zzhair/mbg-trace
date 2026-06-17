import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Plus, Edit2, Trash2, Loader2, Save, School } from 'lucide-react';
import Modal from '../components/UI/Modal';
import FormInput from '../components/UI/FormInput';

interface Sekolah {
  id_sekolah: number;
  nama_sekolah: string;
  alamat: string | null;
}

const SekolahPage: React.FC = () => {
  const [sekolahs, setSekolahs] = useState<Sekolah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSekolah, setEditingSekolah] = useState<Sekolah | null>(null);
  const [formData, setFormData] = useState({ nama_sekolah: '', alamat: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchSekolahs(); }, []);

  const fetchSekolahs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sekolah');
      setSekolahs(res.data);
      setError(null);
    } catch {
      setError('Gagal mengambil data sekolah.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingSekolah(null);
    setFormData({ nama_sekolah: '', alamat: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: Sekolah) => {
    setEditingSekolah(s);
    setFormData({ nama_sekolah: s.nama_sekolah, alamat: s.alamat || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingSekolah) {
        await api.put(`/sekolah/${editingSekolah.id_sekolah}`, formData);
      } else {
        await api.post('/sekolah', formData);
      }
      setIsModalOpen(false);
      fetchSekolahs();
    } catch {
      alert('Gagal menyimpan data sekolah.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Hapus sekolah ini?')) {
      try {
        await api.delete(`/sekolah/${id}`);
        setSekolahs(sekolahs.filter(s => s.id_sekolah !== id));
      } catch {
        alert('Gagal menghapus.');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-gray-500">Memuat data sekolah...</p>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Daftar sekolah penerima distribusi MBG.</p>
        <button onClick={handleOpenAddModal} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm">
          <Plus size={20} className="mr-2" /> Tambah Sekolah
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Sekolah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sekolahs.map((s) => (
              <tr key={s.id_sekolah} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <School size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{s.nama_sekolah}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.alamat || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenEditModal(s)} className="text-blue-600 hover:text-blue-900 mr-4"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(s.id_sekolah)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {sekolahs.length === 0 && !error && (
              <tr><td colSpan={3} className="px-6 py-10 text-center text-gray-500">Belum ada data sekolah.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSekolah ? 'Edit Sekolah' : 'Tambah Sekolah Baru'}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Nama Sekolah" required value={formData.nama_sekolah} onChange={(e) => setFormData({...formData, nama_sekolah: e.target.value})} placeholder="Contoh: SD Negeri 01 Jakarta" />
          <FormInput label="Alamat" isTextArea value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} placeholder="Alamat lengkap sekolah..." />
          <div className="flex justify-end mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-4 py-2 text-gray-600">Batal</button>
            <button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
              {editingSekolah ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SekolahPage;
