// (C) 2022-2026 GoodData Corporation

import { useMemo } from "react";

import { type ITabsProps } from "../Tabs.data.js";

export function useTabsCallbacks<T>(
    onTabCreate: NonNullable<ITabsProps<T>["onTabCreate"]>,
    onTabsMinimize: NonNullable<ITabsProps<T>["onTabsMinimize"]>,
    onTabsMaximizable: NonNullable<ITabsProps<T>["onTabsMaximizable"]>,
    onTabsClose: NonNullable<ITabsProps<T>["onTabsClose"]>,
): {
    onTabCreateHandler: () => void;
    onTabsMinimizeHandler: () => void;
    onTabsMaximizeHandler: (state: boolean) => void;
    onTabsCloseHandler: () => void;
} {
    return useMemo(() => {
        function onTabsMinimizeHandler() {
            onTabsMinimize();
        }

        function onTabsMaximizeHandler(state: boolean) {
            onTabsMaximizable(state);
        }

        function onTabsCloseHandler() {
            onTabsClose();
        }

        function onTabCreateHandler() {
            onTabCreate();
        }

        return { onTabCreateHandler, onTabsMinimizeHandler, onTabsMaximizeHandler, onTabsCloseHandler };
    }, [onTabCreate, onTabsClose, onTabsMinimize, onTabsMaximizable]);
}
