import AppLayout from '@/layouts/app-layout';
import { Base } from '@/types/base';
import { Course } from '@/types/course';
import { Module } from '@/types/module';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Eye, Lock } from 'lucide-react';
import NextTable from '@/components/next-table';
import axios from 'axios';

interface Props {
    course: Course;
}

export default function ModuleIndex({ course }: Props) {
    const loadModules = async (params: Record<string, unknown>) => {
        const queryParams = {
            ...params,
            'filter[course_id]': course.id,
        };
        
        const response = await axios.get<Base<Module[]>>(route('operational.module.fetch', queryParams));
        let previousModuleCompleted = true; 

        const processedModules = response.data.items.map(module => {
            const newModule = { ...module };

            newModule.is_locked = !previousModuleCompleted;

            const perf = newModule.performance;
            const progress = perf && perf.total_questions > 0 ? (perf.questions_answered / perf.total_questions) * 100 : 0;
            const score = perf ? perf.average_score : 0;
            
            previousModuleCompleted = (progress === 100 && score >= 80);

            return newModule;
        });
        
        response.data.items = processedModules;
        return response.data;
    };

    const getBadgeForScore = (score: number | null | undefined) => {
        if (score === null || score === undefined) {
            return <span className="text-xs font-semibold text-gray-500">Not Attempted</span>;
        }

        let badgeImage = '';
        let altText = '';

        if (score >= 80) {
            badgeImage = '/images/BADGES GOLD.png';
            altText = 'Gold Badge';
        } else if (score >= 40) {
            badgeImage = '/images/BADGES SILVER.png';
            altText = 'Silver Badge';
        } else {
            badgeImage = '/images/BADGES BRONZE.png';
            altText = 'Bronze Badge';
        }

        return (
            <img 
                src={badgeImage} 
                alt={altText} 
                title={`${altText} (Score: ${score})`} 
                className="h-10 w-10 object-contain" 
            />
        );
    };

    const helper = createColumnHelper<Module>();

    const moduleColumns: ColumnDef<Module, any>[] = [
        helper.accessor('id', {
            id: 'id',
            header: 'ID',
            enableColumnFilter: false,
            enableHiding: false,
        }),
        helper.accessor('name', {
            id: 'name',
            header: 'Name',
            enableColumnFilter: true,
            cell: ({ row }) => row.original.name,
        }),
        helper.display({
            id: 'progress',
            header: 'Progress',
            size: 200, 
            cell: ({ row }) => {
                const performance = row.original.performance;

                if (!performance || performance.total_questions === 0) {
                    return <span className="text-xs text-gray-500">-</span>;
                }

                const { questions_answered, total_questions } = performance;
                const progressPercentage = (questions_answered / total_questions) * 100;

                return (
                    <div className="flex flex-col gap-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-600">
                                {questions_answered} / {total_questions} answered
                            </span>
                            <span className="text-xs font-bold">
                                {Math.round(progressPercentage)}%
                            </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                );
            },
        }),
        helper.accessor('score', {
            id: 'score',
            header: 'Average Score',
            cell: ({ row }) => {
                const score = row.original.performance?.average_score;
                if (score === null || score === undefined) {
                    return <span className="text-xs font-semibold text-gray-500">Not Attempted</span>;
                }
                return score.toFixed(2);
            },
        }),

        helper.accessor('achievement', {
            id: 'achievement',
            header: 'Achievement',
            cell: ({ row }) => {
                const score = row.original.performance?.average_score;
                return getBadgeForScore(score);
            }
        }),
        helper.accessor('avg_attempts', {
            id: 'avg_attempts',
            header: 'Avg. Attempts',
            cell: ({ row }) => {
                const avgAttempts = row.original.performance?.average_attempts;
                if (avgAttempts === null || avgAttempts === undefined) {
                    return <span className="text-gray-400">-</span>;
                }
                return avgAttempts.toFixed(1);
            },
        }),
        helper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                if (row.original.is_locked) {
                    return (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled
                            title="Complete the previous module with 100% progress and a score of 80+ to unlock."
                        >
                            <Lock className="h-4 w-4" />
                        </Button>
                    );
                }

                return (
                    <div className="flex">
                        <Link href={route('operational.module.show', row.original.id)}>
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="transition-all duration-200 ease-in-out hover:bg-primary hover:-translate-y-1 hover:scale-105"
                            >
                                {/* <Terminal className="mr-2 h-4 w-4" /> */}
                                Detail
                            </Button>
                        </Link>
                    </div>
                );
            },
        }),
    ];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Course: {course.name}</h1>
                <p className="text-sm text-gray-500">
                    Here is a list of available modules for this course.
                </p>
            </div>
            
            <div className="my-4">
                <h2 className="text-lg font-medium mb-2">Modules</h2>
                <NextTable<Module>
                    enableSelect={false}
                    load={loadModules}
                    id={'id'}
                    columns={moduleColumns}
                    mode="table"
                />
            </div>
        </div>
    );
}

ModuleIndex.layout = (page: React.ReactNode) => <AppLayout children={page} />;