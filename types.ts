export interface LessonStep {
  board: string;
  spoken: string;
  visualType?: 'html' | 'image';
}

export interface LessonPlan {
  steps: LessonStep[];
}

export interface AIStudioWindow {
  aistudio?: {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  };
}