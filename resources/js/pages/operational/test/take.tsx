import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { TestAttempt } from '@/types/test-attempt';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { ArrowLeft, Clock } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

interface Props {
    attempt: TestAttempt;
}

const formatTime = (totalSeconds: number): string => {
    if (totalSeconds < 0) totalSeconds = 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const getBadgeForScore = (total_score: number | null | undefined) => {
    if (total_score === null || total_score === undefined) return null;

    let badgeImage = '';
    let altText = '';
    
    if (total_score >= 80) {
            badgeImage = '/images/BADGES GOLD.png';
            altText = 'Gold Badge';
        } else if (total_score >= 40) {
            badgeImage = '/images/BADGES SILVER.png';
            altText = 'Silver Badge';
        } else {
            badgeImage = '/images/BADGES BRONZE.png';
            altText = 'Bronze Badge';
        }

    return <img src={badgeImage} alt="Badge" className="mx-auto h-20 w-20 object-contain" />;
};

export default function TestTake({ attempt }: Props) {
    const question = attempt.test.question;
    
    const parsedCode = useMemo(() => question?.code?.split(/(____)/g) || [], [question?.code]);
    const blankCount = useMemo(() => parsedCode.filter((part) => part === '____').length, [parsedCode]);
    const [answers, setAnswers] = useState<string[]>(Array(blankCount).fill(''));

    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [resultData, setResultData] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    
    const handleSubmit = async (force = false) => {
        const confirmation = force || confirm('Are you sure you want to finish this test?');
        if (!confirmation) return;

        setIsSubmitting(true);

        let answerIndex = 0;
        const studentCode = parsedCode.map((part) => (part === '____' ? (answers[answerIndex++] || '') : part)).join('');

        try {
            const response = await axios.post(route('operational.test.submit', { attempt: attempt.id }), {
                student_code: studentCode,
            });
            setResultData(response.data.data);
            setIsResultModalOpen(true);
        } catch (error) {
            console.error('Failed to submit answer:', error);
            alert('An error occurred while submitting your answer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!attempt.test.duration_in_minutes) return;
        const startTime = new Date(attempt.started_at).getTime();
        const durationMs = attempt.test.duration_in_minutes * 60 * 1000;
        const deadline = startTime + durationMs;
        const interval = setInterval(() => {
            const remaining = deadline - Date.now();
            setTimeLeft(Math.floor(remaining / 1000));
            if (remaining <= 0) {
                clearInterval(interval);
                handleSubmit(true);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [attempt]);

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    if (!question) {
        return (
            <div className="text-center p-8">
                <p>This test does not have a question associated with it.</p>
                <Link href={route('operational.lms.show', { id: attempt.test.course_id })}>
                    <Button variant="outline" className="mt-4">Back to Course</Button>
                </Link>
            </div>
        );
    }
    
    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold">{question.name}</h1>
                        <p className="text-gray-600 mt-1">{question.desc}</p>
                    </div>
                    {attempt.test.duration_in_minutes && (
                        <div className="flex items-center gap-x-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                            <Clock className="h-4 w-4" />
                            <span>Time Left:</span>
                            <span className="font-semibold tracking-wider">{formatTime(timeLeft)}</span>
                        </div>
                    )}
                </div>

                <div className="rounded-lg bg-gray-800 p-6 font-mono text-sm whitespace-pre-wrap text-white">
                    {parsedCode.map((part, index) => {
                        if (part === '____') {
                            const answerIndex = parsedCode.slice(0, index).filter((p) => p === '____').length;
                            return (
                                <input
                                    key={index} type="text"
                                    value={answers[answerIndex]}
                                    onChange={(e) => handleAnswerChange(answerIndex, e.target.value)}
                                    className="inline-block w-40 rounded border border-gray-500 bg-gray-600 px-1 py-0.5 text-yellow-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                />
                            );
                        }
                        return <span key={index}>{part}</span>;
                    })}
                </div>

                <div className="mt-6 text-right">
                    <Button onClick={() => handleSubmit()} disabled={isSubmitting} size="lg" className="bg-green-600 hover:bg-green-700">
                        {isSubmitting ? 'Submitting...' : 'Finish & Submit Test'}
                    </Button>
                </div>

                <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-center text-2xl">Test Completed!</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                {getBadgeForScore(resultData?.total_score)}
                                <p className="text-4xl font-bold">{resultData?.total_score?.toFixed(2)}</p>
                                <p className="text-sm text-gray-500">Total Score</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => router.get(route('operational.test.result', { attempt: resultData.id }))}
                                className="w-full"
                            >
                                View Detailed Review
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}