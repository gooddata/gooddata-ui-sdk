// (C) 2026 GoodData Corporation

import { useEffect, useMemo, useState } from "react";

import { clamp } from "lodash-es";

import { useLocalStorage } from "@gooddata/sdk-ui";

import { type IUiResizableSidebarState, type IUiResizableSidebarStateOptions } from "./types.js";

const noop = () => {};

/**
 * Width of a collapsed sidebar that keeps a rail. Fixed so every rail in the application lines up.
 *
 * @internal
 */
export const UI_RESIZABLE_SIDEBAR_RAIL_WIDTH = 48;

// Only listens while `active`, so a fixed sidebar triggers no resize-driven re-renders.
function useWindowWidth(active: boolean): number {
    const [width, setWidth] = useState<number>(() => window.innerWidth);

    useEffect(() => {
        if (!active) {
            return undefined;
        }

        setWidth(window.innerWidth);

        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [active]);

    return width;
}

/**
 * Computes the width state of a resizable, collapsible sidebar and persists it in localStorage.
 *
 * @remarks
 * Every write is clamped to the current bounds, so an out-of-range width is never persisted or applied.
 * While collapsed the sidebar reports the rail width, or zero when it hides completely, and cannot be
 * resized; the expanded width is kept so that expanding restores it.
 *
 * @internal
 */
export function useUiResizableSidebarState({
    widthStorageKey,
    collapsedStorageKey,
    minWidth,
    maxWidth,
    hasRail = false,
    minContentWidth,
    isResizable,
    isCollapsible,
}: IUiResizableSidebarStateOptions): IUiResizableSidebarState {
    const viewportWidth = useWindowWidth(isResizable && minContentWidth !== undefined);
    const [storedWidth, setPersistedWidth] = useLocalStorage<unknown>(widthStorageKey, minWidth);
    const [storedCollapsed, setPersistedCollapsed] = useLocalStorage<unknown>(collapsedStorageKey, false);
    // Anything may have written these keys, so only well-formed values are trusted.
    const persistedWidth =
        typeof storedWidth === "number" && Number.isFinite(storedWidth) ? storedWidth : minWidth;
    const persistedCollapsed = storedCollapsed === true;

    return useMemo(() => {
        const collapsedWidth = hasRail ? UI_RESIZABLE_SIDEBAR_RAIL_WIDTH : 0;
        const max =
            minContentWidth === undefined
                ? maxWidth
                : clamp(viewportWidth - minContentWidth, minWidth, maxWidth);
        const expandedWidth = isResizable ? clamp(persistedWidth, minWidth, max) : minWidth;
        const setCollapsed = isCollapsible ? setPersistedCollapsed : noop;

        if (isCollapsible && persistedCollapsed) {
            return {
                width: collapsedWidth,
                expandedWidth,
                min: collapsedWidth,
                max: collapsedWidth,
                canResize: false,
                setWidth: noop,
                canCollapse: true,
                hasRail,
                isCollapsed: true,
                setCollapsed,
            };
        }

        if (!isResizable) {
            return {
                width: minWidth,
                expandedWidth: minWidth,
                min: minWidth,
                max: minWidth,
                canResize: false,
                setWidth: noop,
                canCollapse: isCollapsible,
                hasRail,
                isCollapsed: false,
                setCollapsed,
            };
        }

        return {
            width: expandedWidth,
            expandedWidth,
            min: minWidth,
            max,
            canResize: max > minWidth,
            setWidth: (next: number) => setPersistedWidth(clamp(next, minWidth, max)),
            canCollapse: isCollapsible,
            hasRail,
            isCollapsed: false,
            setCollapsed,
        };
    }, [
        hasRail,
        isCollapsible,
        isResizable,
        maxWidth,
        minContentWidth,
        minWidth,
        persistedCollapsed,
        persistedWidth,
        setPersistedCollapsed,
        setPersistedWidth,
        viewportWidth,
    ]);
}
