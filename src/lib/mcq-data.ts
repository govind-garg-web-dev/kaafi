export type MCQOption = {
  id: string;
  icon: string;
  label: string;
  description: string;
};

export type MCQQuestion = {
  id: string;
  category: string;
  question: string;
  options: MCQOption[];
};

export type GeneratedQuestions = {
  questions: MCQQuestion[];
};
