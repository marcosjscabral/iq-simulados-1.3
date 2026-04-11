import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Camera, Image as ImageIcon, MinusCircle, Eye, Star, AlertCircle, Trash2, X, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useModal } from '../components/ModalContext';
import { StripeService } from '../lib/stripeService';
import { Simulado } from '../types';

interface StripeCoupon {
  id: string;
  name: string;
  percent_off: number | null;
  amount_off: number | null;
  currency: string | null;
  duration: string;
  valid: boolean;
  times_redeemed: number;
}

interface AdminSimuladosProps {
  onPublishSuccess?: () => void;
  availableCategories?: string[];
}

const AdminSimulados: React.FC<AdminSimuladosProps> = ({ onPublishSuccess, availableCategories = [] }) => {
  const { id: simuladoId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [questionsCount, setQuestionsCount] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredLabel, setFeaturedLabel] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState<StripeCoupon[]>([]);
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeletingGlobal, setIsDeletingGlobal] = useState(false);
  const [parentCategories, setParentCategories] = useState<string[]>([]);
  const { showAlert } = useModal();

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
            setParentCategories(data.parent_categories || []);
            setIsActive(data.is_active);
            setIsFeatured(data.is_featured);
            setFeaturedLabel(data.featured_label || '');
            setImageUrl(data.image_url || '');
            setSelectedCoupons(data.coupons || []);
          }
        } catch (error) {
          console.error('Error fetching simulado:', error);
          showAlert('Erro', 'Erro ao carregar os dados do simulado.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchSimulado();
    }

    const fetchAllCoupons = async () => {
      try {
        const data = await StripeService.listCoupons();
        if (data.data) {
          setAvailableCoupons(data.data);
        }
      } catch (error) {
        console.error('Error fetching all coupons:', error);
      }
    };
    fetchAllCoupons();
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

  const toggleCoupon = (couponId: string) => {
    if (selectedCoupons.includes(couponId)) {
      setSelectedCoupons(selectedCoupons.filter(id => id !== couponId));
    } else {
      setSelectedCoupons([...selectedCoupons, couponId]);
    }
  };

  const togglePremiumCategory = (cat: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (parentCategories.includes(cat)) {
      setParentCategories(parentCategories.filter(c => c !== cat));
    } else {
      setParentCategories([...parentCategories, cat]);
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
      const { error } = await supabase.rpc('remove_category_from_all_simulados', {
        cat_text: categoryToDelete
      });

      if (error) throw error;

      setCategories(categories.filter(c => c !== categoryToDelete));

      if (onPublishSuccess) onPublishSuccess();

      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      console.error('Error deleting category:', error);
      showAlert('Erro', 'Erro ao excluir categoria globalmente: ' + error.message, 'error');
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
      showAlert('Erro', 'Erro ao fazer upload da imagem: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!title || !price || !questionsCount) {
      showAlert('Atenção', 'Por favor, preencha o título, preço e questões.', 'alert');
      return;
    }

    setLoading(true);
    try {
      const { data: settings } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'stripe_enabled')
        .single();

      const stripeEnabled = settings?.value === 'true';
      const numericPrice = parseFloat(price.replace(',', '.'));

      let existingSimulado: Simulado | null = null;
      if (simuladoId) {
        const { data } = await supabase.from('simulados').select('*').eq('id', simuladoId).single();
        existingSimulado = data;
      }

      let stripeProductId = existingSimulado?.stripe_product_id;
      let stripePriceId = existingSimulado?.stripe_price_id;

      if (stripeEnabled) {
        try {
          if (stripeProductId) {
            await StripeService.updateProduct(stripeProductId, {
              name: title,
              description,
              images: imageUrl ? [imageUrl] : []
            });

            if (!stripePriceId || (existingSimulado && existingSimulado.price !== numericPrice)) {
              const priceResult = await StripeService.createPrice(stripeProductId, numericPrice);
              if (priceResult.error) throw new Error(priceResult.error.message);
              stripePriceId = priceResult.id;
            }
          } else {
            const productResult = await StripeService.createProduct(
              title,
              description,
              imageUrl ? [imageUrl] : []
            );
            if (productResult.error) throw new Error(productResult.error.message);

            stripeProductId = productResult.id;
            const priceResult = await StripeService.createPrice(stripeProductId, numericPrice);
            if (priceResult.error) throw new Error(priceResult.error.message);

            stripePriceId = priceResult.id;
          }
        } catch (err: any) {
          console.error('Stripe Sync Error:', err);
          let errorMsg = err.message;
          if (err.context && err.context.status) {
            errorMsg = `A função retornou o código de erro ${err.context.status}. Verifique os logs do Supabase Edge Functions.`;
          }
          showAlert('Erro Stripe', `Ocorreu um erro ao conectar com o Stripe: ${errorMsg}`, 'error');
          setLoading(false);
          return;
        }
      }

      const payload = {
        title,
        price: numericPrice,
        questions_count: parseInt(questionsCount),
        description,
        categories,
        parent_categories: parentCategories,
        is_active: isActive,
        is_featured: isFeatured,
        featured_label: featuredLabel,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId,
        coupons: selectedCoupons
      };

      let result;
      if (simuladoId) {
        result = await supabase.from('simulados').update(payload).eq('id', simuladoId);
      } else {
        result = await supabase.from('simulados').insert([payload]);
      }

      const { error } = result;

      if (error) throw error;

      // Sync Coupon Restrictions in Stripe
      if (stripeEnabled) {
        try {
          await StripeService.syncCouponsScope();
        } catch (syncErr) {
          console.error('Error syncing coupon scope:', syncErr);
          // We don't block the UI for a sync error, just log it
          // or alert if it's critical. Let's just log it for now.
        }
      }

      showAlert('Sucesso', simuladoId ? 'Simulado atualizado com sucesso!' : 'Simulado publicado com sucesso!', 'success');
      if (onPublishSuccess) onPublishSuccess();
      navigate('/admin/list');
    } catch (error: any) {
      console.error('Error publishing:', error);
      showAlert('Erro', 'Erro ao publicar: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex justify-center text-slate-900">
      <div className="relative flex min-h-screen w-full flex-col max-w-6xl bg-slate-50 overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center p-4 justify-between pt-12 max-w-6xl mx-auto w-full">
            <button
              onClick={() => navigate('/admin/list')}
              className="size-10 flex items-center justify-start text-slate-900"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex flex-col items-center">
              <h1 className="text-xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter">{simuladoId ? 'Editar' : 'Novo'} Simulado</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Painel Administrativo</p>
            </div>
            <div className="size-10" />
          </div>
        </header>

        <main className="flex-1 px-5 pt-8 space-y-6 pb-24 max-w-6xl mx-auto">
          {/* Upload Section */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm overflow-hidden min-h-[220px] flex items-center justify-center group hover:shadow-md transition-all">
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
                <div className="bg-yellow-100 p-4 rounded-full text-amber-600">
                  <div className="relative">
                    {uploading ? (
                      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Camera size={40} />
                        <Plus size={16} className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 border border-amber-300" />
                      </>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900 uppercase tracking-widest text-xs">Capa do Simulado</p>
                  <p className="text-[10px] text-slate-500 font-medium">800x450px (PNG ou JPG)</p>
                </div>
                <label className="cursor-pointer mt-2 text-slate-900 bg-amber-400 text-sm font-black uppercase italic px-8 py-3 rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95">
                  {uploading ? 'Enviando...' : 'Selecionar Imagem'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            )}
          </section>

          {/* Image Size Observations */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-slate-600 font-medium">
              <p><strong className="text-slate-900">Obs:</strong> Tamanho ideal para as capas: <span className="text-amber-500 font-bold">800x450px</span>.</p>
              <p>Para o banner de destaque: <span className="text-amber-500 font-bold">1200x600px</span>.</p>
            </div>
          </div>

          {/* Form Fields */}
          <section className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Simulado</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 outline-none focus:ring-2 focus:ring-amber-100 font-bold text-slate-900 placeholder:text-slate-400 uppercase italic"
                placeholder="Ex: Simulado Completo OAB 2024"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Preço (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-black">R$</span>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 outline-none focus:ring-2 focus:ring-amber-100 font-bold text-slate-900"
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Questões</label>
                <input
                  type="number"
                  value={questionsCount}
                  onChange={(e) => setQuestionsCount(e.target.value)}
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 outline-none focus:ring-2 focus:ring-amber-100 font-bold text-slate-900"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Gerenciar Categorias */}
            <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl border border-slate-200">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Gerenciar Categorias</label>

              <div className="flex flex-wrap gap-2 mb-2">
                {Array.from(new Set([...availableCategories, ...categories])).sort().map((cat) => (
                  <div key={cat} className="relative group/cat mt-2 ml-2">
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${categories.includes(cat)
                        ? 'bg-[#ffd700] text-black border-[#ffd700] shadow-lg shadow-yellow-400/20 scale-105'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-amber-300 hover:bg-amber-50 active:scale-95'
                        }`}
                    >
                      {cat}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCategoryClick(cat, e)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all shadow-xl shadow-red-600/40 active:scale-90 z-10 border-2 border-slate-200"
                    >
                      <X size={14} strokeWidth={4} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => togglePremiumCategory(cat, e)}
                      title={parentCategories.includes(cat) ? "Remover de Simulado Pai" : "Tornar Simulado Pai"}
                      className={`absolute -top-2 -left-2 rounded-full w-6 h-6 flex items-center justify-center transition-all shadow-xl active:scale-90 z-10 border-2 border-slate-200 ${parentCategories.includes(cat) ? 'bg-indigo-500 text-white shadow-indigo-500/40' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                    >
                      <Crown size={12} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm outline-none font-bold text-slate-900 focus:ring-2 focus:ring-amber-100 transition-all"
                  placeholder="Criar Nova Categoria"
                  onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                />
                <button
                  onClick={addCategory}
                  className="bg-[#ffd700] text-black w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/20 hover:scale-105 active:scale-95 transition-all shrink-0"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Gerenciar Cupons */}
            <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl border border-slate-200">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Gerenciar Cupons</label>

              {availableCoupons.length === 0 ? (
                <p className="text-[10px] text-slate-500 font-bold uppercase text-center py-2">Nenhum cupom disponível no Stripe</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableCoupons.map((coupon) => (
                    <button
                      key={coupon.id}
                      type="button"
                      onClick={() => toggleCoupon(coupon.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedCoupons.includes(coupon.id)
                        ? 'bg-[#ffd700] text-black border-[#ffd700] shadow-lg shadow-yellow-400/20 scale-105'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-amber-300 hover:bg-amber-50 active:scale-95'
                        }`}
                    >
                      {coupon.name}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-[9px] text-slate-600 font-medium px-1 leading-tight">
                * Selecione os cupons que estarão disponíveis para este simulado específico.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Descrição Curta</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-amber-100 font-medium resize-none text-slate-900 italic"
                placeholder="Breve resumo sobre o conteúdo do simulado..."
              ></textarea>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <Eye size={20} />
                  </div>
                  <span className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">Ativar na Vitrine</span>
                </div>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${isActive ? 'bg-[#ffd700]' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-5 bg-orange-50 rounded-2xl border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-500">
                    <Star size={20} />
                  </div>
                  <span className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">Colocar em Destaque</span>
                </div>
                <button
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${isFeatured ? 'bg-orange-500' : 'bg-white/10'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isFeatured ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest ml-1 text-center">Etiqueta de Destaque (Ex: MAIS PROCURADO)</label>
                <input
                  type="text"
                  value={featuredLabel}
                  onChange={(e) => setFeaturedLabel(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-orange-200 rounded-xl px-4 outline-none focus:ring-2 focus:ring-orange-100 font-bold text-[10px] text-slate-900 text-center uppercase tracking-widest"
                  placeholder="DEIXE EM BRANCO PARA NÃO EXIBIR"
                />
              </div>
            </div>
          </section>

          <div className="space-y-4 pt-12 pb-32">
            <button
              onClick={handlePublish}
              disabled={loading}
              className={`w-full bg-[#ffd700] text-black font-black uppercase tracking-tighter italic h-16 rounded-2xl shadow-xl shadow-yellow-400/20 active:scale-[0.98] transition-all flex items-center justify-center text-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" />
              ) : (simuladoId ? 'Salvar Alterações' : 'Publicar Simulado')}
            </button>
            <button
              onClick={() => navigate('/admin/list')}
              className="w-full bg-slate-50 text-slate-500 font-black h-16 rounded-2xl uppercase italic tracking-tighter active:scale-95 transition-all border border-slate-200"
            >
              Cancelar Edição
            </button>
          </div>
        </main>

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
                className="relative bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200"
              >
                <div className="bg-red-50 p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-500/30 animate-pulse">
                    <Trash2 size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-black text-red-950 leading-tight">Excluir Categoria?</h3>
                  <p className="mt-2 text-sm text-red-800/70 font-medium">
                    A categoria <span className="font-black text-red-600">"{categoryToDelete}"</span> será removida de TODOS os simulados cadastrados.
                  </p>
                </div>

                <div className="p-6 bg-white flex flex-col gap-3">
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
                    className="w-full h-14 bg-slate-100 text-slate-600 rounded-2xl font-bold active:scale-95 transition-all"
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
