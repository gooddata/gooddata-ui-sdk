// (C) 2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    type IUiResizableSidebarState,
    UiResizableSidebar,
    UiResizableSidebarHandle,
} from "@gooddata/sdk-ui-kit";

import { SidebarExpandTrigger } from "./SidebarExpandTrigger.js";

/**
 * @internal
 */
export interface IDashboardSidebarChromeProps {
    sidebar: IUiResizableSidebarState;
    /**
     * Renders the drag handle; the sidebar is still resizable by keyboard only through it.
     */
    hasResizeHandle: boolean;
    onContainerClick?: () => void;
    /**
     * Panel content, rendered at the expanded width so it is clipped, not reflowed, while collapsing.
     */
    children: ReactNode;
    /**
     * Rendered inside the sticky container after the panel, e.g. the delete drop zone.
     */
    afterPanel?: ReactNode;
}

/**
 * The dashboard edit-mode sidebar frame: the resizable wrapper, the sticky container with its collapse
 * modifiers, the panel that clips the content, the drag handle and the edge trigger of a completely
 * hidden sidebar. A collapsed sidebar either keeps an icon rail, where the panel toggle stays in place,
 * or hides completely and is restored from the top bar or the edge trigger.
 *
 * @internal
 */
export function DashboardSidebarChrome({
    sidebar,
    hasResizeHandle,
    onContainerClick,
    children,
    afterPanel,
}: IDashboardSidebarChromeProps): ReactElement {
    const intl = useIntl();
    const { isCollapsed, canCollapse, hasRail, expandedWidth } = sidebar;

    const panel = (
        <div className={cx("gd-sidebar-panel", { "gd-sidebar-panel--collapsible": canCollapse })}>
            <div
                className="flex-panel-full-height"
                style={canCollapse ? { width: expandedWidth } : undefined}
            >
                {children}
            </div>
        </div>
    );

    if (!hasResizeHandle && !canCollapse) {
        return (
            <div className="col gd-flex-item gd-sidebar-container" onClick={onContainerClick}>
                {panel}
                {afterPanel}
            </div>
        );
    }

    return (
        <>
            {isCollapsed && !hasRail ? <SidebarExpandTrigger /> : null}
            <UiResizableSidebar state={sidebar} dataTestId="s-dashboard-sidebar">
                <div
                    className={cx("col gd-flex-item gd-sidebar-container gd-sidebar-container--resizable", {
                        "gd-sidebar-container--collapsed": isCollapsed,
                        "gd-sidebar-container--rail": canCollapse && hasRail,
                        "gd-sidebar-container--hidden": canCollapse && !hasRail,
                    })}
                    onClick={onContainerClick}
                >
                    {panel}
                    {afterPanel}
                </div>
                {/* A sibling of the sticky container: inside it, the container's composited layer keeps
                    stale pixels in the strip the handle overhangs after the collapse slide. */}
                {hasResizeHandle ? (
                    <UiResizableSidebarHandle
                        accessibilityConfig={{ ariaLabel: intl.formatMessage({ id: "sidebar.resize" }) }}
                        dataTestId="s-dashboard-sidebar-resize-handle"
                    />
                ) : null}
            </UiResizableSidebar>
        </>
    );
}
