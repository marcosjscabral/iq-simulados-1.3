import { Simulado, UserSimulado, Question } from './types';

export const CATEGORIES = ['Todos', 'ENEM', 'Concursos', 'OAB', 'Medicina'];

export const FEATURED_SIMULADO: Simulado = {
  id: 'enem-2024',
  title: 'Simulado Nacional ENEM 2024',
  category: 'ENEM',
  price: 49.90,
  questionsCount: 180,
  description: '180 Questões inéditas com correção TRI e proposta de redação exclusiva.',
  image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
  isFeatured: true
};

export const AVAILABLE_SIMULADOS: Simulado[] = [
  {
    id: 'oab-xlii',
    title: 'Exame de Ordem OAB - 1ª Fase XLII',
    category: 'OAB',
    price: 34.90,
    questionsCount: 80,
    description: '80 Questões Objetivas focadas no edital mais recente.',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'med-2025',
    title: 'Residência Médica 2025 - Geral',
    category: 'Medicina',
    price: 59.90,
    questionsCount: 100,
    description: '100 Questões Especializadas para as principais instituições.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'bb-ti',
    title: 'Concurso BB - Escriturário TI',
    category: 'Concursos',
    price: 29.90,
    questionsCount: 70,
    description: '70 Questões + Inglês técnico para área de tecnologia.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400'
  }
];

export const USER_SIMULADOS: UserSimulado[] = [
  {
    ...AVAILABLE_SIMULADOS[0],
    id: 'user-oab',
    progress: 45,
    status: 'in-progress'
  },
  {
    id: 'tre-sp',
    title: 'TRE-SP Técnico Judiciário',
    category: 'Concursos',
    price: 0,
    questionsCount: 60,
    description: '60 questões • Edital 2024',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400',
    progress: 0,
    status: 'new'
  },
  {
    id: 'med-usp',
    title: 'Residência Médica USP 2023',
    category: 'Medicina',
    price: 0,
    questionsCount: 100,
    description: '100 Questões Especializadas',
    image: 'https://images.unsplash.com/photo-1505751172107-573967a4dd2a?auto=format&fit=crop&q=80&w=400',
    progress: 100,
    status: 'finished',
    score: 82,
    timeTaken: '03h 12m',
    rank: '#124'
  }
];

export const MOCK_QUESTION: Question = {
  id: 'q45',
  subject: 'Direito Administrativo',
  text: 'Considerando as disposições da Lei nº 8.112/1990 e a jurisprudência dos tribunais superiores, julgue o item a seguir relativo ao regime jurídico dos servidores públicos civis da União.\n\nÉ dever do servidor público ser leal às instituições a que servir, bem como observar as normas legais e regulamentares, sob pena de responsabilidade administrativa.',
  options: [
    { id: 'a', label: 'A', text: 'Certo' },
    { id: 'b', label: 'B', text: 'Errado' }
  ],
  correctOptionId: 'a'
};
