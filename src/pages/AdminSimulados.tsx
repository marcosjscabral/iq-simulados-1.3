import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, Camera, Image as ImageIcon, MinusCircle, Eye, Star, AlertCircle, Trash2, X } from 'lucide-react';
import { View } from '../types';
import { supabase } from '../lib/supabase';

interface AdminSimuladosProps {
  setView: (v: View) => void;
  onPublishSuccess?: () => void;
  simuladoId?: string;
  availableCategories?: string[];
}

const AdminSimulados: React.FC<AdminSimuladosProps> = ({ setView, onPublishSuccess, simuladoId, availableCategories = [] }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [questionsCount, setQuestionsCount] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState(['Direito', 'Concursos Públicos', 'Medicina']);
  const [newCategory, setNewCategory] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredLabel, setFeaturedLabel] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeletingGlobal, setIsDeletingGlobal] = useState(false);

  useEffect(() => {
    if (simuladoId) {
      const fetchSimulado = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('simulados')
            .select('*')
            .eq('id', simuladoId)
            .single();

          if (error) throw error;
          if (data) {
            setTitle(data.title);
            setPrice(data.price.toString().replace('.', ','));
            setQuestionsCount(data.questions_count.toString());
            setDescription(data.description || '');
            setCategories(data.categories || []);
            setIsActive(data.is_active);
            setIsFeatured(data.is_featured);
            setFeaturedLabel(data.featured_label || '');
            setImageUrl(data.image_url || '');
          }
        } catch (error) {
          console.error('Error fetching simulado:', error);
          alert('Erro ao carregar os dados do simulado.');
        } finally {
          setLoading(false);
        }
      };
      fetchSimulado();
    }
  }, [simuladoId]);

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter(c => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleDeleteCategoryClick = (cat: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToDelete(cat);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeletingGlobal(true);
    try {
      // Use the RPC function we created to remove from ALL simulations
      const { error } = await supabase.rpc('remove_category_from_all_simulados', {
        cat_text: categoryToDelete
      });

      if (error) throw error;

      // Also remove from the current simulation being edited if selected
      setCategories(categories.filter(c => c !== categoryToDelete));

      // Notify parent to refresh the global available categories list
      if (onPublishSuccess) onPublishSuccess();

      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      console.error('Error deleting category:', error);
      alert('Erro ao excluir categoria globalmente: ' + error.message);
    } finally {
      setIsDeletingGlobal(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('simulados')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('simulados')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Erro ao fazer upload da imagem: ' + error.message);
    } finally {
      setUploading(false);
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
      const payload = {
        title,
        price: parseFloat(price.replace(',', '.')),
        questions_count: parseInt(questionsCount),
        description,
        categories,
        is_active: isActive,
        is_featured: isFeatured,
        featured_label: featuredLabel,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800' // Better fallback
      };

      let result;
      if (simuladoId) {
        result = await supabase.from('simulados').update(payload).eq('id', simuladoId);
      } else {
        result = await supabase.from('simulados').insert([payload]);
      }

      const { error } = result;

      if (error) throw error;

      alert(simuladoId ? 'Simulado atualizado com sucesso!' : 'Simulado publicado com sucesso!');
      if (onPublishSuccess) onPublishSuccess();
      setView('admin-list-simulados');
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
              <h1 className="text-2xl font-black text-slate-900 leading-tight">
                {simuladoId ? 'Editar Simulado' : 'Novo Simulado'}
              </h1>
              <p className="text-slate-800 text-sm font-semibold opacity-90">Painel Administrativo IQ</p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 pt-8 space-y-6 pb-12">
          {/* Upload Section */}
          <section className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-6 border-2 border-dashed border-blue-200 dark:border-blue-800/50 shadow-sm overflow-hidden min-h-[220px] flex items-center justify-center">
            {imageUrl ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden group">
                <img src={imageUrl} alt="Capa" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm">
                    Alterar Imagem
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="bg-blue-600/10 p-4 rounded-full text-blue-600">
                  <div className="relative">
                    {uploading ? (
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Camera size={40} />
                        <Plus size={16} className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 border border-blue-200" />
                      </>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-700 dark:text-slate-200">Capa do Simulado</p>
                  <p className="text-[10px] text-slate-500 font-medium">800x450px (PNG ou JPG)</p>
                </div>
                <label className="cursor-pointer mt-2 text-blue-600 text-sm font-bold border-2 border-blue-600 px-6 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95">
                  {uploading ? 'Enviando...' : 'Selecionar Imagem'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            )}
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

              <div className="flex flex-wrap gap-2 mb-2">
                {/* Existing Categories as Selectable Chips */}
                {Array.from(new Set([...availableCategories, ...categories])).sort().map((cat) => (
                  <div key={cat} className="relative group/cat">
                    <button
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${categories.includes(cat)
                        ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-md scale-105'
                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 active:scale-95'
                        }`}
                    >
                      {cat}
                    </button>
                    <button
                      onClick={(e) => handleDeleteCategoryClick(cat, e)}
                      className="absolute -top-1.5 -right-1.5 bg-white dark:bg-slate-900 text-red-500 rounded-full p-0.5 border border-red-100 dark:border-red-900 shadow-sm hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/cat:opacity-100"
                    >
                      <MinusCircle size={14} fill="currentColor" className="text-white dark:text-slate-900" />
                      <MinusCircle size={14} className="absolute inset-0 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 h-12 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 text-sm outline-none font-medium focus:border-blue-500 transition-colors"
                  placeholder="Criar Nova Categoria"
                  onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                />
                <button
                  onClick={addCategory}
                  className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all shrink-0"
                >
                  <Plus size={24} />
                </button>
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

              {/* Featured Label Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-orange-600 dark:text-orange-400 ml-1">Etiqueta de Destaque (Ex: MAIS PROCURADO)</label>
                <input
                  type="text"
                  value={featuredLabel}
                  onChange={(e) => setFeaturedLabel(e.target.value)}
                  className="w-full h-12 bg-orange-50/50 dark:bg-orange-900/10 border-2 border-orange-100 dark:border-orange-800/30 rounded-xl px-4 outline-none focus:ring-2 focus:ring-orange-500 font-medium text-sm"
                  placeholder="Deixe em branco para não exibir mensagem"
                />
              </div>
            </div>
          </section>

          <div className="space-y-3 pt-4">
            <button
              onClick={handlePublish}
              disabled={loading}
              className={`w-full bg-blue-600 text-white font-bold h-14 rounded-2xl shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? 'Salvando...' : (simuladoId ? 'Salvar Alterações' : 'Publicar Simulado')}
            </button>
            <button
              onClick={() => setView('admin-list-simulados')}
              className="w-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-slate-900 font-bold h-14 rounded-2xl shadow-lg shadow-[#FFD700]/10 active:scale-[0.98] transition-all"
            >
              Editar Vitrine
            </button>
          </div>
        </main>

        {/* Delete Category Confirmation Modal */}
        <AnimatePresence>
          {isDeleteDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-6 p-4 perspective-1000">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDeleteDialogOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl border border-white/20"
              >
                <div className="bg-red-50 dark:bg-red-950/30 p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-500/30 animate-pulse">
                    <Trash2 size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-black text-red-950 dark:text-red-100 leading-tight">Excluir Categoria?</h3>
                  <p className="mt-2 text-sm text-red-800/70 dark:text-red-300 font-medium">
                    A categoria <span className="font-black text-red-600">"{categoryToDelete}"</span> será removida de TODOS os simulados cadastrados.
                  </p>
                </div>

                <div className="p-6 bg-white dark:bg-slate-900 flex flex-col gap-3">
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeletingGlobal}
                    className="w-full h-14 bg-red-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isDeletingGlobal ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trash2 size={20} />
                        Confirmar Exclusão
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={isDeletingGlobal}
                    className="w-full h-14 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold active:scale-95 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminSimulados;
