import { User } from '.';
import { Entity } from './entity';
import { Question } from './question';

export type Answer = Entity & {
    question_id: number;
    user_id: number;
    total_score: number;
    time_spent_in_seconds?: number;
    student_code: string;
    user?: User;
    question?: Question;
}