import { Test } from '@/types/test';
import { Link } from '@inertiajs/react';
import { ArrowRight, Clock, FileText, CheckCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getBadgeForScore = (score: number | null | undefined) => {
    if (score === null || score === undefined) return null;
    let badgeImage = '';
    if (score >= 80) { badgeImage = '/images/BADGES GOLD.png'; }
    else if (score >= 40) { badgeImage = '/images/BADGES SILVER.png'; }
    else { badgeImage = '/images/BADGES BRONZE.png'; }
    return <img src={badgeImage} alt="Badge" className="h-10 w-10 object-contain" />;
};

interface Props {
    test: Test;
}

export default function TestCard({ test }: Props) {
    const completedAttempt = test.user_latest_completed_attempt;

    return (
        <div className={`border rounded-lg p-4 flex justify-between items-center transition-all ${completedAttempt ? 'bg-green-50 dark:bg-green-900/20' : 'hover:shadow-md'}`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${completedAttempt ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
                    {completedAttempt ? (
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
                    ) : (
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-lg">{test.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="capitalize bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">{test.type}</span>
                        {test.duration_in_minutes && (
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{test.duration_in_minutes} minutes</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {completedAttempt ? (
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-xs text-gray-500">SCORE</span>
                        <p className="font-bold text-2xl">{completedAttempt.score?.toFixed(2)}</p>
                    </div>
                    <div className="w-10 h-10">
                        {getBadgeForScore(completedAttempt.score)}
                    </div>
                    <Link href={route('operational.test.result', { attempt: completedAttempt.id })}>
                        <Button variant="outline">
                            <RotateCcw className="h-4 w-4 mr-2" /> Review
                        </Button>
                    </Link>
                </div>
            ) : (
                <Link href={route('operational.test.start', { test: test.id })}>
                    <Button>
                        Start Test <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </Link>
            )}
        </div>
    );
}