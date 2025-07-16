import AppLayout from '@/layouts/app-layout';
import { Course } from '@/types/course';
import { Question } from '@/types/question';
import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Download, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Module } from '@/types/module';

interface ReportRow {
    student_name: string;
    question_name: string;
    question_description: string;
    reference_code: string;
    student_code: string;
    score: number | null;
    structure_score: number | null;
    output_score: number | null;
    time_spent_seconds: number | null;
}

interface Props {
    reportData: ReportRow[];
    courses: Course[];
    modules: Module[];
    students: User[];
    filters: {
        course_id: string | null;
        module_id: string | null;
        user_id: string | null;
    };
}

const formatDuration = (totalSeconds: number | null | undefined): string => {
    if (!totalSeconds || totalSeconds < 0) {
        return '00:00';
    }
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

export default function StudentReport({ reportData, courses, modules, students, filters }: Props) {
    const [selectedCourse, setSelectedCourse] = useState(filters.course_id || '');
    const [selectedModule, setSelectedModule] = useState(filters.module_id || 'all');
    const [selectedStudent, setSelectedStudent] = useState(filters.user_id || 'all');
    const [openStudentCombobox, setOpenStudentCombobox] = useState(false);
    useEffect(() => {
        if (selectedCourse) {
            const queryData: any = { course_id: selectedCourse };
            if (selectedModule && selectedModule !== 'all') queryData.module_id = selectedModule;
            if (selectedStudent && selectedStudent !== 'all') queryData.user_id = selectedStudent;
            
            router.get(route('reports.student'), queryData, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }
    }, [selectedCourse, selectedModule, selectedStudent]);

    const handleCourseChange = (courseId: string) => {
        setSelectedCourse(courseId);
        setSelectedModule('all');
        setSelectedStudent('all');
    };

    return (
        <AppLayout>
            <h1 className="text-2xl font-bold mb-4">Student Submission Report</h1>

            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    <div>
                        <Label>Course</Label>
                        <Select value={selectedCourse} onValueChange={handleCourseChange}>
                            <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select a course..." /></SelectTrigger>
                            <SelectContent>
                                {courses.map(course => <SelectItem key={course.id} value={String(course.id)}>{course.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <Label>Module</Label>
                        <Select value={selectedModule} onValueChange={setSelectedModule} disabled={!selectedCourse}>
                            <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Modules" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Modules</SelectItem>
                                {modules.map(module => <SelectItem key={module.id} value={String(module.id)}>{module.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Student</Label>
                        <Popover open={openStudentCombobox} onOpenChange={setOpenStudentCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openStudentCombobox}
                                    className="w-[250px] justify-between"
                                    disabled={!selectedCourse}
                                >
                                    {selectedStudent
                                        ? students.find((s) => String(s.id) === selectedStudent)?.name
                                        : "Select a student..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[250px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search student..." />
                                    <CommandEmpty>No student found.</CommandEmpty>
                                    <CommandGroup>
                                        {students.map((student) => (
                                            <CommandItem
                                                key={student.id}
                                                value={student.name}
                                                onSelect={() => {
                                                    setSelectedStudent(String(student.id));
                                                    setOpenStudentCombobox(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedStudent === String(student.id) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {student.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <a href={route('reports.student.export', { course_id: selectedCourse, user_id: selectedStudent, module_id: selectedModule })}>
                    <Button variant="outline" disabled={!selectedCourse}>
                        <Download className="mr-2 h-4 w-4"/>Export
                    </Button>
                </a>
            </div>

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Question</TableHead>
                            <TableHead>Time Spent</TableHead>
                            <TableHead className="text-right">Structure Score</TableHead>
                            <TableHead className="text-right">Output Score</TableHead>
                            <TableHead className="text-right">Total Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.length > 0 ? reportData.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{row.question_name}</TableCell>
                                <TableCell>{formatDuration(row.time_spent_seconds)}</TableCell>
                                <TableCell className="text-right">{Number(row.structure_score).toFixed(2)}</TableCell>
                                <TableCell className="text-right">{Number(row.output_score).toFixed(2)}</TableCell>
                                <TableCell className="text-right font-semibold">{Number(row.score).toFixed(2)}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    {selectedCourse && selectedStudent ? 'No submission data found for this student in this course.' : 'Please select a course and a student to view the report.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
