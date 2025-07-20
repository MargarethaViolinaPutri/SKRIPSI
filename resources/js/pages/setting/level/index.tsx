import AppLayout from '@/layouts/app-layout';

export default function LevelIndex() {
    return (
        <>
            <p>Hello World</p>
        </>
    );
}

LevelIndex.layout = (page: React.ReactNode) => <AppLayout children={page} />;
