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
  created_at?: string;
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
