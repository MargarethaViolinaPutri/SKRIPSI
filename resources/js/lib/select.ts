import { Base } from '@/types/base';
import { Course } from '@/types/course';
import axios from 'axios';

export type SelectOption = {
    value: any;
    label: any;
};

export const fetchCourse = async (search: any): Promise<SelectOption[]> => {
    const response = await axios.get<Base<Course[]>>(route('master.course.fetch'), {
        params: { 'filter[name]': search },
    });

    return (response.data.items ?? []).map((e: Course) => ({
        value: e.id,
        label: e.name,
    }));
};

export const fetchModule = async (search: any): Promise<SelectOption[]> => {
    const response = await axios.get<Base<Course[]>>(route('master.module.fetch'), {
        params: { 'filter[name]': search },
    });

    return (response.data.items ?? []).map((e: Course) => ({
        value: e.id,
        label: e.name,
    }));
};

export const fetchQuestion = async (search: any): Promise<SelectOption[]> => {
    const response = await axios.get<Base<Course[]>>(route('master.question.fetch'), {
        params: { 'filter[name]': search },
    });

    return (response.data.items ?? []).map((e: Course) => ({
        value: e.id,
        label: e.name,
    }));
};

export const fetchUser = async (search: any): Promise<SelectOption[]> => {
    const response = await axios.get<Base<Course[]>>(route('master.user.fetch'), {
        params: { 'filter[name]': search },
    });

    return (response.data.items ?? []).map((e: Course) => ({
        value: e.id,
        label: e.name,
    }));
};