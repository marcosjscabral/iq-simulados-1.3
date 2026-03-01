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
  | 'purchase-history';

export interface Simulado {
  id: string;
  title: string;
  category: string;
  price: number;
  questionsCount: number;
  description: string;
  image: string;
  isFeatured?: boolean;
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
