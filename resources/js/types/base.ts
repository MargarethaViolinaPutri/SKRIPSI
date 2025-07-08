export type Base<T> = {
    prev_page?: number | null;
    items?: T;
    current_page?: number | null;
    next_page?: number | null;
    total_page?: number | null;
};

export type FilterProps = {
    updateParams?: (params: Record<string, unknown>) => void;
    currentParams?: Record<string, unknown>;
};

export type Paginated<T> = {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
};