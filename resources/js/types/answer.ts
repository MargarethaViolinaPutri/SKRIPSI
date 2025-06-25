import { Entity } from './entity';

export type Answer = Entity & {
    question_id: number;
    user_id: number;
    total_score: number;
}