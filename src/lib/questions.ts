import kinematicsQuestions from "../../data/jee-main/physics/kinematics.json";

export interface QuestionData {
  id: string;
  exam: string;
  subject: string;
  chapter: string;
  year: number;
  question: string;
  options: Record<string, string>;
  correct_option: string;
  explanation: string;
}

export interface ChapterQuestionSet {
  exam: string;
  subject: string;
  chapter: string;
  title: string;
  questions: QuestionData[];
}

export const questionSets: ChapterQuestionSet[] = [
  {
    exam: "jee-main",
    subject: "physics",
    chapter: "kinematics",
    title: "Kinematics",
    questions: kinematicsQuestions,
  },
];

export function getChapterQuestionSet(exam: string, subject: string, chapter: string) {
  return questionSets.find(
    (set) => set.exam === exam && set.subject === subject && set.chapter === chapter,
  );
}