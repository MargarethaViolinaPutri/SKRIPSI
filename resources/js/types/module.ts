import { Course } from './course';
import { Entity } from './entity';

export type Module = Entity & {
    course_id?: number;
    course?: Course;
    name?: string;
    desc?: string;
    material_paths?: string[]; // Add this property for material_paths from DB
    materials?: {
        id: number;
        file_name: string;
        mime_type: string;
        url: string;
    }[];
    performance?: {
        average_score: number;
        questions_answered: number;
        total_questions: number;
        total_attempts: number;
        total_time_spent_seconds: number;
    } | null;
    is_locked?: boolean;
};
