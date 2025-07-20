import AppLayout from '@/layouts/app-layout';
import { Course } from '@/types/course';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Download, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

interface ReportRow {
    student_name: string;
    class_group: 'control' | 'experiment' | null;
    pretest_score: string | number | null;
    posttest_score: string | number | null;
    delaytest_score: string | number | null;
}

interface Props {
    reportData: ReportRow[];
    courses: Course[];
    filters: { 
        course_id: string | null;
        name: string | null;
        class_group: string | null;
     };
}

export default function TestReport({ reportData, courses, filters }: Props) {
    const [selectedCourse, setSelectedCourse] = useState(filters.course_id || 'all');
    const [searchTerm, setSearchTerm] = useState(filters.name || '');
    const [selectedGroup, setSelectedGroup] = useState(filters.class_group || 'all');

    useEffect(() => {
        const handler = setTimeout(() => {
            const queryData: any = {};
            if (selectedCourse && selectedCourse !== 'all') queryData.course_id = selectedCourse;
            if (searchTerm) queryData.name = searchTerm;
            if (selectedGroup && selectedGroup !== 'all') queryData.class_group = selectedGroup;

            router.get(route('reports.test'), queryData, {
                preserveState: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, selectedCourse, selectedGroup]);

    const handleCourseFilterChange = (courseId: string) => {
        setSelectedCourse(courseId);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };
    
    return (
        <AppLayout>
            <h1 className="text-2xl font-bold mb-4">Test Scores Report</h1>

            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
                <div className="flex items-center gap-4">
                    <div>
                        <Label htmlFor="course-filter">Filter by Course</Label>
                        <Select value={selectedCourse} onValueChange={handleCourseFilterChange}>
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="All Courses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {courses.map(course => (
                                    <SelectItem key={course.id} value={String(course.id)}>
                                        {course.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Class Group</Label>
                        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Groups" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Groups</SelectItem>
                                <SelectItem value="control">Control</SelectItem>
                                <SelectItem value="experiment">Experiment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="name-filter">Search by Student Name</Label>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="name-filter"
                                type="text"
                                placeholder="Search name..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="pl-8 w-[250px]"
                            />
                        </div>
                    </div>
                </div>
                <a href={route('reports.test.export', { course_id: selectedCourse, name: searchTerm, class_group: selectedGroup })}>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4"/>
                        Export to Excel
                    </Button>
                </a>
            </div>

            {/* Tabel Hasil Laporan */}
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Class Group</TableHead>
                            <TableHead className="text-right">Pre-Test Score</TableHead>
                            <TableHead className="text-right">Post-Test Score</TableHead>
                            <TableHead className="text-right">Delay-Test Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.length > 0 ? reportData.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{row.student_name}</TableCell>
                                <TableCell className="capitalize">{row.class_group ?? '-'}</TableCell>
                                <TableCell className="text-right">{row.pretest_score ? Number(row.pretest_score).toFixed(2) : '-'}</TableCell>
                                <TableCell className="text-right">{row.posttest_score ? Number(row.posttest_score).toFixed(2) : '-'}</TableCell>
                                <TableCell className="text-right">{row.delaytest_score ? Number(row.delaytest_score).toFixed(2) : '-'}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">No data found for the selected filter.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}