import { Entity } from "./entity";
import { TestQuestionOption } from "./test-question-option";

export type TestAnswer = Entity & {
    test_attempt_id: number;
    test_question_id: number;
    test_question_option_id: number;
    option?: TestQuestionOption;
    student_code: string;
    score: number;
};