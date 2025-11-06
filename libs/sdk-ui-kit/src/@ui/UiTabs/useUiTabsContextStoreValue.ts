// (C) 2025 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EmptyObject } from "@gooddata/util";

import {
    DefaultUiTabsAllTabs,
    DefaultUiTabsAllTabsButton,
    DefaultUiTabsContainer,
    DefaultUiTabsTab,
    DefaultUiTabsTabActions,
    DefaultUiTabsTabActionsButton,
    DefaultUiTabsTabValue,
} from "./defaultComponents/index.js";
import { IUiTabActionEventContext, IUiTabContext, IUiTabsProps } from "./types.js";

let actionIdCounter = 0;

function createActionListener<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
>(
    actionEventListeners: Map<
        number,
        (context: IUiTabActionEventContext<TTabProps, TTabActionProps>) => void
    >,
) {
    return (callback: (context: IUiTabActionEventContext<TTabProps, TTabActionProps>) => void) => {
        useEffect(() => {
            const id = actionIdCounter++;

            actionEventListeners.set(id, callback);
            return () => {
                actionEventListeners.delete(id);
            };
        }, [callback]);
    };
}

/**
 * @internal
 */
export function useUiTabsContextStoreValue<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
>({
    tabs,
    selectedTabId,
    onTabSelect,
    size = "medium",
    maxLabelLength,
    accessibilityConfig: accessibilityConfigProp,
    Container = DefaultUiTabsContainer,
    Tab = DefaultUiTabsTab,
    TabValue = DefaultUiTabsTabValue,
    TabActions = DefaultUiTabsTabActions,
    TabActionsButton = DefaultUiTabsTabActionsButton,
    AllTabs = DefaultUiTabsAllTabs,
    AllTabsButton = DefaultUiTabsAllTabsButton,
}: IUiTabsProps<TTabProps, TTabActionProps>): IUiTabContext<TTabProps, TTabActionProps> {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const accessibilityConfig = useMemo(() => {
        return { tabRole: "tab", role: "tablist", ...accessibilityConfigProp };
    }, [accessibilityConfigProp]);

    // Check if tabs overflow the container
    const containerRef = useCallback((container: Element) => {
        resizeObserverRef.current?.disconnect();

        if (!container) {
            return undefined;
        }

        const checkOverflow = () => {
            const hasOverflow = container.scrollWidth > container.clientWidth;
            setIsOverflowing(hasOverflow);
        };

        checkOverflow();

        resizeObserverRef.current = new ResizeObserver(checkOverflow);
        resizeObserverRef.current.observe(container);
    }, []);

    const [actionEventListeners] = useState(
        new Map<number, (context: IUiTabActionEventContext<TTabProps, TTabActionProps>) => void>(),
    );
    const onActionTriggered = useCallback(
        (context: IUiTabActionEventContext<TTabProps, TTabActionProps>) => {
            actionEventListeners.forEach((listener) => listener(context));
        },
        [actionEventListeners],
    );

    const useActionListener = useMemo(
        () => createActionListener(actionEventListeners),
        [actionEventListeners],
    );

    return useMemo(
        () => ({
            tabs,
            selectedTabId,
            onTabSelect,
            size,
            maxLabelLength,

            accessibilityConfig,

            onActionTriggered,
            useActionListener,

            isOverflowing,
            containerRef,

            Container,
            Tab,
            TabValue,
            TabActions,
            TabActionsButton,
            AllTabs,
            AllTabsButton,
        }),
        [
            tabs,
            selectedTabId,
            onTabSelect,
            size,
            maxLabelLength,
            accessibilityConfig,
            onActionTriggered,
            useActionListener,
            isOverflowing,
            containerRef,
            Container,
            Tab,
            TabValue,
            TabActions,
            TabActionsButton,
            AllTabs,
            AllTabsButton,
        ],
    );
}
