import AppLayout from '@/layouts/app-layout';
import { Test } from '@/types/test';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import QuestionForm from './questionForm';

interface Props {
    test: Test;
}

export default function TestShow({ test }: Props) {
    const { delete: destroy } = useForm();

    const handleDeleteQuestion = (questionId: number) => {
        if (confirm('Are you sure you want to delete this question?')) {
            destroy(route('master.test.questions.destroy', { test: test.id, question: questionId }));
        }
    };

    return (
        <div>
            <Link href={route('master.test.index')} className="inline-flex items-center text-sm font-semibold mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Test List
            </Link>
            <h1 className="text-2xl font-bold">{test.title}</h1>
            <p className="text-gray-500 mb-6">{test.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Kolom Kiri: Daftar Pertanyaan */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold">Questions ({test.questions?.length || 0})</h2>
                    {test.questions && test.questions.length > 0 ? (
                        test.questions.map((question, index) => (
                            <div key={question.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold">{index + 1}. {question.question_text}</p>
                                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteQuestion(question.id)}>Delete</Button>
                                </div>
                                <ul className="mt-2 space-y-1 pl-4">
                                    {question.options?.map(option => (
                                        <li key={option.id} className={`flex items-center text-sm ${option.is_correct ? 'font-bold text-green-700' : ''}`}>
                                            {option.is_correct 
                                                ? <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> 
                                                : <XCircle className="h-4 w-4 mr-2 text-gray-400" />}
                                            {option.option_text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <p>No questions added yet.</p>
                    )}
                </div>
                <div className="md:col-span-1">
                    <QuestionForm testId={test.id} />
                </div>
            </div>
        </div>
    );
}

TestShow.layout = (page: React.ReactNode) => <AppLayout children={page} />;