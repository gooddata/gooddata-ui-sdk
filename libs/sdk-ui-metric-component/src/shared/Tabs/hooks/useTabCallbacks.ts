// (C) 2022-2026 GoodData Corporation

import { useMemo } from "react";

import { type ITab } from "../Tab.js";
import { type ITabsProps } from "../Tabs.data.js";

export function useTabCallbacks<T>(
    tabs: Array<ITab<T>>,
    onTabActivate: NonNullable<ITabsProps<T>["onTabActivate"]>,
    onTabClose: NonNullable<ITabsProps<T>["onTabClose"]>,
    onTabsClose: NonNullable<ITabsProps<T>["onTabsClose"]>,
): {
    onTabActiveHandler: (tab: ITab<T>) => void;
    onTabCloseHandler: (tab: ITab<T>) => void;
} {
    return useMemo(() => {
        function onTabActiveHandler(tab: ITab<T>) {
            onTabActivate(tab);
        }

        function onTabCloseHandler(tab: ITab<T>) {
            if (tabs.length === 1) {
                onTabsClose();
                return;
            }
            onTabClose(tab);
        }

        return { onTabActiveHandler, onTabCloseHandler };
    }, [onTabActivate, onTabClose, onTabsClose, tabs]);
}
