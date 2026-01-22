// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IScheduledEmailDialogProps } from "./types.js";
import { useDashboardComponentsContext } from "../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function ScheduledEmailDialog(props: IScheduledEmailDialogProps): ReactElement {
    const { ScheduledEmailDialogComponent } = useDashboardComponentsContext();

    return <ScheduledEmailDialogComponent {...props} />;
}
