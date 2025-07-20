export type Role = {
    id?:         number;
    name?:       string;
    guard_name?: string;
    created_at?: Date;
    updated_at?: Date;
    pivot?:      Pivot;
}

export type Pivot = {
    model_type?: string;
    model_id?:   number;
    role_id?:    number;
}
