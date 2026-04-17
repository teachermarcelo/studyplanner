export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  xp: number;
  streak: number;
  last_login: string;
  is_admin: boolean;
  avatar_url?: string;
  badges: string[];
}

export interface Lesson {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  day: number;
  title: string;
  description: string;
  grammar_content: string;
  vocabulary: string[];
  reading_prompt: string;
  writing_prompt: string;
  video_url?: string;
  practice_quiz_id?: string;
}

export type ActivityType =
  | 'warmup'
  | 'vocabulary'
  | 'pronunciation'
  | 'grammar'
  | 'reading'
  | 'listening'
  | 'speaking'
  | 'matching'
  | 'fill_blank'
  | 'sentence_building'
  | 'translation'
  | 'quiz'
  | 'writing'
  | 'review'
  | 'flashcard';

export interface Activity {
  id: string;
  lesson_id: string;
  order_index: number;
  type: ActivityType;
  title: string;
  instruction?: string;
  content: any;
  xp: number;
  is_required: boolean;
  created_at?: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  questions: {
    question: string;
    options: string[];
    correct_option: number;
    explanation: string;
  }[];
}

export interface Progress {
  user_id: string;
  lesson_id: string;
  completed_at: string;
  score: number;
  vocabulary_mastered: string[];
  speaking_practice_count: number;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
}

export interface Flashcard {
  id: string;
  user_id: string;
  front: string;
  back: string;
  next_review: string;
  interval: number;
  ease_factor: number;
}
