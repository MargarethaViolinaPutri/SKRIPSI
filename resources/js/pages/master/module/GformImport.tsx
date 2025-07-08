import AppLayout from '@/layouts/app-layout';
import { Module } from '@/types/module';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GformImportForm from './GformImportForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Answer } from '@/types/answer';

interface Props {
    module: Module;
    gformAnswers: (Answer & { user: { name: string }, question: { name: string } })[];
}

export default function GformImport({ module, gformAnswers }: Props) {
    return (
        <AppLayout>
            <div className="mb-6">
                <Link href={route('master.module.index')}>
                    <Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" />Back to Module List</Button>
                </Link>
            </div>
            <h1 className="text-3xl font-bold mb-2">G-Form Data Management</h1>
            <p className="text-lg text-gray-500 mb-8">For Module: <span className="font-semibold">{module.name}</span></p>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                    <GformImportForm module={module} />
                </div>

                <div className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Imported Answers ({gformAnswers.length})</h2>
                    </div>
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Question</TableHead>
                                    <TableHead className="text-right">Score</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {gformAnswers.length > 0 ? (
                                    gformAnswers.map((answer) => (
                                        <TableRow key={answer.id}>
                                            <TableCell className="font-medium">{answer.user?.name || 'N/A'}</TableCell>
                                            <TableCell>{answer.question?.name || 'N/A'}</TableCell>
                                            <TableCell className="text-right font-semibold">{Number(answer.total_score).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
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