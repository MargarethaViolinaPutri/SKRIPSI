import InputError from '@/components/input-error';
import { MultiSelect } from '@/components/multi-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { fetchModule } from '@/lib/select';
import { Question } from '@/types/question';
import { router, useForm } from '@inertiajs/react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { ReactNode, useEffect, useState } from 'react';

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
    const { data, setData, post, errors, processing } = useForm<Question>(question);
    const [runOutput, setRunOutput] = useState<string | null>(null);
    const [pyodide, setPyodide] = useState<any>(null);
    const [pyodideLoading, setPyodideLoading] = useState<boolean>(true);
    const [runningCode, setRunningCode] = useState<boolean>(false);

    useEffect(() => {
        async function loadPyodideAndSet() {
            setPyodideLoading(true);
            try {
                // @ts-ignore
                const { loadPyodide } = await import('https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.mjs');
                const py = await loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
                });
                setPyodide(py);
            } catch (error) {
                console.error('Failed to load Pyodide:', error);
                setRunOutput('Error loading Pyodide. Please try again later.');
            } finally {
                setPyodideLoading(false);
            }
        }
        loadPyodideAndSet();
    }, []);

    const splitCodeIntoQuestions = (code: string): GeneratedSoal[] => {
        const blocks = code.split(/# Soal \d+/).filter((b) => b.trim() !== '');
        return blocks.map((block, index) => {
            const narasiMatch = block.match(/"""(.*?)"""/s);
            const narasi = narasiMatch ? narasiMatch[1].trim() : 'Narasi tidak ditemukan';
            const kodeUtuh = (() => {
                const parts = block.split('"""');
                return parts.length >= 3 ? parts[2].trim() : parts[1]?.trim() || '';
            })();

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
            };
        });
    };

    const handleAutoSubmit = async () => {
        const questions = splitCodeIntoQuestions(data.code || '');

        if (questions.length > 1) {
            try {
                await axios.post(route('master.question.store.fib'), {
                    module_id: data.module_id,
                    name: data.name,
                    desc: data.desc,
                    code: '-',
                    questions,
                });
                router.visit(route('master.question.index'));
            } catch (err: any) {
                console.error('Gagal simpan FIB:', err.response?.data || err);
                alert('Gagal menyimpan soal: ' + (err.response?.data?.message || 'Unknown error'));
            }
        } else {
            const single = questions[0];
            if (single) {
                setData('test', single.kode_utuh);
            }
            post(route('master.question.store'), {
                onSuccess: () => router.visit(route('master.question.index')),
            });
        }
    };

    const handleRunCode = async () => {
        if (!pyodide || !data.code) return;
        setRunningCode(true);
        setRunOutput(null);
        try {
            const escapedCode = data.code.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/"""/g, '\\"\\"\\"');
            const result = await pyodide.runPythonAsync(`
                import sys
                from io import StringIO
                output = StringIO()
                sys.stdout = output
                sys.stderr = output

                try:
                    exec("""${escapedCode}""")
                except Exception as e:
                    print(e)

                result = output.getvalue()
                output.close()
                result
            `);
            setRunOutput(result || 'Kode berhasil dijalankan.');
        } catch (error: any) {
            setRunOutput(`Error: ${error.message}`);
        } finally {
            setRunningCode(false);
        }
    };

    return (
        <div className="grid grid-cols-12 gap-4">
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
                <InputError message={errors?.code} />
                <Button variant="outline" type="button" onClick={handleRunCode} disabled={pyodideLoading || runningCode || !data.code}>
                    {pyodideLoading ? 'Loading Pyodide...' : runningCode ? 'Running...' : 'Jalankan Kode'}
                </Button>

                {runOutput && (
                    <div className="col-span-12">
                        <Label>Output:</Label>
                        <pre className="rounded bg-black p-3 whitespace-pre-wrap text-white">{runOutput}</pre>
                    </div>
                )}
            </div>

            {data.code && splitCodeIntoQuestions(data.code).length > 0 && (
                <div className="col-span-12 mt-6 space-y-4">
                    {splitCodeIntoQuestions(data.code).map((q) => (
                        <div key={q.question_number} className="rounded border p-4">
                            <h4 className="font-semibold">Soal {q.question_number}</h4>
                            <p className="text-sm italic">{q.narasi}</p>
                            <Label className="mt-2 text-xs">Kode Blank</Label>
                            <pre className="bg-gray-100 p-2 whitespace-pre-wrap">{q.kode_blank}</pre>
                            <Label className="mt-2 text-xs">Kode Utuh (Test)</Label>
                            <pre className="bg-slate-100 p-2 whitespace-pre-wrap">{q.kode_utuh}</pre>
                        </div>
                    ))}
                </div>
            )}

            <div className="col-span-12">
                <Button type="button" onClick={handleAutoSubmit} disabled={processing}>
                    {processing ? 'Menyimpan...' : 'Submit'}
                </Button>
            </div>
        </div>
    );
}

QuestionForm.layout = (page: ReactNode) => <AppLayout children={page} />;
