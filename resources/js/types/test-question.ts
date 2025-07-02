import { Entity } from './entity';
import { TestQuestionOption } from './test-question-option';

export type TestQuestion = Entity & {
    test_id: number;
    name: string;
    desc?: string | null;
    code?: string;
    test?: string;
    question_text: string;
    image_path?: string | null;
    image_url?: string | null;
    options?: TestQuestionOption[];
};