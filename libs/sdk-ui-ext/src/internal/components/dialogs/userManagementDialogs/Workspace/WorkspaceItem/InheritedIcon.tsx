// (C) 2026 GoodData Corporation

import { UiIcon, UiTooltip } from "@gooddata/sdk-ui-kit";

interface IInheritedIconProps {
    tooltipMessage: string;
}

/**
 * Marks a workspace row whose access is inherited - through a user group or a parent workspace's
 * hierarchy permission - rather than assigned directly. It replaces the remove action (which does not
 * apply to inherited access) with a non-interactive lock icon plus a tooltip explaining that the
 * access is read-only and managed where it is granted.
 */
export function InheritedIcon({ tooltipMessage }: IInheritedIconProps) {
    return (
        <div className="gd-grantee-item-inherited s-user-management-workspace-inherited">
            <UiTooltip
                triggerBy={["hover", "focus"]}
                hoverOpenDelay={0}
                hoverCloseDelay={0}
                arrowPlacement="left"
                optimalPlacement
                anchor={
                    <div aria-label={tooltipMessage}>
                        <UiIcon type="lock" size={14} color="currentColor" layout="block" />
                    </div>
                }
                content={tooltipMessage}
            />
        </div>
    );
}
