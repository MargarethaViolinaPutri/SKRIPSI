import AppLayout from '@/layouts/app-layout';
import { Module } from '@/types/module';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Props {
    module: Module;
}

export default function MaterialShow({ module }: Props) {
    return (
        <div>
            {/* ... */}
            <div className="space-y-4">
                {module.materials && module.materials.length > 0 ? (
                    module.materials.map((material, index) => (
                        <details key={index} className="..." open={index === 0}>
                            <summary className="...">
                                {material.file_name || `Document ${index + 1}`}
                            </summary>
                            <div className="mt-4">
                                <iframe
                                    src={material.url} 
                                    width="100%"
                                    height="700px"
                                    title={material.file_name || `Module PDF ${index + 1}`}
                                    className="..."
                                />
                            </div>
                        </details>
                    ))
                ) : (
                    <p>No materials available for this module.</p>
                )}
            </div>
        </div>
    );
}

MaterialShow.layout = (page: React.ReactNode) => <AppLayout children={page} />;