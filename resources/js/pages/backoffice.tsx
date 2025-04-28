import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function Backoffice() {
    const { auth } = usePage<SharedData>().props;

    return (
        <div>
            {auth.role == 'student' && (
                <ul>
                    <li>Class : {auth.classroom?.name}</li>
                    <li>Level : {auth.classroom?.level}</li>
                </ul>
            )}
        </div>
    );
}

Backoffice.layout = (page: React.ReactNode) => <AppLayout children={page} />;
