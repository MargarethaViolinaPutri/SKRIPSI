import AppLayout from '@/layouts/app-layout';
import { Module } from '@/types/module';
import { Editor } from '@monaco-editor/react';
import React from 'react';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

type LMSDetailProps = {
    modules?: Module[];
};

export default function LMSDetail({ modules }: LMSDetailProps) {
    return (
        <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6 space-y-4">
                {modules && modules.length > 0 ? (
                    modules.map((module, moduleIndex) => (
                        <div key={moduleIndex} className="mb-6">
                            <h3 className="mb-2 font-bold">
                                Module {moduleIndex + 1}: {module.name}
                            </h3>
                            {module.material_urls && module.material_urls.length > 0 ? (
                                module.material_urls.map((material, index) => {
                                    const src = material.url;
                                    return (
                                        <details key={index} className="mb-4 rounded border border-gray-300 p-2 shadow">
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
                            ) : (
                                <p>No materials available for this module.</p>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No modules available.</p>
                )}
            </div>
            <div className="col-span-6">
                <Editor className="border" defaultLanguage="python" defaultValue="# write your code here" />
            </div>
        </div>
    );
}

LMSDetail.layout = (page: React.ReactNode) => <AppLayout children={page} />;
