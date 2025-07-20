import { Entity } from './entity';

export type TestQuestionOption = Entity & {
    test_question_id: number;
    option_text: string;
    is_correct: boolean;
};