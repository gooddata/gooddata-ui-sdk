// (C) 2026 GoodData Corporation

/**
 * Width state of a resizable, collapsible sidebar, shared between the sidebar and controls rendered
 * elsewhere (for example a restore control in a header).
 *
 * @internal
 */
export interface IUiResizableSidebarState {
    /**
     * Width to render right now: the expanded width, or the collapsed width while collapsed.
     */
    width: number;
    /**
     * Width restored on expand; equals `width` while expanded.
     */
    expandedWidth: number;
    min: number;
    max: number;
    canResize: boolean;
    setWidth: (width: number) => void;
    canCollapse: boolean;
    /**
     * Whether a collapsed sidebar keeps a rail of fixed width ({@link UI_RESIZABLE_SIDEBAR_RAIL_WIDTH}) instead
     * of hiding completely.
     */
    hasRail: boolean;
    isCollapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

/**
 * @internal
 */
export interface IUiResizableSidebarStateOptions {
    /**
     * localStorage key of the persisted expanded width.
     */
    widthStorageKey: string;
    /**
     * localStorage key of the persisted collapsed flag.
     */
    collapsedStorageKey: string;
    /**
     * Narrowest expanded width; also the width of a sidebar that cannot be resized.
     */
    minWidth: number;
    /**
     * Widest expanded width, before the `minContentWidth` constraint applies.
     */
    maxWidth: number;
    /**
     * Keeps a rail of fixed width ({@link UI_RESIZABLE_SIDEBAR_RAIL_WIDTH}) while collapsed instead of hiding the
     * sidebar completely. Defaults to false.
     */
    hasRail?: boolean;
    /**
     * Width the sibling content must keep. Caps the maximum at the viewport width minus this value.
     */
    minContentWidth?: number;
    isResizable: boolean;
    isCollapsible: boolean;
    /**
     * When defined, takes precedence over the persisted collapsed flag, e.g. for an embedder-driven
     * sidebar. The setters keep writing only the persisted state, so release the override from
     * `onUserChange`, or it keeps winning over the user's change.
     */
    collapsedOverride?: boolean;
    /**
     * When defined, takes precedence over the persisted expanded width; clamped to the current
     * bounds like any width. Released the same way as `collapsedOverride`.
     */
    widthOverride?: number;
    /**
     * Called with the changed property right before a live setter persists a user change; never
     * called by a setter that cannot change anything (resize while collapsed or not resizable,
     * collapse while not collapsible). The place to release an override of the property. Keep the
     * reference stable (useCallback): the setters keep their identity only while it is, and
     * consumers hold them in effect dependencies.
     */
    onUserChange?: (property: "collapsed" | "width") => void;
}
