// (C) 2026 GoodData Corporation

import { useSelector } from "react-redux";

import {
    type IUiResizableSidebarState,
    useUiResizableSidebar,
    useUiResizableSidebarState,
} from "@gooddata/sdk-ui-kit";

import { isTopBarHidden as isTopBarHiddenSelector } from "../../selectors/bootstrap_selector.js";
import { enableCollapsibleLeftSidebar } from "../../selectors/feature_flag_selector.js";

const CATALOG_MIN_WIDTH = 230;
const CATALOG_MAX_WIDTH = 500;
const BUCKETS_PANEL_WIDTH = 250;
const CANVAS_MIN_WIDTH = 710;
const WIDTH_STORAGE_KEY = "gd-analytical-designer-catalog-width";
const COLLAPSED_STORAGE_KEY = "gd-analytical-designer-catalog-collapsed";

/**
 * Fixed catalog for consumers rendered outside the editor, e.g. in tests.
 */
export const STATIC_CATALOG_SIDEBAR: IUiResizableSidebarState = {
    width: CATALOG_MIN_WIDTH,
    expandedWidth: CATALOG_MIN_WIDTH,
    min: CATALOG_MIN_WIDTH,
    max: CATALOG_MIN_WIDTH,
    canResize: false,
    setWidth: () => {},
    canCollapse: false,
    hasRail: false,
    isCollapsed: false,
    setCollapsed: () => {},
};

/**
 * Returns the catalog sidebar state shared by the editor, or a fixed catalog outside it.
 */
export function useCatalogSidebar(): IUiResizableSidebarState {
    return useUiResizableSidebar(STATIC_CATALOG_SIDEBAR);
}

/**
 * Width state of the catalog column: with `enableCollapsibleLeftSidebar` it resizes within the room the buckets
 * panel and the minimum canvas leave in the editor, and collapses completely. Without the top bar, which holds the
 * restore control, it only resizes.
 *
 * @param editorWidth - measured width of the editor; the window width stands in until it is known
 */
export function useCatalogSidebarState(editorWidth?: number): IUiResizableSidebarState {
    const isEnabled = useSelector(enableCollapsibleLeftSidebar);
    const isTopBarHidden = useSelector(isTopBarHiddenSelector);

    return useUiResizableSidebarState({
        widthStorageKey: WIDTH_STORAGE_KEY,
        collapsedStorageKey: COLLAPSED_STORAGE_KEY,
        minWidth: CATALOG_MIN_WIDTH,
        maxWidth: CATALOG_MAX_WIDTH,
        minContentWidth: BUCKETS_PANEL_WIDTH + CANVAS_MIN_WIDTH,
        availableWidth: editorWidth,
        isResizable: isEnabled,
        isCollapsible: isEnabled && !isTopBarHidden,
    });
}
