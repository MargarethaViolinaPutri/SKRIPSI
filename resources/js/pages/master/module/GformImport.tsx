import AppLayout from '@/layouts/app-layout';
import { Module } from '@/types/module';
import { Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Download, Edit, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GformImportForm from './GformImportForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Answer } from '@/types/answer';
import { Paginated } from '@/types/base';
import { FormEvent, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    module: Module;
    gformAnswers: Paginated<Answer & { user: { name: string }, question: { name: string } }>;
    filters: { sort_by: string, order: string };
}

export default function GformImport({ module, gformAnswers, filters }: Props) {
    const [answerToScore, setAnswerToScore] = useState<Answer | null>(null);
    const [sortBy, setSortBy] = useState(filters.sort_by || 'question.name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(filters.order === 'desc' ? 'desc' : 'asc');
    
    const { data, setData, put, processing, errors, reset } = useForm({
        total_score: 0,
    });

    useEffect(() => {
        router.get(route('master.module.gform.show', { module: module.id }), { 
            sort_by: sortBy,
            order: sortOrder 
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [sortBy, sortOrder]);

    const handleSortOrderToggle = () => {
        setSortOrder(currentOrder => (currentOrder === 'asc' ? 'desc' : 'asc'));
    };

    const handleOpenScoreModal = (answer: Answer) => {
        setData('total_score', Number(answer.total_score) || 0);
        setAnswerToScore(answer);
    };

    const onScoreSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!answerToScore) return;
        put(route('master.module.gform.update-score', { answer: answerToScore.id }), {
            onSuccess: () => setAnswerToScore(null),
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Dialog open={answerToScore !== null} onOpenChange={(open) => !open && setAnswerToScore(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Input Score for {answerToScore?.user?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onScoreSubmit} className="space-y-4 py-4">
                        <div>
                            <Label>Student's Answer</Label>
                            <p className="text-sm p-3 bg-gray-100 text-black rounded-md whitespace-pre-wrap">{answerToScore?.student_code}</p>
                        </div>
                        <div>
                            <Label htmlFor="total_score">Score (0-100)</Label>
                            <Input
                                id="total_score"
                                type="number"
                                value={data.total_score}
                                onChange={e => setData('total_score', Number(e.target.value))}
                                min="0" max="100"
                            />
                            {errors.total_score && <p className="text-xs text-red-500 mt-1">{errors.total_score}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAnswerToScore(null)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save Score'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="mb-6">
                <Link href={route('master.module.index')}>
                    <Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" />Back to Module List</Button>
                </Link>
            </div>
            <h1 className="text-3xl font-bold mb-2">G-Form Data Management</h1>
            <p className="text-lg text-gray-500 mb-8">For Module: <span className="font-semibold">{module.name}</span></p>

            <div className="space-y-12">
                <div>
                    <GformImportForm module={module} />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Imported Answers ({gformAnswers?.meta?.total || 0})</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <Label>Sort by:</Label>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sort by..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="question.name">Question Name</SelectItem>
                                        <SelectItem value="user.name">Student Name</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="icon" onClick={handleSortOrderToggle}>
                                    {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Question</TableHead>
                                    <TableHead>Answer</TableHead>
                                    <TableHead className="text-right">Time Spent</TableHead>
                                    <TableHead className="text-right">Score</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {gformAnswers?.data?.length > 0 ? (
                                    gformAnswers.data.map((answer) => (
                                        <TableRow key={answer.id}>
                                            <TableCell className="font-medium">{answer.user?.name || 'N/A'}</TableCell>
                                            <TableCell>{answer.question?.name || 'N/A'}</TableCell>
                                            <TableCell><p className="truncate w-64">{answer.student_code}</p></TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1 text-gray-600 dark:text-gray-400">
                                                    <Clock className="h-4 w-4" />
                                                    {formatDuration(answer.time_spent_in_seconds || 0)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {answer.total_score !== null ? Number(answer.total_score).toFixed(2) : <span className="text-gray-400">Not Graded</span>}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="secondary" size="sm" onClick={() => handleOpenScoreModal(answer)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No G-Form data has been imported for this module yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}