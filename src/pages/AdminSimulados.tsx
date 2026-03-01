import React, { useState } from 'react';
import { ArrowLeft, Plus, Camera, Image as ImageIcon, MinusCircle, Eye, Star } from 'lucide-react';
import { View } from '../types';
import { supabase } from '../lib/supabase';

interface AdminSimuladosProps {
  setView: (v: View) => void;
  onPublishSuccess?: () => void;
}

const AdminSimulados: React.FC<AdminSimuladosProps> = ({ setView, onPublishSuccess }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [questionsCount, setQuestionsCount] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState(['Direito', 'Concursos Públicos', 'Medicina']);
  const [newCategory, setNewCategory] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);

  const addCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!title || !price || !questionsCount) {
      alert('Por favor, preencha o título, preço e questões.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('simulados').insert([
        {
          title,
          price: parseFloat(price.replace(',', '.')),
          questions_count: parseInt(questionsCount),
          description,
          categories,
          is_active: isActive,
          is_featured: isFeatured,
          image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800' // Placeholder
        }
      ]);

      if (error) throw error;

      alert('Simulado publicado com sucesso!');
      if (onPublishSuccess) onPublishSuccess();
      setView('admin-dashboard');
    } catch (error: any) {
      console.error('Error publishing:', error);
      alert('Erro ao publicar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen flex justify-center">
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] shadow-2xl bg-white dark:bg-slate-900 overflow-x-hidden">

        {/* Header */}
        <header className="bg-[#FFD700] p-6 pt-12 pb-10 rounded-b-[2.5rem] shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('admin-dashboard')}
              className="bg-white/40 p-2 rounded-full backdrop-blur-sm transition-colors text-slate-900 shadow-sm"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-tight">Novo Simulado</h1>
              <p className="text-slate-800 text-sm font-semibold opacity-90">Painel Administrativo IQ</p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 -mt-6 space-y-6 pb-12">
          {/* Upload Section */}
          <section className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-6 border-2 border-dashed border-blue-200 dark:border-blue-800/50 shadow-sm">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="bg-blue-600/10 p-4 rounded-full text-blue-600">
                <div className="relative">
                  <Camera size={40} />
                  <Plus size={16} className="absolute -top-1 -right-1 bg-white rounded-full" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-700 dark:text-slate-200">Capa do Simulado</p>
                <p className="text-[10px] text-slate-500 font-medium">Recomendado: 800x450px (PNG ou JPG)</p>
              </div>
              <button className="mt-2 text-blue-600 text-sm font-bold border-2 border-blue-600 px-6 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                Selecionar Imagem
              </button>
            </div>
          </section>

          {/* Form Fields */}
          <section className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Nome do Simulado</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-14 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                placeholder="Ex: Simulado Completo OAB 2024"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Preço (R$)</label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full h-14 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  placeholder="0,00"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Questões</label>
                <input
                  type="number"
                  value={questionsCount}
                  onChange={(e) => setQuestionsCount(e.target.value)}
                  className="w-full h-14 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Gerenciar Categorias */}
            <div className="flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Gerenciar Categorias</label>
              <div className="flex gap-2">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 h-12 bg-white dark:bg-slate-900 border-2 border-slate-100 rounded-xl px-4 text-sm outline-none font-medium"
                  placeholder="Nova Categoria"
                />
                <button onClick={addCategory} className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all">
                  <Plus size={24} />
                </button>
              </div>

              <div className="space-y-2 mt-2">
                {categories.map((cat, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{cat}</span>
                    <button onClick={() => removeCategory(index)} className="relative flex items-center justify-center group">
                      <div className="absolute w-4 h-[2px] bg-white z-10"></div>
                      <div className="w-5 h-5 bg-orange-500 rounded-full group-hover:bg-orange-600 transition-colors"></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Descrição Curta</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-blue-600 font-medium resize-none"
                placeholder="Breve resumo sobre o conteúdo do simulado..."
              ></textarea>
            </div>

            <div className="space-y-3">
              {/* Active Vitrine Toggle */}
              <div className="flex items-center justify-between p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/10 rounded-lg text-blue-600">
                    <Eye size={20} />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">Ativar na Vitrine</span>
                </div>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${isActive ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between p-5 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                    <Star size={20} />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">Colocar em Destaque</span>
                </div>
                <button
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${isFeatured ? 'bg-orange-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isFeatured ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </div>
          </section>

          <div className="space-y-3 pt-4">
            <button
              onClick={handlePublish}
              disabled={loading}
              className={`w-full bg-blue-600 text-white font-bold h-14 rounded-2xl shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? 'Publicando...' : 'Publicar Simulado'}
            </button>
            <button className="w-full bg-slate-50 dark:bg-slate-800 text-blue-600 font-bold h-14 rounded-2xl border-2 border-blue-600/20 active:scale-[0.98] transition-all">
              Salvar Rascunho
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSimulados;
