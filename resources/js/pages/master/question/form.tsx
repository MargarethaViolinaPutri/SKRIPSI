import InputError from '@/components/input-error';
import { MultiSelect } from '@/components/multi-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { fetchModule } from '@/lib/select';
import { GeneratedSoal, Question } from '@/types/question';
import { router, useForm } from '@inertiajs/react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { ReactNode, useEffect, useState } from 'react';

type QuestionFormProps = {
    question?: Question;
};

export default function QuestionForm({ question }: QuestionFormProps) {
    const isDetail = question && question.id != null;

    const { data, setData, post, errors, processing } = useForm<Question>(question);
    const [runOutput, setRunOutput] = useState<string | null>(null);
    const [pyodide, setPyodide] = useState<any>(null);
    const [pyodideLoading, setPyodideLoading] = useState<boolean>(true);
    const [runningCode, setRunningCode] = useState<boolean>(false);
    const [showCodeTest, setShowCodeTest] = useState<boolean>(isDetail);

    const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedSoal[]>([]);
    const [activeQuestion, setActiveQuestion] = useState<number>(1);

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
                test: kodeUtuh,
            };
        });
    };

    const handleGenerateQuestions = () => {
        const questions = splitCodeIntoQuestions(data.code || '');
        setGeneratedQuestions(questions);
        setActiveQuestion(1);
        setShowCodeTest(false); // Initially hide code test when generating new questions
    };

    const handleEditField = (questionNumber: number, field: keyof GeneratedSoal, value: string) => {
        setGeneratedQuestions((prev) => prev.map((q) => (q.question_number === questionNumber ? { ...q, [field]: value } : q)));
    };

    const handleAutoSubmit = async () => {
        if (!data.module_id || !data.name || !data.desc) {
            alert('Pastikan semua field wajib telah diisi.');
            return;
        }

        const updatedQuestions = generatedQuestions.map((q) => ({
            ...q,
            test: q.kode_utuh || '',
        }));

        if (updatedQuestions.length > 0) {
            try {
                await axios.post(route('master.question.store.fib'), {
                    module_id: data.module_id,
                    name: data.name,
                    desc: data.desc,
                    code: '-',
                    questions: updatedQuestions,
                });
                router.visit(route('master.question.index'));
            } catch (err: any) {
                console.error('Gagal menyimpan FIB:', err.response?.data || err);
                alert('Gagal menyimpan soal: ' + (err.response?.data?.message || 'Unknown error'));
            }
        } else {
            alert('Tidak ada soal yang dihasilkan.');
        }
    };

    const handleRunCode = async () => {
        if (!pyodide || !data.code) return;
        setRunningCode(true);
        setRunOutput(null);
        try {
            const escapedCode = data.code.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/"""/g, '\\"\\"\\"');
            const pythonCode = `
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
`;
            const result = await pyodide.runPythonAsync(pythonCode);
            setRunOutput(result || 'Kode berhasil dijalankan.');
        } catch (error: any) {
            setRunOutput(`Error: ${error.message}`);
        } finally {
            setRunningCode(false);
        }
    };

    return (
        <div className="grid grid-cols-12 gap-4">
            {/* Module Field */}
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Module</Label>
                <MultiSelect
                    placeholder="Module"
                    name="module_id"
                    defaultValue={{ value: data.module_id, label: data.module?.name }}
                    onChange={(v) => setData('module_id', v.value)}
                    loadOptions={fetchModule}
                    disabled={isDetail}
                />
                <InputError message={errors?.module_id} />
            </div>

            {/* Name Field */}
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Name</Label>
                <Input placeholder="Name" value={data.name} onChange={(v) => setData('name', v.currentTarget.value)} disabled={isDetail} />
                <InputError message={errors?.name} />
            </div>

            {/* Description Field */}
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Description</Label>
                <Textarea placeholder="Description" value={data.desc} onChange={(v) => setData('desc', v.currentTarget.value)} disabled={isDetail} />
                <InputError message={errors?.desc} />
            </div>

            {/* Code Editors */}
            <div className="col-span-12">
                <div className={`grid gap-4 ${showCodeTest || generatedQuestions.length === 1 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                    {/* Code Utuh Editor */}
                    <div>
                        <Label className="mb-1 text-sm font-semibold">Code Utuh (Main Code)</Label>
                        <Editor
                            className="w-full border"
                            value={data.code}
                            onChange={(e) => setData('code', e || '')}
                            defaultLanguage="python"
                            height="200px"
                            theme="vs-light"
                            options={{ readOnly: isDetail }}
                        />
                    </div>

                    {/* Code Test Editor */}
                    {showCodeTest && (
                        <div>
                            <Label className="mb-1 text-sm font-semibold">Code Test</Label>
                            <Editor
                                className="w-full border"
                                value={data.test}
                                onChange={(e) => setData('test', e || '')}
                                defaultLanguage="python"
                                height="200px"
                                theme="vs-light"
                                options={{ readOnly: isDetail }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Buttons Section */}
            <div className="col-span-12 flex flex-col gap-1.5">
                <InputError message={errors?.code} />
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={handleRunCode} disabled={pyodideLoading || runningCode || !data.code}>
                        {pyodideLoading ? 'Loading Pyodide...' : runningCode ? 'Running...' : 'Jalankan Kode'}
                    </Button>

                    {!isDetail && (
                        <>
                            <Button variant="outline" type="button" onClick={handleGenerateQuestions} disabled={!data.code}>
                                Generate Questions
                            </Button>
                            {generatedQuestions.length > 0 && (
                                <Button type="button" onClick={handleAutoSubmit} disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Submit'}
                                </Button>
                            )}
                        </>
                    )}
                </div>
                {runOutput && (
                    <div className="col-span-12">
                        <Label>Output:</Label>
                        <pre className="rounded bg-black p-3 whitespace-pre-wrap text-white">{runOutput}</pre>
                    </div>
                )}
            </div>

            {/* Questions Navigation and Display */}
            {!isDetail && generatedQuestions.length > 0 && (
                <>
                    <div className="col-span-12 flex flex-wrap gap-2 border-t pt-4">
                        {generatedQuestions.map((q) => (
                            <Button
                                key={q.question_number}
                                variant={activeQuestion === q.question_number ? 'default' : 'outline'}
                                onClick={() => setActiveQuestion(q.question_number)}
                            >
                                {q.question_number}
                            </Button>
                        ))}
                    </div>

                    <div className="col-span-12 mt-4">
                        {generatedQuestions
                            .filter((q) => q.question_number === activeQuestion)
                            .map((q) => (
                                <div key={q.question_number} className="rounded-lg border bg-white p-4 shadow-md">
                                    <div className="mb-2">
                                        <span className="inline-block rounded-full bg-indigo-500 px-3 py-1 text-sm font-medium text-white">
                                            Soal {q.question_number}
                                        </span>
                                    </div>
                                    <p className="mb-4 text-gray-700 italic">{q.narasi}</p>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label className="mb-1 text-sm font-semibold">Kode Blank (Editable)</Label>
                                            <Editor
                                                className="border"
                                                value={q.kode_blank}
                                                onChange={(e) => handleEditField(q.question_number, 'kode_blank', e || '')}
                                                defaultLanguage="python"
                                                height="200px"
                                            />
                                        </div>
                                        <div>
                                            <Label className="mb-1 text-sm font-semibold">Kode Utuh (Editable)</Label>
                                            <Editor
                                                className="border"
                                                value={q.kode_utuh}
                                                onChange={(e) => handleEditField(q.question_number, 'kode_utuh', e || '')}
                                                defaultLanguage="python"
                                                height="200px"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </>
            )}
        </div>
    );
}

QuestionForm.layout = (page: ReactNode) => <AppLayout children={page} />;
