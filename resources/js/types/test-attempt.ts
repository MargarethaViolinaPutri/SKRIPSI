import { Entity } from "./entity";
import { Test } from "./test";
import { TestAnswer } from "./test-answer";

export type TestAttempt = Entity & {
    test_id: number;
    user_id: number;
    total_score?: number;
    started_at: string;
    finished_at?: string;
    test: Test;
    answers?: TestAnswer[];
    time_spent_in_seconds?: number;
    student_code?: string;
};