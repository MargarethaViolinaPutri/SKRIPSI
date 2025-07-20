import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import React from 'react';

export function NavMain({
    items = [],
    hover = '',
    color = '',
    searchTerm = '',
}: {
    items: NavItem[];
    hover?: string;
    color?: string;
    searchTerm?: string;
}) {
    const page = usePage();

    // Filter items based on searchTerm (case-insensitive)
    const filteredItems = items
        .map((group) => {
            const filteredChildren = group.children?.filter((child) => child.title.toLowerCase().includes(searchTerm.toLowerCase()));
            if (filteredChildren && filteredChildren.length > 0) {
                return { ...group, children: filteredChildren };
            }
            return null;
        })
        .filter(Boolean) as NavItem[];

    return (
        <SidebarGroup className="px-2 py-0">
            {filteredItems.map((item) => {
                return (
                    <React.Fragment key={item.title}>
                        <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                        <SidebarMenu>
                            {item.children?.map((item) => {
                                const isActive = (() => {
                                    if (!item.href) return false;
                                    try {
                                        const itemUrl = new URL(item.href);
                                        return page.url.startsWith(itemUrl.pathname);
                                    } catch {
                                        // If item.href is relative URL
                                        return page.url.startsWith(item.href);
                                    }
                                })();
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={!!isActive} className="" tooltip={{ children: item.title }}>
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
