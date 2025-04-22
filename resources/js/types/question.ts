import { Entity } from './entity';
import { Module } from './module';

export type Question = Entity & {
    module_id?: number;
    module?: Module;
    name?: string;
    desc?: string;
    code?: string;
    test?: string;
};
