// (C) 2026 GoodData Corporation

import { useEffect } from "react";

import {
    type IUiResizableSidebarState,
    useUiResizableSidebar,
    useUiResizableSidebarState,
} from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsAiMode, selectSettings } from "../../../model/store/config/configSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";

const SIDEBAR_MIN_WIDTH = 230;
const SIDEBAR_MAX_WIDTH = 500;
// The edit-mode sidebar collapses to an icon rail; without it the sidebar would hide completely and the
// restore control would move to the top bar (see SidebarHeaderToggle and SidebarExpandTrigger).
const SIDEBAR_HAS_RAIL = true;
const EDITOR_MIN_WIDTH = 960;
const WIDTH_STORAGE_KEY = "gd-dashboard-sidebar-width";
const COLLAPSED_STORAGE_KEY = "gd-dashboard-sidebar-collapsed";

// Fixed sidebar for consumers rendered outside the dashboard provider, e.g. a standalone panel.
const STATIC_SIDEBAR: IUiResizableSidebarState = {
    width: SIDEBAR_MIN_WIDTH,
    expandedWidth: SIDEBAR_MIN_WIDTH,
    min: SIDEBAR_MIN_WIDTH,
    max: SIDEBAR_MIN_WIDTH,
    canResize: false,
    setWidth: () => {},
    canCollapse: false,
    hasRail: SIDEBAR_HAS_RAIL,
    isCollapsed: false,
    setCollapsed: () => {},
};

/**
 * Returns the sidebar state shared by the dashboard provider, or a fixed sidebar at the minimum width when
 * rendered outside it.
 *
 * @internal
 */
export function useResizableSidebar(): IUiResizableSidebarState {
    return useUiResizableSidebar(STATIC_SIDEBAR);
}

/**
 * Computes the dashboard sidebar width state: the drag-to-resize bounds and the collapsed/expanded state
 * of the edit-mode creation panel. The sidebar collapses to an icon rail. When the sidebar is neither
 * resizable nor collapsible (not edit mode, both features off, or replaced by the enhanced insight picker)
 * it is fixed at the minimum width.
 *
 * Reads the config store, so it must be called below the dashboard loading gate where the config is
 * initialized.
 *
 * @internal
 */
export function useResizableSidebarState(): IUiResizableSidebarState {
    const settings = useDashboardSelector(selectSettings);
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const isAiMode = useDashboardSelector(selectIsAiMode);

    const isSidebarResizeEnabled = settings?.enableDashboardSidebarResize ?? false;
    const enableEnhancedInsightPicker = settings?.enableEnhancedInsightPicker ?? false;
    const isGenAiRightPanelEnabled = settings?.enableGenAiRightPanel ?? false;
    const isCollapsibleLeftSidebarEnabled = settings?.enableCollapsibleLeftSidebar ?? false;

    const hasCreationPanel = isEditMode && !enableEnhancedInsightPicker;

    const state = useUiResizableSidebarState({
        widthStorageKey: WIDTH_STORAGE_KEY,
        collapsedStorageKey: COLLAPSED_STORAGE_KEY,
        minWidth: SIDEBAR_MIN_WIDTH,
        maxWidth: SIDEBAR_MAX_WIDTH,
        hasRail: SIDEBAR_HAS_RAIL,
        minContentWidth: EDITOR_MIN_WIDTH,
        isResizable: hasCreationPanel && isSidebarResizeEnabled,
        isCollapsible: hasCreationPanel && (isGenAiRightPanelEnabled || isCollapsibleLeftSidebarEnabled),
    });
    const { setCollapsed } = state;

    // The AI assistant takes over the canvas, so the sidebar folds away while it is active.
    useEffect(() => {
        if (isAiMode) {
            setCollapsed(true);
        }
    }, [isAiMode, setCollapsed]);

    return state;
}
