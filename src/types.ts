/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type View =
  | 'login'
  | 'home'
  | 'my-exams'
  | 'exam-execution'
  | 'admin-dashboard'
  | 'profile'
  | 'materials'
  | 'answer-key'
  | 'user-registration'
  | 'admin-simulados'
  | 'admin-list-simulados'
  | 'purchase-history';

export interface Simulado {
  id: string;
  title: string;
  categories: string[];
  price: number;
  questions_count: number;
  description: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  featured_label?: string;
  stripe_product_id?: string;
  stripe_price_id?: string;
  created_at?: string;
}

export interface AppSetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface UserSimulado extends Simulado {
  progress: number; // 0 to 100
  status: 'new' | 'in-progress' | 'finished';
  score?: number;
  timeTaken?: string;
  rank?: string;
}

export interface Question {
  id: string;
  subject: string;
  text: string;
  options: {
    id: string;
    label: string;
    text: string;
  }[];
  correctOptionId: string;
}

export interface Questao {
  id: string;
  simulado_id: string;
  numero: number;
  enunciado: string;
  opcao_a: string;
  opcao_b: string;
  opcao_c: string;
  opcao_d: string;
  opcao_e?: string;
  resposta_correta: 'A' | 'B' | 'C' | 'D' | 'E';
  explicacao?: string;
  created_at: string;
}
