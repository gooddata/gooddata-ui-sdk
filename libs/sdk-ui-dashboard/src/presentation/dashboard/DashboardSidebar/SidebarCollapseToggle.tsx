// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { UiResizableSidebarCollapseToggle, UiTooltip } from "@gooddata/sdk-ui-kit";

/**
 * The kit sidebar collapse toggle with the dashboard's translated labels and tooltip.
 *
 * @internal
 */
export function SidebarCollapseToggle({
    isCollapsed,
    onToggle,
    dataTestId = "s-dashboard-sidebar-collapse-toggle",
}: {
    isCollapsed: boolean;
    onToggle: () => void;
    dataTestId?: string;
}) {
    const intl = useIntl();
    const label = isCollapsed
        ? intl.formatMessage({ id: "sidebar.expand" })
        : intl.formatMessage({ id: "sidebar.collapse" });

    return (
        <div className="gd-sidebar-collapse-toggle">
            <UiTooltip
                content={label}
                arrowPlacement="left"
                triggerBy={["hover", "focus"]}
                optimalPlacement
                accessibilityHidden
                closeOnAnchorClick
                anchor={
                    <UiResizableSidebarCollapseToggle
                        isCollapsed={isCollapsed}
                        onToggle={onToggle}
                        collapseLabel={intl.formatMessage({ id: "sidebar.collapse" })}
                        expandLabel={intl.formatMessage({ id: "sidebar.expand" })}
                        dataTestId={dataTestId}
                    />
                }
            />
        </div>
    );
}
