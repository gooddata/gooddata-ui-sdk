// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { IScheduledEmailDialogProps } from "./types.js";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";

/**
 * @internal
 */
export function ScheduledEmailDialog(props: IScheduledEmailDialogProps): ReactElement {
    const { ScheduledEmailDialogComponent } = useDashboardComponentsContext();

    return <ScheduledEmailDialogComponent {...props} />;
}
