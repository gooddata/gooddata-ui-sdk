// (C) 2026 GoodData Corporation

import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";

import { clamp } from "lodash-es";

import { useLocalStorage } from "@gooddata/sdk-ui";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectSettings } from "../../../model/store/config/configSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";

const SIDEBAR_MIN_WIDTH = 230;
const SIDEBAR_MAX_WIDTH = 500;
const SIDEBAR_COLLAPSED_WIDTH = 48;
const EDITOR_MIN_WIDTH = 960;
const WIDTH_STORAGE_KEY = "gd-dashboard-sidebar-width";
const COLLAPSED_STORAGE_KEY = "gd-dashboard-sidebar-collapsed";

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
    expandedWidth: number;
    min: number;
    max: number;
    canResize: boolean;
    setWidth: (width: number) => void;
    canCollapse: boolean;
    isCollapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

// Stable value used whenever the sidebar is neither resizable nor collapsible: it is fixed at the
// minimum width and ignores writes — so consumers never have to null-check.
const STATIC_SIDEBAR: IResizableSidebar = {
    width: SIDEBAR_MIN_WIDTH,
    expandedWidth: SIDEBAR_MIN_WIDTH,
    min: SIDEBAR_MIN_WIDTH,
    max: SIDEBAR_MIN_WIDTH,
    canResize: false,
    setWidth: () => {},
    canCollapse: false,
    isCollapsed: false,
    setCollapsed: () => {},
};

const ResizableSidebarContext = createContext<IResizableSidebar>(STATIC_SIDEBAR);
ResizableSidebarContext.displayName = "ResizableSidebarContext";

/**
 * Computes the sidebar width state — both the drag-to-resize bounds and the collapsed/expanded
 * state of the panel. When the sidebar is neither resizable nor collapsible (not edit mode, both
 * features are off, or it is replaced by the enhanced insight picker) it returns the static
 * {@link STATIC_SIDEBAR} — no window resize listener, no width math.
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
    const isGenAiRightPanelEnabled = settings?.enableGenAiRightPanel ?? false;

    const hasCreationPanel = isEditMode && !enableEnhancedInsightPicker;
    const isResizable = hasCreationPanel && isSidebarResizeEnabled;
    const canCollapse = hasCreationPanel && isGenAiRightPanelEnabled;

    const containerWidth = useWindowWidth(isResizable);
    const [persistedWidth, setPersistedWidth] = useLocalStorage<number>(WIDTH_STORAGE_KEY, SIDEBAR_MIN_WIDTH);
    const [persistedCollapsed, setPersistedCollapsed] = useLocalStorage<boolean>(
        COLLAPSED_STORAGE_KEY,
        false,
    );

    return useMemo(() => {
        const max = clamp(containerWidth - EDITOR_MIN_WIDTH, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH);
        const expandedWidth = isResizable ? clamp(persistedWidth, SIDEBAR_MIN_WIDTH, max) : SIDEBAR_MIN_WIDTH;

        if (canCollapse && persistedCollapsed) {
            return {
                width: SIDEBAR_COLLAPSED_WIDTH,
                expandedWidth,
                min: SIDEBAR_COLLAPSED_WIDTH,
                max: SIDEBAR_COLLAPSED_WIDTH,
                canResize: false,
                setWidth: () => {},
                canCollapse,
                isCollapsed: true,
                setCollapsed: setPersistedCollapsed,
            };
        }

        if (!isResizable) {
            return canCollapse
                ? { ...STATIC_SIDEBAR, canCollapse, setCollapsed: setPersistedCollapsed }
                : STATIC_SIDEBAR;
        }

        return {
            width: expandedWidth,
            expandedWidth,
            min: SIDEBAR_MIN_WIDTH,
            max,
            canResize: max > SIDEBAR_MIN_WIDTH,
            // Clamp every write to the current bounds, so callers can't persist an out-of-range width and
            // a non-resizable sidebar (max === min) collapses any value back to the minimum.
            setWidth: (next: number) => setPersistedWidth(clamp(next, SIDEBAR_MIN_WIDTH, max)),
            canCollapse,
            isCollapsed: false,
            setCollapsed: setPersistedCollapsed,
        };
    }, [
        canCollapse,
        persistedCollapsed,
        setPersistedCollapsed,
        isResizable,
        containerWidth,
        persistedWidth,
        setPersistedWidth,
    ]);
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
