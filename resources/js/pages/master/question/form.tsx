import InputError from '@/components/input-error';
import { MultiSelect } from '@/components/multi-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { fetchModule } from '@/lib/select';
import { GeneratedSoal, Question } from '@/types/question';
import { Link, router, useForm } from '@inertiajs/react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { ReactNode, useEffect, useState } from 'react';

type QuestionFormProps = {
    question?: Question;
};

export default function QuestionForm({ question }: QuestionFormProps) {
    const isDetail = question && question.id != null;
    const [blankCode, setBlankCode] = useState<string>(question && question.id ? question.code || '' : '');

    const initialData = {
        ...question,
        name: question?.name || '',
        desc: question?.desc || '',
        module_id: question?.module_id || question?.module?.id || 0,
        module: question?.module ? { id: question.module.id, name: question.module.name || '' } : { id: 0, name: '' },
        code: question?.code || '',
        test: question?.test || '',
    };

    const { data, setData, errors, processing } = useForm<Question>(initialData);
    const [runOutput, setRunOutput] = useState<string | null>(null);
    const [pyodide, setPyodide] = useState<any>(null);
    const [pyodideLoading, setPyodideLoading] = useState<boolean>(true);
    const [runningCode, setRunningCode] = useState<boolean>(false);
    const [showCodeTest, setShowCodeTest] = useState<boolean>(isDetail);

    const [moduleOptions, setModuleOptions] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        setShowCodeTest(isDetail);
    }, [isDetail]);

    useEffect(() => {
        async function loadModuleOptions() {
            const options = await fetchModule('');

            const stringValueOptions = options.map((opt) => ({ value: String(opt.value), label: opt.label }));
            setModuleOptions(stringValueOptions);
        }
        loadModuleOptions();
    }, []);

    // Removed moduleLabel state and fetchModule effect as module data is directly used from question prop

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
                setRunOutput('Error loading Pyodide. Please try again later.');
            } finally {
                setPyodideLoading(false);
            }
        }
        loadPyodideAndSet();
    }, []);

    // Removed local question generation method as per user request

    const handleGenerateQuestionsWithPrism = async () => {
        if (!data.code) {
            alert('Please enter code to generate questions.');
            return;
        }
        try {
            const response = await axios.post(route('home.generateQuestions'), { code: data.code });
            if (response.data && Array.isArray(response.data)) {
                setGeneratedQuestions(response.data);
                setActiveQuestion(1);
                setShowCodeTest(false);
            } else {
                alert('Invalid response from Prism API.');
            }
        } catch (error) {
            alert('Failed to generate questions with Prism.');
        }
    };

    const handleEditField = (questionNumber: number, field: keyof GeneratedSoal, value: string) => {
        setGeneratedQuestions((prev) => prev.map((q) => (q.question_number === questionNumber ? { ...q, [field]: value } : q)));
    };

    const handleAutoSubmit = async () => {
        if (!data.module_id) {
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
                    name: data.name && data.name.trim() !== '' ? data.name : `Question ${generatedQuestions[0].question_number}`,
                    desc: data.desc && data.desc.trim() !== '' ? data.desc : generatedQuestions[0].narasi || 'Auto Generated Description',
                    code: '-',
                    questions: updatedQuestions,
                });
                router.visit(route('master.question.index'));
            } catch (err: any) {
                alert('Gagal menyimpan soal: ' + (err.response?.data?.message || 'Unknown error'));
            }
        } else {
            alert('Tidak ada soal yang dihasilkan.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.module_id) {
            alert('Pastikan semua field wajib telah diisi.');
            return;
        }
        try {
            let payload = { ...data };
            if ((!payload.name || payload.name.trim() === '') && generatedQuestions.length > 0) {
                payload.name = `Question ${generatedQuestions[0].question_number}`;
            }
            if ((!payload.desc || payload.desc.trim() === '') && generatedQuestions.length > 0) {
                payload.desc = generatedQuestions[0].narasi || 'Auto Generated Description';
            }
            // Remove name and desc from each question, only keep other fields
            const updatedQuestions = generatedQuestions.map((q: any) => {
                const { name, desc, ...rest } = q;
                return rest;
            });
            payload.questions = updatedQuestions;
            if (isDetail && question?.id) {
                await axios.post(route('master.question.update', question.id), {
                    ...payload,
                    _method: 'PUT',
                });
            } else {
                await axios.post(route('master.question.store'), payload);
            }
            router.visit(route('master.question.index'));
        } catch (err: any) {
            alert('Gagal menyimpan soal: ' + (err.response?.data?.message || 'Unknown error'));
        }
    };

    const handleRunCode = async () => {
        if (!pyodide) {
            setRunOutput('Error: Pyodide is not loaded');
            return;
        }
        if (!data.code) {
            setRunOutput('Please enter code to run.');
            return;
        }
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
            if (result) {
                setRunOutput(result);
            } else {
                setRunOutput('No output from Python execution.');
            }
        } catch (error: any) {
            setRunOutput(`Error: ${error.message}`);
        } finally {
            setRunningCode(false);
        }
    };
    return (
        <>
            <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4">
                {/* Module Field */}
                <div className="col-span-12 flex flex-col gap-1.5">
                    <Label>Module</Label>
                    <MultiSelect
                        placeholder="Module"
                        name="module_id"
                        value={moduleOptions.find((opt) => opt.value === String(data.module_id)) || null}
                        onChange={(v) => {
                            setData('module_id', Number(v.value));
                            setData('module', { id: Number(v.value), name: v.label || '' });
                        }}
                        loadOptions={fetchModule}
                    />
                    <InputError message={errors?.module_id} />
                </div>
                {/* Name Field */}
                {isDetail && (
                    <>
                        <div className="col-span-12 flex flex-col gap-1.5">
                            <Label>Name</Label>
                            <Input placeholder="Name" value={data.name} onChange={(v) => setData('name', v.currentTarget.value)} />
                            <InputError message={errors?.name} />
                        </div>
                        {/* Description Field */}
                        <div className="col-span-12 flex flex-col gap-1.5">
                            <Label>Description</Label>
                            <Textarea placeholder="Description" value={data.desc} onChange={(v) => setData('desc', v.currentTarget.value)} />
                            <InputError message={errors?.desc} />
                        </div>
                    </>
                )}
                {/* Code Editors */}
                <div className="col-span-12">
                    {!isDetail && (
                        <div>
                            <Label className="mb-1 text-sm font-semibold">Main Code</Label>
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
                    )}
                    {isDetail && (
                        <div className={`grid gap-4 md:grid-cols-2`}>
                            <div>
                                <Label className="mb-1 text-sm font-semibold">Code Utuh (Main Code)</Label>
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
                            <div>
                                <Label className="mb-1 text-sm font-semibold">Code Blank (New Code)</Label>
                                <Editor
                                    className="w-full border"
                                    value={blankCode}
                                    onChange={(e) => {
                                        setBlankCode(e || '');
                                    }}
                                    defaultLanguage="python"
                                    height="200px"
                                    theme="vs-light"
                                />
                            </div>
                        </div>
                    )}
                </div>
                {/* Buttons Section */}
                <div className="col-span-12 flex flex-col gap-1.5">
                    <InputError message={errors?.code} />
                    <div className="flex gap-2">
                        <Button variant="outline" disabled={processing} asChild>
                            <Link href={route('master.user.index')}>Back</Link>
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => handleRunCode()}
                            disabled={pyodideLoading || runningCode || !data.code}
                        >
                            {pyodideLoading ? 'Loading Pyodide...' : runningCode ? 'Running...' : 'Jalankan Kode'}
                        </Button>
                        {!isDetail && (
                            <>
                                <Button variant="outline" type="button" onClick={handleGenerateQuestionsWithPrism} disabled={!data.code}>
                                    Generate Questions
                                </Button>
                                {generatedQuestions.length > 0 && (
                                    <Button variant="success" type="button" onClick={handleAutoSubmit} disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Submit'}
                                    </Button>
                                )}
                            </>
                        )}
                        {isDetail && (
                            <Button variant="success" type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Update'}
                            </Button>
                        )}
                    </div>
                </div>

                {runOutput !== null && runOutput !== '' && (
                    <div className="col-span-12 flex flex-col gap-2">
                        <Label>Run Output:</Label>
                        <pre className="rounded bg-gray-200 p-3 whitespace-pre-wrap text-black">{runOutput}</pre>
                    </div>
                )}
            </form>

            {/* Questions Navigation and Display */}
            {!isDetail && generatedQuestions.length > 0 && (
                <>
                    {generatedQuestions.length > 1 && (
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
                    )}

                    <div className="col-span-12 mt-4">
                        {(generatedQuestions.length === 1
                            ? generatedQuestions
                            : generatedQuestions.filter((q) => q.question_number === activeQuestion)
                        ).map((q) => (
                            <div key={q.question_number} className="rounded-lg border bg-white p-4 shadow-md">
                                <div className="mb-2">
                                    <span className="inline-block rounded-full bg-indigo-500 px-3 py-1 text-sm font-medium text-white">
                                        Question {q.question_number}
                                    </span>
                                </div>{' '}
                                <Textarea
                                    className="mb-4 text-gray-700 italic"
                                    value={q.narasi}
                                    onChange={(e) => handleEditField(q.question_number, 'narasi', e.currentTarget.value)}
                                    rows={3}
                                />
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="mb-1 text-sm font-semibold">Blank Code (for student)</Label>
                                        <p className="mb-2 text-sm text-gray-500">when you want to edit a blank use '____' to make it blank</p>
                                        <Editor
                                            className="border"
                                            value={q.kode_blank}
                                            onChange={(e) => handleEditField(q.question_number, 'kode_blank', e || '')}
                                            defaultLanguage="python"
                                            height="200px"
                                        />
                                    </div>
                                    <div>
                                        <Label className="mb-1 text-sm font-semibold">Full Code (answer key)</Label>
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
        </>
    );
}

QuestionForm.layout = (page: ReactNode) => <AppLayout children={page} />;
