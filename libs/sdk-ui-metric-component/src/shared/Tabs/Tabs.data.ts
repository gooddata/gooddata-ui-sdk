// (C) 2022-2026 GoodData Corporation

import { type ComponentType, type ReactNode } from "react";

import { type ITab } from "./Tab.js";

export const TabsIconSize = 16;
export const TabMinWidth = 80;
export const TabMaxWidth = 200;

export interface ITabContentProps<T = undefined> {
    tab: ITab<T>;
}

export interface ITabOptions {
    scrollToTabSpace?: number;
    scrollByArrowsStep?: number;
    scrollByArrowsRepeat?: number;
}

export interface ITabsProps<T = undefined> {
    tabs: ITab<T>[];
    active: number;
    content?: ComponentType<ITabContentProps<T>>;
    render?: (props: ITabContentProps<T>) => ReactNode;
    creatable?: boolean;
    closeable?: boolean;
    className?: string;
    minimizable?: boolean;
    maximizable?: boolean;
    maximized?: boolean;
    onTabCreate?: () => void;
    onTabClose?: (tab: ITab<T>) => void;
    onTabActivate?: (tab: ITab<T>) => void;
    onTabsClose?: () => void;
    onTabsMinimize?: () => void;
    onTabsMaximizable?: (state: boolean) => void;
    //settings
    options?: ITabOptions;
    //locales
    locales?: {
        createTooltip?: string;
        titlePlaceholder?: string;
    };
}
