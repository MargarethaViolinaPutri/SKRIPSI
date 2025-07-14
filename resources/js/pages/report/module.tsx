import AppLayout from '@/layouts/app-layout';
import { Course } from '@/types/course';
import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Download, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

// Tipe data untuk baris laporan modul
interface ReportRow {
    student_name: string;
    class_group: 'control' | 'experiment' | null;
    average_score: number | null;
    total_attempts: number;
    total_time_spent_seconds: number | null;
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

// Fungsi helper untuk format durasi
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

export default function ModuleReport({ reportData, courses, filters }: Props) {
    const [selectedCourse, setSelectedCourse] = useState(filters.course_id || '');
    const [searchTerm, setSearchTerm] = useState(filters.name || '');
    const [selectedGroup, setSelectedGroup] = useState(filters.class_group || 'all');

    useEffect(() => {
        if (!selectedCourse) return;

        const handler = setTimeout(() => {
            const queryData: any = { course_id: selectedCourse };
            if (searchTerm) queryData.name = searchTerm;
            if (selectedGroup && selectedGroup !== 'all') queryData.class_group = selectedGroup;

            router.get(route('reports.module'), queryData, {
                preserveState: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, selectedCourse, selectedGroup]);

    return (
        <AppLayout>
            <h1 className="text-2xl font-bold mb-4">Module Performance Report</h1>

            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
                <div className="flex items-center gap-4">
                    <div>
                        <Label htmlFor="course-filter">Select a Course to View Report</Label>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="w-[250px]">
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
                        <Label>Class Group</Label>
                        <Select value={selectedGroup} onValueChange={setSelectedGroup} disabled={!selectedCourse}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Groups" />
                            </SelectTrigger>
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
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 w-[250px]"
                                disabled={!selectedCourse} // Nonaktifkan jika belum pilih course
                            />
                        </div>
                    </div>
                </div>
                <a href={route('reports.module.export', { course_id: selectedCourse, name: searchTerm })}>
                    <Button variant="outline" disabled={!selectedCourse || selectedCourse === 'all'}>
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
                            <TableHead className="text-right">Average Score</TableHead>
                            <TableHead className="text-right">Total Attempts</TableHead>
                            <TableHead className="text-right">Total Time Spent</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.length > 0 ? reportData.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{row.student_name}</TableCell>
                                <TableCell className="capitalize">{row.class_group ?? '-'}</TableCell>
                                <TableCell className="text-right font-semibold">{row.average_score ? Number(row.average_score).toFixed(2) : '0.00'}</TableCell>
                                <TableCell className="text-right">{row.total_attempts}</TableCell>
                                <TableCell className="text-right">{formatDuration(row.total_time_spent_seconds || 0)}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    {selectedCourse ? 'No data found for the selected course.' : 'Please select a course to view the report.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
