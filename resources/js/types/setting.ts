import { Entity } from './entity';

export type Setting = Entity & {
    key: string;
    value: string;
};
