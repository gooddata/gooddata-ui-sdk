// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

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
    collapsedOverride,
    widthOverride,
    onUserChange,
}: IUiResizableSidebarStateOptions): IUiResizableSidebarState {
    const viewportWidth = useWindowWidth(isResizable && minContentWidth !== undefined);
    const [storedWidth, setPersistedWidth] = useLocalStorage<unknown>(widthStorageKey, null);
    const [storedCollapsed, setPersistedCollapsed] = useLocalStorage<unknown>(collapsedStorageKey, false);
    // Anything may have written these keys, so only well-formed values are trusted; the overrides
    // win over them but go through the same clamping.
    const persistedWidth =
        typeof storedWidth === "number" && Number.isFinite(storedWidth) ? storedWidth : minWidth;
    const preferredWidth =
        typeof widthOverride === "number" && Number.isFinite(widthOverride) ? widthOverride : persistedWidth;
    const preferredCollapsed = collapsedOverride ?? storedCollapsed === true;

    // Consumers keep setCollapsed in effect deps (AI-mode auto-collapse), so its identity must survive recomputes.
    const announceAndSetCollapsed = useCallback(
        (collapsed: boolean) => {
            onUserChange?.("collapsed");
            setPersistedCollapsed(collapsed);
        },
        [onUserChange, setPersistedCollapsed],
    );

    return useMemo(() => {
        const collapsedWidth = hasRail ? UI_RESIZABLE_SIDEBAR_RAIL_WIDTH : 0;
        const max =
            minContentWidth === undefined
                ? maxWidth
                : clamp(viewportWidth - minContentWidth, minWidth, maxWidth);
        const expandedWidth = isResizable ? clamp(preferredWidth, minWidth, max) : minWidth;
        // Live setters announce the user change first so the caller can release an override of the property.
        const setCollapsed = isCollapsible ? announceAndSetCollapsed : noop;

        if (isCollapsible && preferredCollapsed) {
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

        const canResize = max > minWidth;

        return {
            width: expandedWidth,
            expandedWidth,
            min: minWidth,
            max,
            canResize,
            setWidth: canResize
                ? (next: number) => {
                      onUserChange?.("width");
                      setPersistedWidth(clamp(next, minWidth, max));
                  }
                : noop,
            canCollapse: isCollapsible,
            hasRail,
            isCollapsed: false,
            setCollapsed,
        };
    }, [
        announceAndSetCollapsed,
        hasRail,
        isCollapsible,
        isResizable,
        maxWidth,
        minContentWidth,
        minWidth,
        onUserChange,
        preferredCollapsed,
        preferredWidth,
        setPersistedWidth,
        viewportWidth,
    ]);
}
