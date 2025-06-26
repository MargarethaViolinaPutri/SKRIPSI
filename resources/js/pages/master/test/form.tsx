import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Test } from '@/types/test';
import { FormEvent } from 'react';
import { format, parseISO } from 'date-fns';
import { Course } from '@/types/course';
import { useForm } from '@inertiajs/react';

interface Props {
    test?: Test;
    courses: Course[];
}

export default function TestForm({ test, courses }: Props) {
    const formatForDateTimeLocal = (dateString: string | null | undefined): string => {
        if (!dateString) return '';
        try {
            const date = parseISO(dateString);

            return format(date, "yyyy-MM-dd'T'HH:mm");
        } catch (error) {
            console.error('Invalid date format:', dateString, error);
            return '';
        }
    };

    const { data, setData, post, put, processing, errors } = useForm<Test>({
        id: test?.id || 0,
        course_id: test?.course_id || undefined,
        title: test?.title || '',
        description: test?.description || '',
        type: test?.type || 'pretest',
        status: test?.status || 'draft',
        duration_in_minutes: test?.duration_in_minutes || undefined,
        
        available_from: formatForDateTimeLocal(test?.available_from),
        available_until: formatForDateTimeLocal(test?.available_until),

        created_at: '',
        updated_at: ''
    });

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (test) {
            put(route('master.test.update', { id: test.id }));
        } else {
            post(route('master.test.store'));
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <Label htmlFor="course_id">Course</Label>
                <Select value={String(data.course_id)} onValueChange={(value) => setData('course_id', Number(value))}>
                    <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                    <SelectContent>
                        {courses.map(course => (
                            <SelectItem key={course.id} value={String(course.id)}>
                                {course.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.course_id && <p className="text-red-500 text-xs mt-1">{errors.course_id}</p>}
            </div>
            <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={data.description || ''} onChange={(e) => setData('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={data.type} onValueChange={(value) => setData('type', value as Test['type'])}>
                        <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pretest">Pre-test</SelectItem>
                            <SelectItem value="posttest">Post-test</SelectItem>
                            <SelectItem value="delaytest">Delay-test</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={data.status} onValueChange={(value) => setData('status', value as Test['status'])}>
                        <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input id="duration" type="number" value={data.duration_in_minutes || ''} onChange={(e) => setData('duration_in_minutes', parseInt(e.target.value) || undefined)} />
                </div>
                <div>
                    <Label htmlFor="available_from">Available From</Label>
                    {/* Input value sekarang akan selalu dalam format yang benar */}
                    <Input id="available_from" type="datetime-local" value={data.available_from || ''} onChange={(e) => setData('available_from', e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="available_until">Available Until</Label>
                    <Input id="available_until" type="datetime-local" value={data.available_until || ''} onChange={(e) => setData('available_until', e.target.value)} />
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save Test'}
                </Button>
            </div>
        </form>
    );
}