import AppLayout from '@/layouts/app-layout';
import { Editor } from '@monaco-editor/react';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export default function LMSDetail() {
    return (
        <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
                <iframe src="https://pdfobject.com/pdf/sample.pdf" width="100%" height="600px"></iframe>
            </div>
            <div className="col-span-6">
                <Editor className="border" defaultLanguage="python" defaultValue="# write your code here" />
            </div>
        </div>
    );
}

LMSDetail.layout = (page: React.ReactNode) => <AppLayout children={page} />;
