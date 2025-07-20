import * as React from 'react';
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { FileUpload, FileUploadProps } from '@/components/ui/file-upload';
import { Controller, useFormContext } from 'react-hook-form';

interface FormFileUploadProps extends Omit<FileUploadProps, 'onChange'> {
  name: string;
  label?: string;
  description?: string;
}

const FormFileUpload = React.forwardRef<HTMLInputElement, FormFileUploadProps>(
  ({ name, label, description, ...props }, ref) => {
    const { control } = useFormContext();

    return (
      <FormItem>
        {label && <FormLabel>{label}</FormLabel>}
        <Controller
          name={name}
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <FormControl>
              <FileUpload
                {...field}
                {...props}
                ref={ref}
                value={value ? undefined : ''}
                onFilesChange={(files) => {
                  // For multiple files, pass the array of files
                  if (props.multiple) {
                    onChange(files);
                  } 
                  // For single file, pass just the first file
                  else if (files.length > 0) {
                    onChange(files[0]);
                  }
                }}
              />
            </FormControl>
          )}
        />
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    );
  }
);

FormFileUpload.displayName = 'FormFileUpload';

export { FormFileUpload };