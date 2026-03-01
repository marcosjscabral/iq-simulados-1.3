import React, { useState } from 'react';

const AdminSimulados = () => {
  const [categories, setCategories] = useState(['Direito', 'Concursos Públicos', 'Medicina']);
  const [newCategory, setNewCategory] = useState('');

  const addCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen flex justify-center">
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] shadow-2xl bg-white dark:bg-slate-900 overflow-x-hidden">
        
        {/* Header - Mantendo o estilo do seu HTML */}
        <header className="bg-yellow-400 p-6 pt-12 pb-8 rounded-b-[2rem] shadow-md">
          <div className="flex items-center gap-4">
            <button className="bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-sm transition-colors text-slate-900">
              <span className="material-symbols-outlined block">arrow_back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">Novo Simulado</h1>
              <p className="text-slate-800 text-sm font-medium opacity-80">Painel Administrativo IQ</p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 -mt-4 space-y-6 pb-12">
          {/* Upload Section */}
          <section className="bg-white dark:bg-slate-800 rounded-xl p-4 border-2 border-dashed border-blue-600/30 shadow-sm">
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <div className="bg-blue-600/10 p-4 rounded-full text-blue-600">
                <span className="material-symbols-outlined text-4xl">add_a_photo</span>
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">Capa do Simulado</p>
              <button className="mt-2 text-blue-600 text-sm font-bold border border-blue-600 px-4 py-2 rounded-lg">
                Selecionar Imagem
              </button>
            </div>
          </section>

          {/* Form Fields */}
          <section className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Nome do Simulado</label>
              <input type="text" className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ex: Simulado OAB 2024" />
            </div>

            {/* Gerenciar Categorias */}
            <div className="flex flex-col gap-3 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Categorias</label>
              <div className="flex gap-2">
                <input 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 h-12 bg-white dark:bg-slate-900 border border-slate-200 rounded-lg px-4 text-sm outline-none" 
                  placeholder="Nova Categoria" 
                />
                <button onClick={addCategory} className="bg-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((cat, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all">
            Publicar Simulado
          </button>
        </main>
      </div>
    </div>
  );
};

export default AdminSimulados;