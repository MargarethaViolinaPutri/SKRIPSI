import { Entity } from './entity';

export type Course = Entity & {
    name?: string;
    desc?: string;
};
