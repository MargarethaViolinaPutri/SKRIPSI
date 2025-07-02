import AppLayout from '@/layouts/app-layout';
import { Test } from '@/types/test';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Trash, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import QuestionForm from './questionForm';
import { FormEvent, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import TestQuestionGenerator from './TestQuestionGenerator';

interface Props {
    test: Test;
}

export default function TestShow({ test }: Props) {
    const { delete: destroy, processing } = useForm();

    const [questionIdToDelete, setQuestionIdToDelete] = useState<number | null>(null);

    const onDeleteQuestionSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (questionIdToDelete) {
            destroy(route('master.test.questions.destroy', { test: test.id, question: questionIdToDelete }), {
                onSuccess: () => setQuestionIdToDelete(null),
                preserveScroll: true,
            });
        }
    };

    return (
        <div>
            <Dialog open={questionIdToDelete !== null} onOpenChange={(open) => !open && setQuestionIdToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Question</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this question? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-start">
                        <Button type="button" variant="outline" onClick={() => setQuestionIdToDelete(null)}>
                            Cancel
                        </Button>
                        <form onSubmit={onDeleteQuestionSubmit}>
                            <Button variant="destructive" type="submit" disabled={processing}>
                                {processing ? 'Deleting...' : 'Delete'}
                            </Button>
                        </form>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Link href={route('master.test.index')} className="inline-flex items-center text-sm font-semibold mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Test List
            </Link>
            <h1 className="text-2xl font-bold">{test.title}</h1>
            <p className="text-gray-500 mb-6">{test.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left column: Question list */}
                <div className="lg:col-span-3 space-y-4">
                    <h2 className="text-xl font-semibold">Existing Questions ({test.questions?.length || 0})</h2>
                    {/* ... for show available question ... */}
                </div>
                <div className="lg:col-span-2">
                    <div className="border rounded-lg p-6 bg-white dark:bg-gray-900 sticky top-4">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-3">AI Question Generator</h3>
                        <TestQuestionGenerator test={test} />
                    </div>
                </div>
            </div>
        </div>
    );
}

TestShow.layout = (page: React.ReactNode) => <AppLayout children={page} />;