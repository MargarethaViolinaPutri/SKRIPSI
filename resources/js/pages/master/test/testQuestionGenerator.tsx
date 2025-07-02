import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GeneratedSoal } from '@/types/question'; // Asumsi tipe ini ada di types/question.ts
import { Test } from '@/types/test';
import { router, useForm } from '@inertiajs/react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useState } from 'react';

interface Props {
    test: Test;
}

export default function TestQuestionGenerator({ test }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: `Test ${test.title}`,
        desc: `Test for ${test.title}`,
        code: '# Type here',
        questions: [] as GeneratedSoal[],
    });

    const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedSoal[]>([]);
    const [activeQuestion, setActiveQuestion] = useState<number>(1);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!data.code) return;
        setIsGenerating(true);
        try {
            const response = await axios.post(route('home.generateQuestions'), { code: data.code, type:'single' });
            
            if (response.data && Array.isArray(response.data)) {
                setGeneratedQuestions(response.data);
                setActiveQuestion(1);
            } else {
                alert('Invalid response from AI service.');
            }
        } catch (error) {
            console.error('Failed to generate questions:', error);
            alert('Failed to generate questions.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEditField = (questionNumber: number, field: keyof GeneratedSoal, value: string) => {
        setGeneratedQuestions((prev) => prev.map((q) => (q.question_number === questionNumber ? { ...q, [field]: value } : q)));
    };

    const handleSubmitGenerated = () => {
        post(route('master.test.questions.storeBatch', { test: test.id }), {
            
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <Label>Default Name for All Questions</Label>
                <Input value={data.name} onChange={e => setData('name', e.target.value)} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
                <Label>Default Description</Label>
                <Textarea value={data.desc} onChange={e => setData('desc', e.target.value)} />
                {errors.desc && <p className="text-red-500 text-xs mt-1">{errors.desc}</p>}
            </div>
            <div>
                <Label className="mb-1 text-sm font-semibold">Full Python Code</Label>
                <Editor
                    className="w-full border rounded-md"
                    value={data.code}
                    onChange={(e) => setData('code', e || '')}
                    defaultLanguage="python"
                    height="250px"
                    theme="vs-dark"
                />
            </div>
            <div className="text-center">
                <Button type="button" onClick={handleGenerate} disabled={isGenerating || !data.code}>
                    {isGenerating ? 'Generating...' : 'Generate Questions'}
                </Button>
            </div>

            {generatedQuestions.length > 0 && (
                <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-xl font-bold">Review Generated Questions</h3>
                    <div className="flex flex-wrap gap-2">
                        {generatedQuestions.map((q) => (
                            <Button key={q.question_number} variant={activeQuestion === q.question_number ? 'default' : 'outline'} onClick={() => setActiveQuestion(q.question_number)}>
                                {q.question_number}
                            </Button>
                        ))}
                    </div>
                    <div>
                        {generatedQuestions.filter(q => q.question_number === activeQuestion).map(q => (
                            <div key={q.question_number} className="border rounded-lg p-4 space-y-4">
                                <Textarea value={q.narasi} onChange={(e) => handleEditField(q.question_number, 'narasi', e.target.value)} rows={3} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Blank Code (for student)</Label>
                                        <Editor className="border rounded-md" value={q.kode_blank} onChange={(e) => handleEditField(q.question_number, 'kode_blank', e || '')} height="200px" defaultLanguage="python" theme="vs-dark" />
                                    </div>
                                    <div>
                                        <Label>Full Code (answer key)</Label>
                                        <Editor className="border rounded-md" value={q.kode_utuh} onChange={(e) => handleEditField(q.question_number, 'kode_utuh', e || '')} height="200px" defaultLanguage="python" theme="vs-dark" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-right">
                        <Button variant="success" type="button" onClick={handleSubmitGenerated} disabled={processing}>
                            {processing ? 'Saving...' : 'Save All Generated Questions'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}