// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { UiIconButton } from "@gooddata/sdk-ui-kit";

/**
 * Collapses the dashboard sidebar to the icon rail and expands it back.
 *
 * @internal
 */
export function SidebarCollapseToggle({
    isCollapsed,
    onToggle,
}: {
    isCollapsed: boolean;
    onToggle: () => void;
}) {
    const intl = useIntl();
    const label = isCollapsed
        ? intl.formatMessage({ id: "sidebar.expand" })
        : intl.formatMessage({ id: "sidebar.collapse" });

    return (
        <div className="gd-sidebar-collapse-toggle">
            <UiIconButton
                icon={isCollapsed ? "sidePanelExpand" : "sidePanelCollapse"}
                label={label}
                size="medium"
                variant="tertiary"
                dataTestId="s-dashboard-sidebar-collapse-toggle"
                accessibilityConfig={{
                    ariaLabel: label,
                    ariaExpanded: !isCollapsed,
                }}
                onClick={onToggle}
            />
        </div>
    );
}
