import { Course } from './course';
import { Entity } from './entity';

export type Module = Entity & {
    course_id?: number;
    course?: Course;
    name?: string;
    desc?: string;
};
