import AppLayout from '@/layouts/app-layout';
import { TestAttempt } from '@/types/test-attempt';
import { Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Code, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Editor from '@monaco-editor/react';

const getBadgeForScore = (score: number | null | undefined) => {
    if (score === null || score === undefined) return null;
    let badgeImage = '';
    if (score >= 80) { badgeImage = '/images/BADGES GOLD.png'; }
    else if (score >= 40) { badgeImage = '/images/BADGES SILVER.png'; }
    else { badgeImage = '/images/BADGES BRONZE.png'; }
    return <img src={badgeImage} alt="Badge" className="h-24 w-24 object-contain mx-auto" />;
};

interface Props {
    attempt: TestAttempt;
}

export default function TestReview({ attempt }: Props) {
    const question = attempt.test.question;

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Link href={route('operational.lms.show', { id: attempt.test.course_id })}>
                        <Button variant="ghost" className="flex items-center text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Course
                        </Button>
                    </Link>
                </div>

                <div className="text-center border rounded-lg p-8 mb-10">
                    <h1 className="text-3xl font-bold">Test Review</h1>
                    <p className="text-gray-500 mt-1">{attempt.test.title}</p>
                    <div className="my-6">{getBadgeForScore(attempt.total_score)}</div>
                    <p className="text-sm text-gray-500">YOUR FINAL SCORE</p>
                    <p className="text-6xl font-bold tracking-tight">{attempt.total_score?.toFixed(2)}</p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Code Review</h2>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">{question?.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{question?.desc}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center font-semibold mb-2">
                            <User className="h-5 w-5 mr-2 text-blue-500" />
                            Your Submitted Code
                        </div>
                        <Editor
                            height="400px"
                            defaultLanguage="python"
                            value={attempt.student_code}
                            theme="vs-dark"
                            options={{ readOnly: true, minimap: { enabled: false } }}
                            className="border rounded-md"
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}