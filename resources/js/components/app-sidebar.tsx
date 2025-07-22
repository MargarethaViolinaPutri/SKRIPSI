import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Ruler } from 'lucide-react';
import { route } from 'ziggy-js';
import AppLogo from './app-logo';

const master: NavItem = {
    title: 'Master',
    children: [
        {
            title: 'Class Room',
            icon: LayoutGrid,
            href: route('master.classroom.index'),
        },
        {
            title: 'Course',
            icon: LayoutGrid,
            href: route('master.course.index'),
        },
        {
            title: 'Module',
            icon: LayoutGrid,
            href: route('master.module.index'),
        },
        {
            title: 'Question',
            icon: LayoutGrid,
            href: route('master.question.index'),
        },
        {
            title: 'User',
            icon: LayoutGrid,
            href: route('master.user.index'),
        },
        {
            title: 'Test',
            icon: LayoutGrid,
            href: route('master.test.index'),
        },
    ],
};

const teacher: NavItem = {
    title: 'Teacher',
    children: [
        {
            title: 'Class Room',
            icon: LayoutGrid,
            href: route('master.classroom.index'),
        },
        {
            title: 'Course',
            icon: LayoutGrid,
            href: route('master.course.index'),
        },
        {
            title: 'Module',
            icon: LayoutGrid,
            href: route('master.module.index'),
        },
        {
            title: 'Question',
            icon: LayoutGrid,
            href: route('master.question.index'),
        },
        {
            title: 'Test',
            icon: LayoutGrid,
            href: route('master.test.index'),
        },
    ],
};

const report: NavItem = {
    title: 'Report',
    children: [
        {
            title: 'Test',
            icon: Ruler,
            href: route('reports.test'),
        },
        {
            title: 'Module',
            icon: Ruler,
            href: route('reports.module'),
        },
        {
            title: 'Student',
            icon: Ruler,
            href: route('reports.student'),
        },
    ],
};

const operational: NavItem = {
    title: 'Operational',
    children: [
        {
            title: 'LMS',
            icon: Ruler,
            href: route('operational.lms.index'),
        },
    ],
};

export function AppSidebar() {
    const { role } = usePage<SharedData>().props.auth;

    let navigation: NavItem[] = [];

    if (role === 'admin') {
        navigation = [master, report];
    } else if (role === 'teacher') {
        navigation = [teacher, report];
    } else if (role === 'student') {
        navigation = [operational];
    }

    // Debug log each navigation child's href values
    navigation.forEach((group) => {
        console.log(`Group: ${group.title}`);
        group.children?.forEach((item) => {
            console.log(`  Item: ${item.title}, href: ${item.href}`);
        });
    });

    console.log('Navigation items:', navigation);

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navigation} hover="hover:bg-blue-100" color="text-black" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
