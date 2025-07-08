import AppLayout from '@/layouts/app-layout';
import { Module } from '@/types/module';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

interface StudentDetail {
    id: number;
    name: string;
    total_score: number | null;
    class_group: 'control' | 'experiment' | null;
    stratum: 'high' | 'low' | null;
}

interface Props {
    module: Module;
    studentTestDetails: StudentDetail[];
}

export default function ControlGroup({ module, studentTestDetails }: Props) {
    return (
        <AppLayout>
            <div className="mb-6">
                <Link href={route('master.module.index')}>
                    <Button variant="ghost">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Module List
                    </Button>
                </Link>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold">Control Group Management</h1>
                    <p className="text-gray-500">Monitor and export student classification for Module: <span className="font-semibold">{module.name}</span></p>
                </div>
            </div>

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead className="text-center">Pre-Test Score</TableHead>
                            <TableHead className="text-center">Stratum</TableHead>
                            <TableHead className="text-center">Class Group</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {studentTestDetails.length > 0 ? (
                            studentTestDetails.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell className="text-center">
                                        {student.total_score !== null ? Number(student.total_score).toFixed(2) : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {student.stratum ? (
                                            <span className={`font-semibold ${student.stratum === 'high' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {student.stratum === 'high' ? 'High' : 'Low'}
                                            </span>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {student.class_group ? (
                                            <Badge variant={student.class_group === 'control' ? 'default' : 'secondary'} className="capitalize">
                                                {student.class_group}
                                            </Badge>
                                        ) : '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No student classification data available for this course yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}