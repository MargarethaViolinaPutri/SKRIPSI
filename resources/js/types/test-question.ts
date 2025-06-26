import { Entity } from './entity';
import { TestQuestionOption } from './test-question-option';

export type TestQuestion = Entity & {
    test_id: number;
    question_text: string;
    options?: TestQuestionOption[];
};