import InputError from '@/components/input-error';
import { MultiSelect } from '@/components/multi-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { fetchModule } from '@/lib/select';
import { Question } from '@/types/question';
import { router, useForm } from '@inertiajs/react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { ReactNode, useState } from 'react';

type QuestionFormProps = {
    question?: Question;
};

type GeneratedSoal = {
    question_number: number;
    narasi: string;
    kode_utuh: string;
    kode_blank: string;
};

export default function QuestionForm({ question }: QuestionFormProps) {
    const { data, setData, post, put, errors, processing } = useForm<Question>({
        ...question,
        test: question?.test || '',
    });
    const [mode, setMode] = useState<'single' | 'batch'>('single');
    const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedSoal[]>([]);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (question) {
            put(route('master.question.update', question.id), FormResponse);
        } else {
            setData('test', data.test || data.code || '');
            post(route('master.question.store'));
        }
    };

    const handleSingleSave = async () => {
        try {
            if (question) {
                await axios.put(route('master.question.update', question.id), {
                    ...data,
                    test: data.test || data.code || '',
                });
            } else {
                await axios.post(route('master.question.store'), {
                    ...data,
                    test: data.test || data.code || '',
                });
            }
            router.visit(route('master.question.index'));
        } catch (err: any) {
            console.error('Gagal menyimpan:', err.response?.data || err);
            alert('Gagal menyimpan soal.');
        }
    };

    const splitCodeIntoQuestions = (code: string): GeneratedSoal[] => {
        const blocks = code.split(/# Soal \d+/).filter((b) => b.trim() !== '');
        return blocks.map((block, index) => {
            const narasiMatch = block.match(/"""(.*?)"""/s);
            const narasi = narasiMatch ? narasiMatch[1].trim() : 'Narasi tidak ditemukan';
            const kodeUtuh = narasiMatch ? (block.split('"""')[2]?.trim() ?? '') : block.trim();

            const kodeBlank = kodeUtuh
                .replace(/return\s+.+/g, 'return ____')
                .replace(/print\([^)]+\)/g, 'print(____)')
                .replace(/=\s*[^ \n]+/g, '= ____')
                .replace(/range\([^)]+\)/g, 'range(____)');

            return {
                question_number: index + 1,
                narasi,
                kode_utuh: kodeUtuh,
                kode_blank: kodeBlank,
                test: kodeUtuh, // Add test field to match backend requirement
            };
        });
    };

    const handleBatchSave = async () => {
        try {
            await axios.post(route('master.question.store.fib'), {
                module_id: data.module_id,
                name: data.name,
                desc: data.desc,
                code: '-',
                questions: generatedQuestions,
            });
            router.visit(route('master.question.index'));
        } catch (err: any) {
            console.error('Gagal menyimpan:', err.response?.data || err);
            alert('Gagal menyimpan soal.');
        }
    };

    return (
        <form className="grid grid-cols-12 gap-4">
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Module</Label>
                <MultiSelect
                    placeholder="Module"
                    name="module_id"
                    defaultValue={{ value: data.module_id, label: data.module?.name }}
                    onChange={(v) => setData('module_id', v.value)}
                    loadOptions={fetchModule}
                />
                <InputError message={errors?.module_id} />
            </div>
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Name</Label>
                <Input placeholder="Name" value={data.name} onChange={(v) => setData('name', v.currentTarget.value)} />
                <InputError message={errors?.name} />
            </div>
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Description</Label>
                <Textarea placeholder="Description" value={data.desc} onChange={(v) => setData('desc', v.currentTarget.value)} />
                <InputError message={errors?.desc} />
            </div>
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Code</Label>
                <Editor
                    className="border"
                    value={data.code}
                    onChange={(e) => setData('code', e)}
                    defaultLanguage="python"
                    defaultValue="# write your code here"
                    height="200px"
                />
                <input type="hidden" name="test" value={data.test || data.code || ''} />
                <div className="mt-2 flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setMode('single')}>
                        Mode Satu Soal
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            setGeneratedQuestions(splitCodeIntoQuestions(data.code || ''));
                            setMode('batch');
                        }}
                    >
                        Generate Multiple FIB
                    </Button>
                </div>
                <InputError message={errors?.code} />
            </div>

            {mode === 'single' && data.code && (
                <div className="col-span-12 mt-6 space-y-4">
                    {splitCodeIntoQuestions(data.code).map((q) => (
                        <div key={q.question_number} className="rounded border p-4">
                            <h4 className="font-semibold">Preview Soal</h4>
                            <p className="text-sm italic">{q.narasi}</p>
                            <Label className="mt-2 text-xs">Kode Blank</Label>
                            <pre className="bg-gray-100 p-2 whitespace-pre-wrap">{q.kode_blank}</pre>
                            <Label className="mt-2 text-xs">Kode Utuh (Test)</Label>
                            <pre className="bg-slate-100 p-2 whitespace-pre-wrap">{q.kode_utuh}</pre>
                        </div>
                    ))}
                </div>
            )}

            {mode === 'batch' && generatedQuestions.length > 0 && (
                <div className="col-span-12 mt-6 space-y-4">
                    {generatedQuestions.map((q) => (
                        <div key={q.question_number} className="rounded border p-4">
                            <h4 className="font-semibold">Soal {q.question_number}</h4>
                            <p className="text-sm italic">{q.narasi}</p>
                            <Label className="mt-2 text-xs">Kode Blank</Label>
                            <pre className="bg-gray-100 p-2 whitespace-pre-wrap">{q.kode_blank}</pre>
                            <Label className="mt-2 text-xs">Kode Utuh</Label>
                            <pre className="bg-slate-100 p-2 whitespace-pre-wrap">{q.kode_utuh}</pre>
                        </div>
                    ))}
                </div>
            )}

            <div className="col-span-12">
                {mode === 'single' ? (
                    <Button type="button" onClick={handleSingleSave}>
                        Submit
                    </Button>
                ) : (
                    <Button type="button" onClick={handleBatchSave}>
                        Simpan Semua Soal FIB
                    </Button>
                )}
            </div>
        </form>
    );
}

QuestionForm.layout = (page: ReactNode) => <AppLayout children={page} />;
