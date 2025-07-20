import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import * as React from 'react';

export interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
    downloadUrl?: string;
    onFilesChange?: (files: any) => void;
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(({ className, downloadUrl, onFilesChange, onChange, ...props }, ref) => {
    // Extract the filename from the download URL to use as placeholder
    const placeholder = downloadUrl ? downloadUrl.split('/').pop() || 'No file selected' : 'No file selected';

    // Handle file change
    const handleChange = (e: any) => {
        // Call the original onChange if provided
        if (onChange) {
            onChange(e);
        }

        // Call onFilesChange with the list of files if provided
        if (onFilesChange && e.target.files) {
            const filesArray = props.multiple ? Array.from(e.target.files) : e.target.files[0];
            onFilesChange(filesArray);
        }
    };

    // Handle download
    const handleDownload = () => {
        if (downloadUrl) {
            window.open(downloadUrl, '_blank');
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    data-slot="input"
                    ref={ref}
                    onChange={handleChange}
                    className={cn(
                        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                        className,
                    )}
                    placeholder={placeholder}
                    {...props}
                />
                {downloadUrl && (
                    <Button type="button" variant="outline" size="sm" onClick={handleDownload} className="whitespace-nowrap">
                        Download
                    </Button>
                )}
            </div>
        </div>
    );
});

FileUpload.displayName = 'FileUpload';

export { FileUpload };
