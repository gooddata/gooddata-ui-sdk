// (C) 2020-2025 GoodData Corporation
import { ReactElement } from "react";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { IScheduledEmailManagementDialogProps } from "./types.js";

/**
 * @internal
 */
export function ScheduledEmailManagementDialog(props: IScheduledEmailManagementDialogProps): ReactElement {
    const { ScheduledEmailManagementDialogComponent } = useDashboardComponentsContext();

    return <ScheduledEmailManagementDialogComponent {...props} />;
}
