import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Ruler, Settings } from 'lucide-react';
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
    ],
};

const operational: NavItem = {
    title: 'Operational',
    children: [
        {
            title: 'LMS',
            icon: Ruler,
            href: '/dashboard',
        },
    ],
};

const setting: NavItem = {
    title: 'Setting',
    children: [
        {
            title: 'System Setting',
            icon: Settings,
            href: route('setting.system.index'),
        },
        {
            title: 'Level Setting',
            icon: Settings,
            href: '',
        },
    ],
};

export function AppSidebar() {
    const navigation = [master, operational, setting];

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
                <NavMain items={navigation} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
