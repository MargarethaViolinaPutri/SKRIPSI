import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Inertia } from '@inertiajs/inertia';
import { Head, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

interface Course {
    id: number;
    name: string;
    threshold: number | null;
}

const Threshold: React.FC = () => {
    const { course, averageData, testProgress, studentTestDetails } = usePage().props as unknown as {
        course: Course;
        averageData: { average_score: number; student_count: number };
        testProgress: { total_students: number; students_tested: number };
        studentTestDetails: { id: number; name: string; total_score: number; class_group: string }[];
    };

    const [threshold, setThreshold] = useState<number | ''>(course.threshold ?? '');

    const columns = [
        {
            id: 'name',
            header: 'Name',
            accessorKey: 'name',
        },
        {
            id: 'total_score',
            header: 'Total Score',
            accessorKey: 'total_score',
        },
        {
            id: 'class_group',
            header: 'Class Group',
            accessorKey: 'class_group',
        },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            setThreshold('');
        } else {
            const num = Number(value);
            if (!isNaN(num) && num >= 0) {
                setThreshold(num);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        Inertia.put(
            `/master/course/${course.id}/threshold`,
            { threshold },
            {
                onSuccess: () => {
                    alert('Threshold updated successfully');
                },
                onError: () => {
                    alert('Failed to update threshold');
                },
            },
        );
    };

    // Dummy load function to satisfy NextTable props
    const load = async (params: Record<string, unknown>) => {
        return Promise.resolve({
            data: studentTestDetails,
            meta: {
                current_page: 1,
                from: 0,
                last_page: 1,
                per_page: 10,
                to: studentTestDetails.length,
                total: studentTestDetails.length,
            },
            links: {
                first: '',
                last: '',
                prev: null,
                next: null,
            },
        });
    };

    return (
        <>
            <Head title="Manage Threshold" />
            <>
                <h2 className="mb-4 text-xl font-semibold text-slate-800 dark:text-slate-100">
                    Manage Threshold for <span className="text-blue-600">{course.name}</span>
                </h2>

                <div className="mb-4 space-y-1 text-gray-700 dark:text-gray-200">
                    <p>
                        <strong>Average Score:</strong> {averageData.average_score.toFixed(2)}
                    </p>

                    <p className="mt-2 font-semibold">Test Progress:</p>
                    <div className="flex max-w-xs flex-col gap-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">
                                {testProgress.students_tested} / {testProgress.total_students} students tested
                            </span>
                            <span className="text-xs font-bold">
                                {Math.round((testProgress.students_tested / testProgress.total_students) * 100)}%
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${(testProgress.students_tested / testProgress.total_students) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="threshold" className="mb-1 block font-medium text-gray-800 dark:text-gray-100">
                        Set Threshold Value
                    </label>
                    <input
                        id="threshold"
                        type="number"
                        min="0"
                        value={threshold}
                        onChange={handleChange}
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-700 dark:text-white"
                        required
                    />

                    {threshold !== '' && threshold < averageData.average_score && (
                        <p className="mt-1 text-sm text-red-500">⚠️ Threshold is below average score.</p>
                    )}

                    <Button type="submit" className="mt-4 w-full">
                        💾 Update Threshold
                    </Button>
                </form>

                <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold">Student Test Details</h3>
                    <NextTable columns={columns} enableSelect={false} mode="table" id="student-test-details" load={load} />
                </div>
            </>
        </>
    );
};

(Threshold as any).layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Threshold;
