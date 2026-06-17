import React from 'react';

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
    <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
    <p className="text-gray-500">Halaman ini sedang dalam pengembangan.</p>
  </div>
);

export const BahanMakanan = () => <Placeholder title="Manajemen Bahan Makanan" />;
export const Menu = () => <Placeholder title="Manajemen Menu" />;
export const Sekolah = () => <Placeholder title="Manajemen Sekolah" />;
export const Sppg = () => <Placeholder title="Manajemen Distribusi (SPPG)" />;
export const Traceability = () => <Placeholder title="Traceability Report" />;
