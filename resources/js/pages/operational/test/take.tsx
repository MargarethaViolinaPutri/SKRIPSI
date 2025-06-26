import AppLayout from '@/layouts/app-layout';
import { TestAttempt } from '@/types/test-attempt';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Send, Clock } from 'lucide-react';

const formatTime = (totalSeconds: number): string => {
    if (totalSeconds < 0) totalSeconds = 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

interface Props {
    attempt: TestAttempt;
}

export default function TestTake({ attempt }: Props) {
    const questions = attempt.test.questions || [];
    const { data, setData, post, processing } = useForm({
        answers: {} as Record<number, number>,
    });

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

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

    const handleSelectOption = (questionId: number, optionId: number) => {
        setData('answers', { ...data.answers, [questionId]: optionId });
    };

    const handleSubmit = (force = false) => {
        const confirmation = force || confirm('Are you sure you want to finish this test?');
        if (confirmation) {
            post(route('operational.test.submit', { attempt: attempt.id }));
        }
    };

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
                <div className="border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-bold">{attempt.test.title}</h1>
                        {attempt.test.duration_in_minutes && (
                           <div className="text-red-500 font-bold text-lg bg-red-100 dark:bg-red-900/50 px-3 py-1 rounded-md flex items-center gap-2">
                                <Clock className="h-5 w-5"/>
                                <span>{formatTime(timeLeft)}</span>
                            </div>
                        )}
                    </div>

                    <div className="my-6">
                        <p className="font-semibold text-gray-600 dark:text-gray-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
                        <h2 className="text-2xl mt-1">{currentQuestion?.question_text}</h2>
                        {currentQuestion?.image_url && (
                            <img src={currentQuestion.image_url} alt="Question Image" className="mt-4 rounded-md max-w-lg border" />
                        )}
                    </div>

                    <div className="space-y-3">
                        {currentQuestion?.options?.map(option => {
                            const isSelected = data.answers[currentQuestion.id] === option.id;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                                    className={`w-full text-left p-4 border rounded-lg flex items-center gap-4 transition-all dark:border-gray-700 ${
                                        isSelected ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 ring-2 ring-blue-300' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {isSelected && <Check className="h-4 w-4 text-white" />}
                                    </div>
                                    <span>{option.option_text}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <Button variant="outline" onClick={() => setCurrentQuestionIndex(i => i - 1)} disabled={currentQuestionIndex === 0}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                    </Button>
                    
                    {isLastQuestion ? (
                        <Button onClick={() => handleSubmit()} disabled={processing} className="bg-green-600 hover:bg-green-700">
                            Finish Test <Send className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={() => setCurrentQuestionIndex(i => i + 1)} disabled={isLastQuestion}>
                            Next <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="lg:col-span-1">
                <div className="border rounded-lg p-4 sticky top-4">
                    <h3 className="font-bold mb-4">Question Navigator</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {questions.map((question, index) => {
                            const isAnswered = data.answers[question.id] !== undefined;
                            const isCurrent = index === currentQuestionIndex;
                            
                            let style = 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600';
                            if (isAnswered) {
                                style = 'bg-blue-200 hover:bg-blue-300 dark:bg-blue-800 dark:hover:bg-blue-700 font-bold';
                            }
                            if (isCurrent) {
                                style = 'bg-blue-600 text-white ring-2 ring-offset-2 ring-blue-500';
                            }

                            return (
                                <button
                                    key={question.id}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    className={`w-10 h-10 rounded-md flex items-center justify-center font-semibold transition-all ${style}`}
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>
                    <Button 
                        onClick={() => handleSubmit()} 
                        disabled={processing}
                        className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
                    >
                        {processing ? 'Submitting...' : 'Finish & Submit'}
                        <Send className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
    
TestTake.layout = (page: React.ReactNode) => <AppLayout children={page} />;