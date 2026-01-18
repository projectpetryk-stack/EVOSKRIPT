
export enum Category {
  CLIENT_TYPE = 'Тип клієнта',
  PRODUCT = 'Продукт',
  STAGE = 'Етап продажу'
}

export interface ScriptStep {
  id: string;
  label: string;
  content: string;
  hint?: string;
}

export interface Script {
  id: string;
  title: string;
  category: Category;
  tags: string[];
  steps: ScriptStep[];
}

export interface Note {
  id: string;
  timestamp: number;
  content: string;
  isKeyPoint: boolean;
}

export interface UserSettings {
  fontSize: number;
  highContrast: boolean;
}
