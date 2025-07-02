import { Test } from '@/types/test';
import { Link } from '@inertiajs/react';
import { ArrowRight, Clock, FileText, CheckCircle, RotateCcw, Lock, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getBadgeForScore = (score: number | null | undefined) => {
    if (score === null || score === undefined) return null;
    let badgeImage = '';
    if (score >= 80) { badgeImage = '/images/BADGES GOLD.png'; }
    else if (score >= 40) { badgeImage = '/images/BADGES SILVER.png'; }
    else { badgeImage = '/images/BADGES BRONZE.png'; }
    return <img src={badgeImage} alt="Badge" className="h-10 w-10 object-contain" />;
};

const formatDuration = (totalSeconds: number): string => {
    if (!totalSeconds || totalSeconds < 0) return '00:00';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');
    
    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${paddedMinutes}:${paddedSeconds}`;
    }
    return `${paddedMinutes}:${paddedSeconds}`;
};

interface Props {
    test: Test;
}

export default function TestCard({ test }: Props) {
    const completedAttempt = test.user_latest_completed_attempt;

    if (test.is_locked_by_sequence || test.is_locked_by_modules) {
        
        let lockedReason = 'Locked.';
        if (test.is_locked_by_modules) {
            lockedReason = 'Complete all modules to unlock.';
        } else if (test.is_locked_by_sequence) {
            lockedReason = 'Complete the previous test first.';
        }

        return (
            <div className="border rounded-lg p-4 flex justify-between items-center bg-gray-100 dark:bg-gray-800/50 opacity-70">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg">
                        <Lock className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-500">{test.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{lockedReason}</p>
                    </div>
                </div>
                <div className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>Locked</span>
                </div>
            </div>
        );
    }
    
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
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="text-right">
                        <span className="text-xs text-gray-500">DURATION</span>
                        <p className="font-bold text-lg whitespace-nowrap">
                            {formatDuration(completedAttempt.time_spent_in_seconds || 0)}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-gray-500">SCORE</span>
                        <p className="font-bold text-2xl">{completedAttempt.total_score.toFixed(2)}</p>
                    </div>
                    <div className="w-10 h-10">
                        {getBadgeForScore(completedAttempt.total_score)}
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