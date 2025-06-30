import InputError from '@/components/input-error';
import { MultiSelect } from '@/components/multi-select';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { fetchCourse } from '@/lib/select';
import { Module } from '@/types/module';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { Loader } from 'lucide-react';
import React, { ReactNode, useEffect } from 'react';

type ModuleFormProps = {
    module?: Module;
    isDetail: boolean;
    iframeSrc: string;
};

export default function ModuleForm({ module, isDetail, iframeSrc }: ModuleFormProps) {
    const { data, setData, post, put, errors, processing } = useForm<Record<string, any>>(module ?? {});

    // Set iframeSrc from module material_paths on mount or module change
    useEffect(() => {
        if (iframeSrc) {
            // No internal state, just rely on prop
            // If needed, you can set data or other states here
        }
    }, [iframeSrc]);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate required fields before submission
        if (!data.course_id) {
            alert('The course id field is required.');
            return;
        }
        if (!data.name || data.name.trim() === '') {
            alert('The name field is required.');
            return;
        }
        if (!data.desc || data.desc.trim() === '') {
            alert('The desc field is required.');
            return;
        }

        // Prepare form data for submission
        let submitData: any;

        // If there are files to upload, use FormData
        if (data.materials && data.materials.length > 0) {
            submitData = new FormData();
            submitData.append('course_id', data.course_id ? String(data.course_id) : '');
            submitData.append('name', data.name || '');
            submitData.append('desc', data.desc || '');

            // Append new files
            data.materials.forEach((file: File, index: number) => {
                submitData.append('materials[]', file);
            });

            // Append _method for PUT requests
            if (module && module.id) {
                submitData.append('_method', 'PUT');
            }

            // Log FormData contents for debugging
            for (let pair of submitData.entries()) {
                console.log(pair[0] + ', ' + pair[1]);
            }
        } else {
            // No files, send JSON object
            submitData = { ...data };
            submitData.course_id = data.course_id ? Number(data.course_id) : null;
            submitData.name = data.name || '';
            submitData.desc = data.desc || '';
            if (module && (!data.materials || data.materials.length === 0)) {
                submitData.materials = module.material_paths || [];
            }
        }

        console.log('Submitting data:', submitData);
        console.log('Submit triggered');
        console.log('Update mode:', isDetail && module && module.id);

        try {
            if (isDetail) {
                if (!module || !module.id) {
                    if (submitData instanceof FormData) {
                        await axios.post('/master/module', submitData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                        });
                        window.location.href = route('master.module.index');
                    } else {
                        await post('/master/module', submitData);
                    }
                } else {
                    if (submitData instanceof FormData) {
                        await axios.post(`/master/module/${module.id}`, submitData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                        });
                        window.location.href = route('master.module.index');
                    } else {
                        await put(`/master/module/${module.id}`, submitData);
                    }
                }
            } else {
                if (submitData instanceof FormData) {
                    await axios.post('/master/module', submitData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    window.location.href = route('master.module.index');
                } else {
                    await post('/master/module', submitData);
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    return (
        <>
            <form onSubmit={onSubmit} className="grid grid-cols-12 gap-4">
                <div className="col-span-12 flex flex-col gap-1.5">
                    <Label>Course</Label>
                    <MultiSelect
                        placeholder="Course"
                        name="course_id"
                        defaultValue={data.course_id ? { value: data.course_id, label: data.course?.name } : null}
                        onChange={(v) => setData('course_id', v ? v.value : null)}
                        loadOptions={fetchCourse}
                    />
                    <InputError message={errors?.course_id} />
                </div>
                <div className="col-span-12 flex flex-col gap-1.5">
                    <Label>Name</Label>
                    <Input placeholder="Name" value={data.name || ''} onChange={(e) => setData('name', e.currentTarget.value)} />
                    <InputError message={errors?.name} />
                </div>
                <div className="col-span-12 flex flex-col gap-1.5">
                    <Label>Description</Label>
                    <Textarea placeholder="Description" value={data.desc || ''} onChange={(e) => setData('desc', e.currentTarget.value)} />
                    <InputError message={errors?.desc} />
                </div>
                <div className="col-span-12 flex flex-col gap-1.5">
                    <Label>File</Label>
                    <FileUpload multiple={true} accept="application/pdf" onFilesChange={(v) => setData('materials', v)} />
                    <InputError message={errors?.materials} />
                </div>
                <div className="col-span-12">
                    {module && module.materials && module.materials.length > 0 ? (
                        module.materials.map((material: any, index: number) => {
                            const src = material.url;
                            return (
                                <details key={index} className="rounded border border-gray-300 p-2 shadow">
                                    <summary className="mb-2 cursor-pointer font-semibold text-gray-700">{`Document ${index + 1}`}</summary>
                                    <iframe
                                        src={src}
                                        width="100%"
                                        height="600px"
                                        title={`Module PDF ${index + 1}`}
                                        className="rounded border border-gray-300 shadow"
                                    />
                                </details>
                            );
                        })
                    ) : iframeSrc ? (
                        <details className="rounded border border-gray-300 p-2 shadow">
                            <summary className="mb-2 cursor-pointer font-semibold text-gray-700">Document</summary>
                            <iframe
                                src={iframeSrc}
                                width="100%"
                                height="600px"
                                title="Module PDF"
                                className="rounded border border-gray-300 shadow"
                            />
                        </details>
                    ) : null}
                </div>
                <div className="col-span-12">
                    <Button variant="success" type="submit" disabled={processing}>
                        {processing && <Loader className="mr-2 animate-spin" />}
                        Submit
                    </Button>
                </div>
            </form>
        </>
    );
}

ModuleForm.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;
