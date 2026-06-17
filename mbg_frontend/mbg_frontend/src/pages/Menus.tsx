import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Plus, Edit2, Trash2, Loader2, Save, Calendar } from 'lucide-react';
import Modal from '../components/UI/Modal';
import FormInput from '../components/UI/FormInput';

interface Menu {
  id_menu: number;
  nama_menu: string;
  tanggal_produksi: string;
}

const MenuPage: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [formData, setFormData] = useState({
    nama_menu: '',
    tanggal_produksi: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/menu');
      setMenus(response.data);
      setError(null);
    } catch (err) {
      setError('Gagal mengambil data menu.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMenu(null);
    setFormData({ nama_menu: '', tanggal_produksi: new Date().toISOString().split('T')[0] });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      nama_menu: menu.nama_menu,
      tanggal_produksi: menu.tanggal_produksi || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingMenu) {
        await api.put(`/menu/${editingMenu.id_menu}`, formData);
      } else {
        await api.post('/menu', formData);
      }
      setIsModalOpen(false);
      fetchMenus();
    } catch (err) {
      alert('Gagal menyimpan menu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Hapus menu ini?')) {
      try {
        await api.delete(`/menu/${id}`);
        setMenus(menus.filter(m => m.id_menu !== id));
      } catch (err) {
        alert('Gagal menghapus.');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-gray-500">Memuat data menu...</p>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Daftar menu makanan yang diproduksi.</p>
        <button
          onClick={handleOpenAddModal}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Tambah Menu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menus.map((menu) => (
          <div key={menu.id_menu} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                <Calendar size={24} />
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleOpenEditModal(menu)} className="p-1 text-gray-400 hover:text-blue-600">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(menu.id_menu)} className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{menu.nama_menu}</h3>
            <p className="text-sm text-gray-500">Produksi: {menu.tanggal_produksi || '-'}</p>
          </div>
        ))}
        {menus.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            Belum ada menu yang terdaftar.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Nama Menu"
            required
            value={formData.nama_menu}
            onChange={(e) => setFormData({...formData, nama_menu: e.target.value})}
            placeholder="Contoh: Nasi Kuning Ayam"
          />
          <FormInput
            label="Tanggal Produksi"
            type="date"
            required
            value={formData.tanggal_produksi}
            onChange={(e) => setFormData({...formData, tanggal_produksi: e.target.value})}
          />
          <div className="flex justify-end mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-4 py-2 text-gray-600">Batal</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
              {editingMenu ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MenuPage;
