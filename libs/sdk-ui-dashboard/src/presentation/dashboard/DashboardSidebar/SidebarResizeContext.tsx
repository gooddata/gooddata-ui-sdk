// (C) 2026 GoodData Corporation

import { type ReactNode, createContext, useContext, useEffect, useState } from "react";

import { clamp } from "lodash-es";

import { useLocalStorage } from "@gooddata/sdk-ui";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectSettings } from "../../../model/store/config/configSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";

const SIDEBAR_MIN_WIDTH = 230;
const SIDEBAR_MAX_WIDTH = 500;
const EDITOR_MIN_WIDTH = 960;
const LOCAL_STORAGE_KEY = "gd-dashboard-sidebar-width";

/**
 * Returns the current `window.innerWidth`, kept in sync with the `resize` event. Only attaches the
 * listener while `active`, so a non-resizable sidebar triggers no resize-driven re-renders.
 */
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

interface IResizableSidebar {
    width: number;
    min: number;
    max: number;
    canResize: boolean;
    setWidth: (width: number) => void;
}

// Stable value used whenever the sidebar is not resizable: it is fixed at the minimum width, cannot
// be resized, and ignores writes — so consumers never have to null-check.
const NON_RESIZABLE_SIDEBAR: IResizableSidebar = {
    width: SIDEBAR_MIN_WIDTH,
    min: SIDEBAR_MIN_WIDTH,
    max: SIDEBAR_MIN_WIDTH,
    canResize: false,
    setWidth: () => {},
};

const ResizableSidebarContext = createContext<IResizableSidebar>(NON_RESIZABLE_SIDEBAR);
ResizableSidebarContext.displayName = "ResizableSidebarContext";

/**
 * Computes the resizable-sidebar state. When the sidebar is not resizable (not edit mode, the feature
 * is off, or it is replaced by the enhanced insight picker) it returns the static
 * {@link NON_RESIZABLE_SIDEBAR} — no window resize listener, no width math.
 *
 * Reads the config store, so it must be called below the dashboard loading gate where the config is
 * initialized.
 *
 * @internal
 */
export function useResizableSidebarState(): IResizableSidebar {
    const settings = useDashboardSelector(selectSettings);
    const isEditMode = useDashboardSelector(selectIsInEditMode);

    const isSidebarResizeEnabled = settings?.enableDashboardSidebarResize ?? false;
    const enableEnhancedInsightPicker = settings?.enableEnhancedInsightPicker ?? false;
    const isResizable = isEditMode && isSidebarResizeEnabled && !enableEnhancedInsightPicker;

    const containerWidth = useWindowWidth(isResizable);
    const [persistedWidth, setPersistedWidth] = useLocalStorage<number>(LOCAL_STORAGE_KEY, SIDEBAR_MIN_WIDTH);

    if (!isResizable) {
        return NON_RESIZABLE_SIDEBAR;
    }

    const max = clamp(containerWidth - EDITOR_MIN_WIDTH, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH);
    const width = clamp(persistedWidth, SIDEBAR_MIN_WIDTH, max);

    return {
        width,
        min: SIDEBAR_MIN_WIDTH,
        max,
        canResize: max > SIDEBAR_MIN_WIDTH,
        // Clamp every write to the current bounds, so callers can't persist an out-of-range width and
        // a non-resizable sidebar (max === min) collapses any value back to the minimum.
        setWidth: (next: number) => setPersistedWidth(clamp(next, SIDEBAR_MIN_WIDTH, max)),
    };
}

/**
 * Shares the resize state produced by {@link useResizableSidebarState} with descendants such as the
 * resize handle, so it stays a single source of truth.
 *
 * @internal
 */
export function ResizableSidebarProvider({
    value,
    children,
}: {
    value: IResizableSidebar;
    children: ReactNode;
}) {
    return <ResizableSidebarContext.Provider value={value}>{children}</ResizableSidebarContext.Provider>;
}

/**
 * Returns the sidebar resize state, or {@link NON_RESIZABLE_SIDEBAR} when the sidebar is not resizable.
 *
 * @internal
 */
export function useResizableSidebar(): IResizableSidebar {
    return useContext(ResizableSidebarContext);
}
