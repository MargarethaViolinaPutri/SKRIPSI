import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Upload } from 'lucide-react';

interface Props {
    module: { id: number };
}

export default function GformImportForm({ module }: Props) {
    const { data, setData, post, processing, errors, progress } = useForm<{ file: File | null }>({
        file: null,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!data.file) {
            alert('Please select a file to upload.');
            return;
        }
        post(route('master.module.import.gform', { module: module.id }));
    };

    return (
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-900">
            <h3 className="text-lg font-semibold mb-4 border-b pb-3">Import G-Form Answers</h3>
            <p className="text-sm text-gray-500 mb-4">
                Upload the exported Excel/CSV file from Google Forms here. Ensure the column headers match the question names in this module.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="gform-file">Excel/CSV File</Label>
                    <Input
                        id="gform-file"
                        type="file"
                        onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                        className="file:text-sm file:font-semibold"
                    />
                    {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
                </div>
                {progress && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                    </div>
                )}
                <div className="text-right">
                    <Button type="submit" disabled={processing || !data.file}>
                        <Upload className="mr-2 h-4 w-4" />
                        {processing ? 'Uploading...' : 'Upload & Import'}
                    </Button>
                </div>
            </form>
        </div>
    );
}