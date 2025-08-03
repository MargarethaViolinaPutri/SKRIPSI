import AnswerPreview from '@/components/AnswerPreview';
import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Answer } from '@/types/answer';
import { Base } from '@/types/base';
import { Module } from '@/types/module';
import { Question } from '@/types/question';
import { Link } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { Eye, Book, Terminal, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
    module: Module;
}

export default function QuestionIndex({ module }: Props) {
    const [previewData, setPreviewData] = useState<{ question: Question; answer: Answer } | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const handlePreviewClick = async (answerId: number) => {
        setIsPreviewLoading(true);
        setPreviewData({} as any); 

        try {
            const response = await axios.get(route('operational.question.answers.preview', { answer: answerId }));
            const answerData = response.data;
            const questionData = response.data.question;

            let finalResults = answerData.blank_results;

            if (!finalResults || finalResults.length === 0) {
                const studentBlanks = extractBlankAnswers(questionData.code, answerData.student_code);
                const correctBlanks = extractBlankAnswers(questionData.code, questionData.test);
                
                finalResults = studentBlanks.map((studentAnswer, index) => {
                    return studentAnswer === correctBlanks[index];
                });
            }

            setPreviewData({
                question: questionData,
                answer: { ...answerData, blank_results: finalResults },
            });
        } catch (error) {
            console.error("Failed to fetch preview data:", error);
            setPreviewData(null);
            alert('Could not load preview data.');
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const extractBlankAnswers = (codeTemplate: string, fullCode: string): string[] => {
        if (!codeTemplate || !fullCode) return [];
        try {
            const pattern = new RegExp(
                codeTemplate.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/____/g, '(.*?)'), 's'
            );
            const matches = fullCode.match(pattern);
            if (matches) {
                return matches.slice(1).map(match => match.trim());
            }
            const blankCount = (codeTemplate.match(/____/g) || []).length;
            return Array(blankCount).fill('');
        } catch (e) {
            return [];
        }
    };

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
                const latestAnswer = row.original.user_answer;
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

                        {latestAnswer && (
                            <Button 
                                variant="outline"
                                size="sm"
                                className="transition-all duration-200 ease-in-out hover:bg-primary hover:text-white hover:-translate-y-1 hover:scale-105"
                                onClick={() => handlePreviewClick(latestAnswer.id)}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                            </Button>
                        )}
                    </div>
                );
            },
        }),
    ];

    return (
        <div>
            <Dialog open={previewData !== null} onOpenChange={() => setPreviewData(null)}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Answer Preview: {previewData?.question?.name || 'Loading...'}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 min-h-[200px] flex flex-col items-center justify-center">
                        {isPreviewLoading ? (
                            <div className="text-center">
                                <Loader2 className="mx-auto h-12 w-12 animate-spin text-gray-500" />
                                <p className="mt-2 text-gray-500">Loading Preview...</p>
                            </div>
                        ) : (
                            <div className="w-full">
                                {previewData?.question?.code ? (
                                    <AnswerPreview
                                        codeTemplate={previewData.question.code}
                                        studentAnswers={extractBlankAnswers(previewData.question.code, previewData.answer?.student_code || '')}
                                        results={previewData.answer?.blank_results || []}
                                    />
                                ) : (
                                    <div className="text-center p-8 border-2 border-dashed border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                                        <h3 className="mt-4 text-lg font-semibold text-yellow-800 dark:text-yellow-200">Preview Unavailable</h3>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                                            The question template is missing for this question.
                                        </p>
                                    </div>
                                )}

                                {previewData?.answer && (
                                    <div className="mt-6 pt-4 border-t w-full">
                                        <h4 className="font-semibold mb-2 text-lg">Execution Output</h4>
                                        <pre className="bg-black text-white p-4 rounded-md text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                                            {previewData.answer.execution_output || 'No output was captured during execution.'}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setPreviewData(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Link href={route('operational.lms.index')} className="hover:underline">Courses</Link>
                <ChevronRight className="h-4 w-4" />
                    <Link href={route('operational.lms.show', { id: module.course_id })} className="hover:underline">
                        {module.course?.name}
                    </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="font-semibold text-gray-800 dark:text-gray-200">{module.name}</span>
            </div>

            <div className="mb-6">
                {/* <p className="text-sm text-gray-500">Course: {module.course?.name}</p> */}
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