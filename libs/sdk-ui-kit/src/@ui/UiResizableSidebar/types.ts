// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { type IconType } from "../@types/icon.js";

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
     * Width the sibling content must keep. Caps the maximum at the available width minus this value.
     */
    minContentWidth?: number;
    /**
     * Width the sidebar shares with its sibling content, e.g. their measured container when the host takes
     * part of the window. Defaults to the viewport width.
     */
    availableWidth?: number;
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

/**
 * Marks a page that needs an action from the user, e.g. a setting that is not complete.
 *
 * @internal
 */
export interface IUiResizableSidebarNavigationActionRequired {
    /**
     * Accessible text of the marker, e.g. "Action required".
     */
    label: string;
}

/**
 * A page listed in a {@link UiResizableSidebarNavigation}: a sub-item of a group, or the base of a
 * top-level item.
 *
 * @internal
 */
export interface IUiResizableSidebarNavigationSubItem {
    id: string;
    label: string;
    /**
     * Renders the item as a link. An item without `href` renders as a button.
     */
    href?: string;
    /**
     * Marks the page the user is on; rendered as `aria-current="page"`.
     */
    isSelected?: boolean;
    /**
     * Shows a dot next to the label: the page needs an action from the user. A collapsed group, and a
     * group in the rail, shows the dot when one of its sub-pages requires an action.
     */
    actionRequired?: IUiResizableSidebarNavigationActionRequired;
    dataTestId?: string;
}

/**
 * A top-level item of a {@link UiResizableSidebarNavigation}. With `children` it is an expandable group
 * whose sub-items are listed while the group is expanded.
 *
 * @internal
 */
export interface IUiResizableSidebarNavigationItem extends IUiResizableSidebarNavigationSubItem {
    /**
     * Icon shown before the label, and alone in rail mode: a kit icon name, or a custom node that
     * paints itself in `currentColor`.
     */
    icon?: IconType | ReactNode;
    children?: IUiResizableSidebarNavigationSubItem[];
}

/**
 * The navigation needs an accessible name.
 *
 * @internal
 */
export type UiResizableSidebarNavigationNamingConfig =
    | {
          ariaLabel: NonNullable<IAccessibilityConfigBase["ariaLabel"]>;
          ariaLabelledBy?: IAccessibilityConfigBase["ariaLabelledBy"];
      }
    | {
          ariaLabel?: IAccessibilityConfigBase["ariaLabel"];
          ariaLabelledBy: NonNullable<IAccessibilityConfigBase["ariaLabelledBy"]>;
      };
