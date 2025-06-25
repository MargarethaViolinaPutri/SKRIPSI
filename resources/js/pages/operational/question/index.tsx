import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Base } from '@/types/base';
import { Module } from '@/types/module';
import { Question } from '@/types/question';
import { Link } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { Eye, Book, Terminal  } from 'lucide-react';

interface Props {
    module: Module;
}

export default function QuestionIndex({ module }: Props) {
    const loadQuestions = async (params: Record<string, unknown>) => {
        const queryParams = {
            ...params,
            'filter[module_id]': module.id,
        };
        
        const response = await axios.get<Base<Question[]>>(route('operational.question.fetch', queryParams));
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

    const formatDuration = (totalSeconds: number): string => {
        if (totalSeconds < 0) return '00:00';
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const paddedHours = String(hours).padStart(2, '0');
        const paddedMinutes = String(minutes).padStart(2, '0');
        const paddedSeconds = String(seconds).padStart(2, '0');
        
        if (hours > 0) {
            return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
        }
        return `${paddedMinutes}:${paddedSeconds}`;
    };

    const helper = createColumnHelper<Question>();

    const questionColumns: ColumnDef<Question, any>[] = [
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
        helper.accessor('desc', {
            id: 'desc',
            header: 'Description',
            enableColumnFilter: true,
            cell: ({ row }) => {
                const description = row.original.desc || '';

                if (description.length > 60) {
                    return `${description.substring(0, 60)}...`;
                }

                return description;
            },
        }),
        helper.accessor('score', {
            id: 'score',
            header: 'Score',
            enableColumnFilter: true,
            cell: ({ row }) => {
                const score = row.original.user_answer?.total_score;
                
                return score ?? <span className="text-xs font-semibold text-gray-500">Not Attempted</span>;
            },
        }),
        helper.accessor('achievement', {
            id: 'achievement',
            header: 'Achievement',
            enableColumnFilter: false,
            cell: ({ row }) => {
                const answer = row.original.user_answer;
                
                return getBadgeForScore(answer?.total_score);
            },
        }),
        helper.accessor('time_spent', {
            id: 'time_spent',
            header: 'Time Spent (Latest)',
            cell: ({ row }) => {
                const seconds = row.original.user_answer?.time_spent_in_seconds;
                if (seconds === undefined) return <span className="text-gray-400">-</span>;
                return formatDuration(seconds);
            },
        }),
        helper.accessor('attempts', {
            id: 'attempts',
            header: 'Attempts',
            cell: ({ row }) => {
                const attempts = row.original.user_answers_count ?? 0;
                return (
                    <div className="text-center font-medium">
                        {attempts}
                    </div>
                );
            },
        }),
        helper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <div className="flex">
                        <Link href={route('operational.question.solve', { id: row.original.id })}>
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="transition-all duration-200 ease-in-out hover:bg-primary hover:text-white hover:-translate-y-1 hover:scale-105"
                            >
                                {/* <Terminal className="mr-2 h-4 w-4" /> */}
                                Solve Question
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
                <p className="text-sm text-gray-500">Course: {module.course?.name}</p>
                <h1 className="text-2xl font-bold">Module: {module.name}</h1>
                <p className="text-sm text-gray-500">
                    Here is a list of available questions for this module.
                </p>
            </div>
            
            <div className="my-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">Questions</h2>

                    <Link href={route('operational.module.material', { id: module.id })}>
                        <Button variant="outline">
                            <Book className="mr-2 h-4 w-4" />
                            View Material
                        </Button>
                    </Link>
                </div>
                <NextTable<Question>
                    enableSelect={false}
                    load={loadQuestions}
                    id={'id'}
                    columns={questionColumns}
                    mode="table"
                />
            </div>
        </div>
    );
}

QuestionIndex.layout = (page: React.ReactNode) => <AppLayout children={page} />;