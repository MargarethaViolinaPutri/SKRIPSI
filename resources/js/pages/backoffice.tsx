import AppLayout from "@/layouts/app-layout";

export default function Backoffice() {
    return (
        <>
            <p>Hello world</p>
        </>
    )
}

Backoffice.layout = (page: React.ReactNode) => <AppLayout children={page} />;