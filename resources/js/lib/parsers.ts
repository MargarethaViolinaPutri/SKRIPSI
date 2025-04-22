import { dataTableConfig } from '@/config/data-table';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const filterItemSchema = z.object({
    id: z.string(),
    value: z.union([z.string(), z.array(z.string())]),
    variant: z.enum(dataTableConfig.filterVariants),
    operator: z.enum(dataTableConfig.operators),
    filterId: z.string(),
});

export type FilterItemSchema = z.infer<typeof filterItemSchema>;
