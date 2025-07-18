// (C) 2020-2025 GoodData Corporation
import { ReactElement } from "react";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { IScheduledEmailDialogProps } from "./types.js";

/**
 * @internal
 */
export function ScheduledEmailDialog(props: IScheduledEmailDialogProps): ReactElement {
    const { ScheduledEmailDialogComponent } = useDashboardComponentsContext();

    return <ScheduledEmailDialogComponent {...props} />;
}
