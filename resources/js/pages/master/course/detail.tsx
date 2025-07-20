import AppLayout from "@/layouts/app-layout";
import { ReactNode } from "react";

export default function CourseDetail() {
    return (
        <div>
            <p>Hello</p>
        </div>
    );
}

CourseDetail.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;
