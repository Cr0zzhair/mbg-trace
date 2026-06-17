import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Plus, Edit2, Trash2, Loader2, Save, School } from 'lucide-react';
import Modal from '../components/UI/Modal';
import FormInput from '../components/UI/FormInput';

interface SekolahItem { id_sekolah: number; nama_sekolah: string; alamat: string | null; }

const Sekolah: React.FC = () => {
  const [sekolahs, setSekolahs] = useState<SekolahItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<SekolahItem | null>(null);
  const [formData, setFormData] = useState({ nama_sekolah: '', alamat: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetch(); }, []);
  const fetch = async () => {
    try { setLoading(true); const res = await api.get('/sekolah'); setSekolahs(res.data); setError(null); }
    catch { setError('Gagal mengambil data sekolah.'); } finally { setLoading(false); }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try { if (editing) { await api.put(`/sekolah/${editing.id_sekolah}`, formData); } else { await api.post('/sekolah', formData); } setIsModalOpen(false); fetch(); }
    catch { alert('Gagal menyimpan.'); } finally { setIsSubmitting(false); }
  };
  const handleDelete = async (id: number) => {
    if (window.confirm('Hapus sekolah ini?')) { try { await api.delete(`/sekolah/${id}`); setSekolahs(sekolahs.filter(s => s.id_sekolah !== id)); } catch { alert('Gagal menghapus.'); } }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Daftar Sekolah Penerima</h3>
        <button onClick={() => { setEditing(null); setFormData({ nama_sekolah: '', alamat: '' }); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">+ Tambah Sekolah</button>
      </div>
      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg"><p className="text-red-700 text-sm">{error}</p></div>}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm"><th className="p-4 font-semibold">Nama Sekolah</th><th className="p-4 font-semibold">Alamat</th><th className="p-4 font-semibold text-right">Aksi</th></tr></thead>
          <tbody className="text-sm">
            {sekolahs.map(s => (
              <tr key={s.id_sekolah} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800 flex items-center"><School size={14} className="text-gray-400 mr-2" />{s.nama_sekolah}</td>
                <td className="p-4 text-gray-600">{s.alamat || '-'}</td>
                <td className="p-4 text-right">
                  <button onClick={() => { setEditing(s); setFormData({ nama_sekolah: s.nama_sekolah, alamat: s.alamat || '' }); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900 mr-3"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(s.id_sekolah)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {sekolahs.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-gray-500">Belum ada data sekolah.</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Sekolah' : 'Tambah Sekolah Baru'}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Nama Sekolah" required value={formData.nama_sekolah} onChange={(e) => setFormData({...formData, nama_sekolah: e.target.value})} placeholder="SDN Ketintang 1" />
          <FormInput label="Alamat" isTextArea value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} placeholder="Alamat lengkap" />
          <div className="flex justify-end mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-4 py-2 text-gray-600">Batal</button>
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}{editing ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Sekolah;
