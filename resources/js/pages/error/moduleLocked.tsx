import AppLayout from '@/layouts/app-layout';
import { Module } from '@/types/module';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Lock } from 'lucide-react';

interface Props {
    module: Module;
}

export default function ModuleLocked({ module }: Props) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Lock className="w-24 h-24 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Module Locked</h1>
            <p className="mt-2 text-lg text-gray-600">
                You cannot access "{module.name}" yet.
            </p>
            <p className="mt-2 max-w-md text-sm text-gray-500">
                To unlock this module, you must complete the previous module with 100% progress and an average score of 80 or higher.
            </p>
            <div className="mt-8">
                <Link
                    href={route('operational.lms.show', { id: module.course_id })}
                    className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Course
                </Link>
            </div>
        </div>
    );
}

ModuleLocked.layout = (page: React.ReactNode) => <AppLayout children={page} />;