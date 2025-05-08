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
import { useForm } from '@inertiajs/react';
import Editor from '@monaco-editor/react';
import { Loader } from 'lucide-react';
import { ReactNode } from 'react';

type QuestionFormProps = {
    question?: Question;
};

export default function QuestionForm({ question }: QuestionFormProps) {
    const { data, setData, post, put, errors, processing } = useForm<Question>(question);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (question) {
            put(route('master.question.update', question.id), FormResponse);
        } else {
            post(route('master.question.store'), FormResponse);
        }
    };

    return (
        <form onSubmit={onSubmit} className="grid grid-cols-12 gap-4">
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
            </div>
            {/* <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Unit Test</Label>
                <Editor
                    className="border"
                    value={data.test}
                    onChange={(e) => setData('test', e)}
                    defaultLanguage="python"
                    defaultValue="# write your unit test here"
                    height="200px"
                />
                <InputError message={errors?.desc} />
            </div> */}
            <div className="col-span-12">
                <Button disabled={processing}>
                    {processing && <Loader className="mr-2 animate-spin" />}
                    Submit
                </Button>
            </div>
        </form>
    );
}

QuestionForm.layout = (page: ReactNode) => <AppLayout children={page} />;
