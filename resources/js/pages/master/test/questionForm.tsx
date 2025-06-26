import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { PlusCircle, XCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Props {
    testId: number;
}

export default function QuestionForm({ testId }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        question_text: '',
        options: [
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
        ],
        correct_option_index: 0,
    });

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...data.options];
        newOptions[index].option_text = value;
        setData('options', newOptions);
    };

    const addOption = () => {
        setData('options', [...data.options, { option_text: '', is_correct: false }]);
    };

    const removeOption = (indexToRemove: number) => {
        if (data.options.length <= 2) return; // Min 2 option
        setData('options', data.options.filter((_, index) => index !== indexToRemove));
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('master.test.questions.store', { test: testId }), {
            onSuccess: () => reset()
        });
    };

    return (
        <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Question</h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="question_text">Question Text</Label>
                    <Textarea id="question_text" value={data.question_text} onChange={e => setData('question_text', e.target.value)} />
                    {errors.question_text && <p className="text-red-500 text-xs mt-1">{errors.question_text}</p>}
                </div>
                <div>
                    <Label>Options (select the correct answer)</Label>
                    <RadioGroup value={String(data.correct_option_index)} onValueChange={value => setData('correct_option_index', parseInt(value))}>
                        {data.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <RadioGroupItem value={String(index)} id={`option-${index}`} />
                                <Input 
                                    value={option.option_text} 
                                    onChange={e => handleOptionChange(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)} disabled={data.options.length <= 2}>
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </RadioGroup>
                    {errors.options && <p className="text-red-500 text-xs mt-1">Please fill all options.</p>}
                </div>
                <div className="flex items-center justify-between">
                    <Button type="button" variant="outline" onClick={addOption}><PlusCircle className="h-4 w-4 mr-2"/>Add Option</Button>
                    <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save Question'}</Button>
                </div>
            </form>
        </div>
    );
}