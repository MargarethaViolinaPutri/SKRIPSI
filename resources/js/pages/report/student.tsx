import AppLayout from '@/layouts/app-layout';
import { Course } from '@/types/course';
import { Question } from '@/types/question';
import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Download, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

interface ReportRow {
    student_name: string;
    question_name: string;
    question_description: string;
    reference_code: string;
    student_code: string;
    score: number | null;
    structure_score: number | null;
    output_score: number | null;
    total_attempts: number;
    time_spent_seconds: number | null;
}

interface Props {
    reportData: ReportRow[];
    courses: Course[];
    questions: Question[];
    filters: {
        course_id: string | null;
        question_id: string | null;
        name: string | null;
    };
}

export default function StudentReport({ reportData, courses, questions, filters }: Props) {
    const [selectedCourse, setSelectedCourse] = useState(filters.course_id || '');
    const [selectedQuestion, setSelectedQuestion] = useState(filters.question_id || 'all');
    const [searchTerm, setSearchTerm] = useState(filters.name || '');

    useEffect(() => {
        if (!selectedCourse) return;

        const handler = setTimeout(() => {
            const queryData: any = { course_id: selectedCourse };
            if (searchTerm) queryData.name = searchTerm;
            if (selectedQuestion && selectedQuestion !== 'all') queryData.question_id = selectedQuestion;

            router.get(route('reports.student'), queryData, {
                preserveState: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, selectedCourse, selectedQuestion]);

    return (
        <AppLayout>
            <h1 className="text-2xl font-bold mb-4">Student Submission Report</h1>

            {/* Area Filter */}
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    <div>
                        <Label>Course</Label>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="Select a course..." />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(course => (
                                    <SelectItem key={course.id} value={String(course.id)}>
                                        {course.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Question</Label>
                        <Select value={selectedQuestion} onValueChange={setSelectedQuestion} disabled={!selectedCourse}>
                            <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="All Questions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Questions</SelectItem>
                                {questions.map(question => (
                                    <SelectItem key={question.id} value={String(question.id)}>
                                        {question.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Student Name</Label>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 w-[220px]"
                                disabled={!selectedCourse}
                            />
                        </div>
                    </div>
                </div>
                <a href={route('reports.student.export', { course_id: selectedCourse, question_id: selectedQuestion, name: searchTerm })}>
                    <Button variant="outline" disabled={!selectedCourse}>
                        <Download className="mr-2 h-4 w-4"/>
                        Export
                    </Button>
                </a>
            </div>

            {/* Tabel Hasil Laporan */}
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Question</TableHead>
                            <TableHead>Student Code</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                            <TableHead className="text-right">Attempts</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.length > 0 ? reportData.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{row.student_name}</TableCell>
                                <TableCell>{row.question_name}</TableCell>
                                <TableCell>
                                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded-md max-w-sm truncate">
                                        {row.student_code}
                                    </pre>
                                </TableCell>
                                <TableCell className="text-right font-semibold">{Number(row.score).toFixed(2)}</TableCell>
                                <TableCell className="text-right">{row.total_attempts}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    {selectedCourse ? 'No data found for the selected filters.' : 'Please select a course to view the report.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
