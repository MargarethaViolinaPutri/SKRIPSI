import AppLayout from '@/layouts/app-layout';
import { TestAttempt } from '@/types/test-attempt';
import { Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getBadgeForScore = (score: number | null | undefined) => {
    if (score === null || score === undefined) {
        return <div className="text-gray-500">Not Scored</div>;
    }
    let badgeImage = '';
    let altText = '';
    if (score >= 80) { badgeImage = '/images/BADGES GOLD.png'; altText = 'Gold Badge'; }
    else if (score >= 40) { badgeImage = '/images/BADGES SILVER.png'; altText = 'Silver Badge'; }
    else { badgeImage = '/images/BADGES BRONZE.png'; altText = 'Bronze Badge'; }

    return <img src={badgeImage} alt={altText} title={`${altText} (Score: ${score})`} className="h-24 w-24 object-contain mx-auto" />;
};

interface Props {
    attempt: TestAttempt;
}

export default function TestResult({ attempt }: Props) {
    const questions = attempt.test.questions || [];
    const studentAnswers = attempt.answers || [];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center border rounded-lg p-8 mb-10">
                <h1 className="text-3xl font-bold">Test Completed!</h1>
                <p className="text-gray-500 mt-1">Here is your result for: {attempt.test.title}</p>
                <div className="my-6">{getBadgeForScore(attempt.score)}</div>
                <p className="text-sm text-gray-500">YOUR SCORE</p>
                <p className="text-6xl font-bold tracking-tight">{attempt.score?.toFixed(2)}</p>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Answer Review</h2>
                {questions.map((question, index) => {
                    const studentAnswer = studentAnswers.find(a => a.test_question_id === question.id);
                    
                    return (
                        <div key={question.id} className="border rounded-lg p-4 dark:border-gray-700">
                            <div className="flex justify-between items-start gap-4">
                                <p className="font-semibold flex-grow">{index + 1}. {question.question_text}</p>
                                
                                {!studentAnswer && (
                                    <span className="flex-shrink-0 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-red-900/50 dark:text-red-300">
                                        Not Answered
                                    </span>
                                )}
                            </div>
                            
                            {question.image_url && (
                                <img src={question.image_url} alt={`Question ${question.id} image`} className="mt-4 rounded-md max-w-md border" />
                            )}
                            <div className="mt-4 space-y-2">
                                {question.options?.map(option => {
                                    const isCorrect = option.is_correct;
                                    const isChosen = studentAnswer?.test_question_option_id === option.id;

                                    let style = 'border-gray-300 dark:border-gray-600';
                                    if (isCorrect) {
                                        style = 'border-green-500 bg-green-50 dark:bg-green-900/50';
                                    }
                                    if (isChosen && !isCorrect) {
                                        style = 'border-red-500 bg-red-50 dark:bg-red-900/50';
                                    }

                                    return (
                                        <div key={option.id} className={`p-3 border rounded-md flex items-center gap-3 ${style}`}>
                                            {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />}
                                            {isChosen && !isCorrect && <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />}
                                            {!isChosen && !isCorrect && <div className="h-5 w-5 border-2 rounded-full border-gray-300 dark:border-gray-600 flex-shrink-0"></div>}
                                            <p className="text-sm">{option.option_text}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-10 text-center">
                <Link 
                    href={route('operational.lms.show', {id: attempt.test.course_id})}
                    preserveState={false}
                >
                    <Button>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Course
                    </Button>
                </Link>
            </div>
        </div>
    );
}

TestResult.layout = (page: React.ReactNode) => <AppLayout children={page} />;