import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import React from 'react';

export function NavMain({ items = [], hover = '', color = '' }: { items: NavItem[]; hover?: string; color?: string }) {
    const page = usePage();
    console.log('Current page URL:', page.url);
    return (
        <SidebarGroup className="px-2 py-0">
            {items.map((item) => {
                console.log('Nav item href:', item.href);
                return (
                    <React.Fragment key={item.title}>
                        <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                        <SidebarMenu>
                            {item.children?.map((item) => {
                                const isActive = (() => {
                                    if (!item.href) return false;
                                    try {
                                        const itemUrl = new URL(item.href);
                                        return page.url === itemUrl.pathname;
                                    } catch {
                                        // If item.href is relative URL
                                        return page.url === item.href;
                                    }
                                })();
                                console.log(`Checking active state for ${item.title}:`, isActive);
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={!!isActive}
                                            className={`${color} ${hover} ${isActive ? 'bg-blue-300 font-semibold text-blue-700' : ''}`}
                                            tooltip={{ children: item.title }}
                                        >
                                            <Link href={item.href ?? '#'} prefetch>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </React.Fragment>
                );
            })}
        </SidebarGroup>
    );
}
