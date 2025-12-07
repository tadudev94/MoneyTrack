import { QuestionOption, QuestionType } from '.';

export interface QuestionRQ {
  question_uid?: string;
  test_uid: string;
  question?: string;
  type?: QuestionType;
  manual_answer?: string;
  options?: QuestionOption[];
}
