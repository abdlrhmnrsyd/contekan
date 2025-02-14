'use client'

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Contekan {
  id: string;
  judul: string;
  isi: string;
  created_at: string;
}

export default function Home() {
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [contekans, setContekans] = useState<Contekan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchContekans = async () => {
      const { data, error } = await supabase
        .from('contekans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.log("Error fetching contekans:", error);
      else setContekans(data as Contekan[]);
    };

    fetchContekans();
  }, []);

  const tambahContekan = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (judul && isi) {
      const { data, error } = await supabase
        .from('contekans')
        .insert([{ judul, isi }])
        .select();

      if (error) console.log("Error adding contekan:", error);
      else setContekans([...(data ?? []), ...contekans]);
      setJudul('');
      setIsi('');
      setShowForm(false);
    }
  }, [judul, isi, contekans]);

  const hapusContekan = async (id: string) => {
    const { error } = await supabase
      .from('contekans')
      .delete()
      .eq('id', id);

    if (error) console.log("Error deleting contekan:", error);
    else setContekans(contekans.filter(contekan => contekan.id !== id));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Menggunakan regex untuk pencarian
  const filteredContekans = contekans.filter(contekan =>
    new RegExp(searchQuery, 'i').test(contekan.judul) ||
    new RegExp(searchQuery, 'i').test(contekan.isi)
  );

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Cari contekan..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
      />

      <button
        onClick={() => setShowForm(true)}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center mt-4"
      >
        Tambah Contekan
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mt-4">
        {filteredContekans.map((contekan) => (
          <div
            key={contekan.id}
            className="bg-gray-800 rounded-lg border border-gray-700 p-4 relative group h-64 flex flex-col"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-white">{contekan.judul}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCopy(contekan.isi, contekan.id)}
                  className={`p-1 rounded-md transition-colors duration-200 ${
                    copiedId === contekan.id
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {copiedId === contekan.id ? '✔' : '📋'}
                </button>

                <button
                  onClick={() => hapusContekan(contekan.id)}
                  className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                >
                  ❌
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-gray-300 bg-gray-800 p-4 rounded-lg whitespace-pre-wrap">
                {contekan.isi}
              </pre>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Tambah Contekan Baru</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={tambahContekan} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Judul Contekan"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <textarea
                  placeholder="Isi Contekan"
                  value={isi}
                  onChange={(e) => setIsi(e.target.value)}
                  className="w-full h-32 p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                Tambah Contekan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}