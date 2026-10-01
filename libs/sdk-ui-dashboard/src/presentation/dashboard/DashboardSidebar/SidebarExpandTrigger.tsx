// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { UiResizableSidebarExpandTrigger } from "@gooddata/sdk-ui-kit";

import { useResizableSidebar } from "./useResizableSidebarState.js";

/**
 * Expands the hidden dashboard sidebar from the left edge of the content.
 *
 * @internal
 */
export function SidebarExpandTrigger() {
    const intl = useIntl();
    const { setCollapsed } = useResizableSidebar();

    return (
        <UiResizableSidebarExpandTrigger
            label={intl.formatMessage({ id: "sidebar.expand" })}
            dataTestId="s-dashboard-sidebar-expand-trigger"
            onExpand={() => setCollapsed(false)}
        />
    );
}
