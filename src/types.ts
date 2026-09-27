export type Language = "ja" | "en";
export type LocalizedText = { en: string; ja: string };

export type Topic = { id: string; code: string; name: LocalizedText };
export type Unit = {
  id: string;
  number: number;
  name: LocalizedText;
  examWeighting: LocalizedText;
  topics: Topic[];
};
export type Course = {
  id: string;
  name: LocalizedText;
  shortName: string;
  description: LocalizedText;
  accent: string;
  sourceUrl: string;
  units: Unit[];
};

export type ReferenceItem = {
  id: string;
  course: string;
  unit: string;
  topic: string;
  title: LocalizedText;
  description: LocalizedText;
  content: LocalizedText;
  tags: string[];
  relatedProblems: string[];
};

export type QuestionType = "multiple-choice" | "free-response" | "conceptual" | "calculation";

export type Problem = {
  id: string;
  course: string;
  unit: string;
  topic: string;
  title: LocalizedText;
  difficulty: 1 | 2 | 3 | 4 | 5;
  questionType: QuestionType;
  question: LocalizedText;
  solution: LocalizedText;
  tags: string[];
  relatedReferences: string[];
  choices?: LocalizedText[];
};

export type Route =
  | { page: "home" }
  | { page: "references" }
  | { page: "problems" }
  | { page: "course"; id: string }
  | { page: "reference"; id: string }
  | { page: "problem"; id: string };
