import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Test } from '@/types/test';
import { Link, useForm } from '@inertiajs/react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { ArrowLeft, Play, Wand2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface Props {
    test: Test;
}

export default function QuestionEditor({ test }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: test.question?.name || `Soal untuk ${test.title}`,
        desc: test.question?.desc || '',
        code: test.question?.code || '',
        test: test.question?.test || '',

        _full_code_input: test.question?.test || '',
    });

    const [isGenerating, setIsGenerating] = useState(false);

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
            } finally {
                setPyodideLoading(false);
            }
        }
        loadPyodideAndSet();
    }, []);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await axios.post(route('home.generateQuestions'), { code: data._full_code_input });

            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                const firstGenerated = response.data[0];
                setData({
                    ...data,
                    desc: firstGenerated.narasi,
                    code: firstGenerated.kode_blank,
                    test: firstGenerated.kode_utuh,
                });
            } else {
                alert('AI did not return a valid question format.');
            }
        } catch (error) {
            console.error('Failed to generate question:', error);
            alert('Failed to generate question.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRunCode = async () => {
        if (!pyodide || pyodideLoading) {
            alert('Pyodide is still loading, please wait.');
            return;
        }
        if (!data.test) {
            alert('There is no code in the "Full Code" editor to test.');
            return;
        }

        setRunningCode(true);
        setRunOutput('Running code...');

        try {
            const codeToRun = data.test;
            await pyodide.loadPackagesFromImports(codeToRun);

            const result = await pyodide.runPythonAsync(`
import sys
from io import StringIO
_stdout = sys.stdout
_stderr = sys.stderr
sys.stdout = sys.stderr = StringIO()

try:
    exec("""${codeToRun.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}""")
finally:
    _result = sys.stdout.getvalue()
    sys.stdout = _stdout
    sys.stderr = _stderr

_result
`);
            setRunOutput(result || '(No output)');
        } catch (error: any) {
            console.error('Error running Python code:', error);
            setRunOutput(`Error: ${error.message}`);
        } finally {
            setRunningCode(false);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('master.test.questions.store', { test: test.id }));
    };

    return (
        <AppLayout>
            <div className="mb-6">
                <Link href={route('master.test.index')}>
                    <Button variant="ghost" className="flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Test List
                    </Button>
                </Link>
            </div>
            <h1 className="text-2xl font-bold">Question Editor</h1>
            <p className="mb-6 text-gray-500">
                Manage the single coding question for test: <span className="font-semibold">{test.title}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 rounded-lg border p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="name">Question Name</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="desc">Description / Narration</Label>
                            <Textarea id="desc" value={data.desc} onChange={(e) => setData('desc', e.target.value)} />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <Label htmlFor="full_code" className="text-base font-semibold">
                            Generator Input
                        </Label>
                        <p className="mb-2 text-sm text-gray-500">Input full python code here, then generate the blanks.</p>
                        <Editor
                            height="200px"
                            defaultLanguage="python"
                            value={data._full_code_input}
                            onChange={(value) => setData('_full_code_input', value || '')}
                            className="rounded-md border"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button type="button" onClick={handleGenerate} disabled={isGenerating || !data._full_code_input}>
                            <Wand2 className="mr-2 h-4 w-4" />
                            {isGenerating ? 'Generating...' : 'Generate Question'}
                        </Button>
                        <Button variant="outline" type="button" onClick={handleRunCode} disabled={pyodideLoading || runningCode}>
                            <Play className="mr-2 h-4 w-4" />
                            {pyodideLoading ? 'Loading Engine...' : runningCode ? 'Running...' : 'Test Run Full Code'}
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 rounded-lg border p-6">
                    <h3 className="text-lg font-bold">Question Details (Editable)</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <Label htmlFor="code">Blank Code (for student)</Label>
                            <p className="mb-2 text-sm text-gray-500">when you want to edit a blank use '____' to make it blank</p>
                            <Editor
                                height="200px"
                                defaultLanguage="python"
                                value={data.code}
                                onChange={(value) => setData('code', value || '')}
                                className="mt-1 rounded-md border"
                            />
                            {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
                        </div>
                        <div>
                            <Label htmlFor="test">Full Code (answer key)</Label>
                            <p className="mb-2 text-sm text-gray-500">This is the full code answer key for the question.</p>
                            <Editor
                                height="200px"
                                defaultLanguage="python"
                                value={data.test}
                                onChange={(value) => setData('test', value || '')}
                                className="mt-1 rounded-md border"
                            />
                            {errors.test && <p className="mt-1 text-xs text-red-500">{errors.test}</p>}
                        </div>
                    </div>
                </div>

                {runOutput && (
                    <div className="rounded-lg border p-4">
                        <Label>Run Output:</Label>
                        <pre className="mt-1 rounded bg-gray-200 p-3 text-sm whitespace-pre-wrap text-black">{runOutput}</pre>
                    </div>
                )}

                <div className="flex justify-end border-t pt-4">
                    <Button type="submit" disabled={processing} variant="success">
                        {processing ? 'Saving...' : 'Save Question'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
