import { VisitOptions } from '@inertiajs/core';
import { toast } from 'sonner';

export const FormResponse: VisitOptions = {
    onSuccess: () => {
        toast.success('Success...');
    },
    onError: (err) => {
        toast.error(JSON.stringify(err));
    },
};