// (C) 2026 GoodData Corporation

import { SidebarCollapseToggle } from "./SidebarCollapseToggle.js";
import { useResizableSidebar } from "./useResizableSidebarState.js";

/**
 * Restores a completely hidden dashboard sidebar from the top bar. Renders nothing while the sidebar is
 * visible, including when it is collapsed to an icon rail where the panel toggle stays in place.
 *
 * @remarks
 * The default top bar renders it. A custom top bar of a dashboard whose sidebar hides completely must
 * render it too, otherwise the only way back is the edge trigger.
 *
 * @internal
 */
export function SidebarHeaderToggle() {
    const { canCollapse, isCollapsed, hasRail, setCollapsed } = useResizableSidebar();

    if (!canCollapse || !isCollapsed || hasRail) {
        return null;
    }

    return (
        <SidebarCollapseToggle
            isCollapsed
            onToggle={() => setCollapsed(false)}
            dataTestId="s-dashboard-sidebar-restore-toggle"
        />
    );
}
