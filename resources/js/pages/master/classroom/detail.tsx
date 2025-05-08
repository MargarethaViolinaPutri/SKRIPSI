import AppLayout from '@/layouts/app-layout';
import { ReactNode } from 'react';

export default function ClassroomDetail() {
    return (
        <div>
            <p>Hello</p>
        </div>
    );
}

ClassroomDetail.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;
