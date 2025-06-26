import AppLayout from '@/layouts/app-layout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Question } from '@/types/question';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface Props {
    question: Question;
}

export default function SolveQuestion({ question }: Props) {
    const parsedCode = useMemo(() => question.code?.split(/(____)/g) || [], [question.code]);
    
    const blankCount = useMemo(() => parsedCode.filter(part => part === '____').length, [parsedCode]);

    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [resultData, setResultData] = useState<any | null>(null);
    const [answers, setAnswers] = useState<string[]>(Array(blankCount).fill(''));
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const storageKey = `timer_start_time_question_${question.id}`;

    useEffect(() => {
        let startTime = localStorage.getItem(storageKey);

        if (!startTime) {
            startTime = new Date().getTime().toString();
            localStorage.setItem(storageKey, startTime);
        }

        const startTimeMs = parseInt(startTime, 10);

        const timerInterval = setInterval(() => {
            const nowMs = new Date().getTime();
            const elapsed = Math.floor((nowMs - startTimeMs) / 1000);
            setElapsedSeconds(elapsed);
        }, 1000);

        return () => {
            clearInterval(timerInterval);
        };
    }, [question.id]);

    const formatTime = (totalSeconds: number): string => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
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
                className="h-20 w-20 object-contain mx-auto"
            />
        );
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        
        let answerIndex = 0;
        const studentCode = parsedCode.map(part => {
            if (part === '____') {
                return answers[answerIndex++] || '';
            }
            return part;
        }).join('');

        const storedStartTime = localStorage.getItem(storageKey);
        const formattedStartTime = storedStartTime 
            ? format(new Date(parseInt(storedStartTime, 10)), 'yyyy-MM-dd HH:mm:ss') 
            : null;

        const payload = {
            student_code: studentCode,
            start_time: formattedStartTime,
            end_time: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        };

        try {
            const response = await axios.post(route('answer.evaluate', { questionId: question.id }), payload);

            localStorage.removeItem(storageKey);

            setResultData(response.data.data);
            setIsResultModalOpen(true);

        } catch (error) {
            console.error('Failed to submit answer:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">{question.name}</h1>
            <p className="mb-6">{question.desc}</p>

            <div className="flex items-center justify-end mt-4 text-sm">
                <Clock className="h-4 w-4 mr-2" />
                <span>Time:</span>
                <span className="font-semibold ml-1">{formatTime(elapsedSeconds)}</span>
            </div>

            <div className="bg-gray-800 text-white p-6 rounded-lg font-mono text-sm whitespace-pre-wrap">
                {parsedCode.map((part, index) => {
                    if (part === '____') {
                        const answerIndex = parsedCode.slice(0, index).filter(p => p === '____').length;
                        return (
                            <input
                                key={index}
                                type="text"
                                value={answers[answerIndex]}
                                onChange={(e) => handleAnswerChange(answerIndex, e.target.value)}
                                className="bg-gray-600 border border-gray-500 rounded px-1 py-0.5 text-yellow-300 inline-block w-40 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        );
                    } else {
                        return <span key={index}>{part}</span>;
                    }
                })}
            </div>

            <div className="mt-6 text-right">
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                </Button>
            </div>

            <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl">Submission Result</DialogTitle>
                        <DialogDescription className="text-center">
                            You've completed the question. Here is your result.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            {getBadgeForScore(resultData?.total_score)}
                            <p className="text-4xl font-bold">
                                {resultData?.total_score.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">Total Score</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            onClick={() => {
                                setIsResultModalOpen(false);
                                router.get(route('operational.module.show', { id: question.module_id }), {}, { preserveState: false });
                            }}
                            className="w-full"
                        >
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

SolveQuestion.layout = (page: React.ReactNode) => <AppLayout children={page} />;