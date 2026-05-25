// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

import { type IScheduledEmailManagementDialogProps } from "./types.js";

/**
 * @internal
 */
export function ScheduledEmailManagementDialog(props: IScheduledEmailManagementDialogProps): ReactElement {
    const { ScheduledEmailManagementDialogComponent } = useDashboardComponentsContext();

    return <ScheduledEmailManagementDialogComponent {...props} />;
}
