import { Entity } from './entity';
import { Role } from './role';

export type ClassRoom = Entity & {
    name?: string;
    code?: string;
    level?: any;
    user_id?: number;
    user?: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
        email_verified_at: string | null;
        created_at: string;
        updated_at: string;
        roles?: Role[];
    };
};
