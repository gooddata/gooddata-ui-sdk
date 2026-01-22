// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IAlertingManagementDialogProps } from "./types.js";
import { useDashboardComponentsContext } from "../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function AlertingManagementDialog(props: IAlertingManagementDialogProps): ReactElement {
    const { AlertingManagementDialogComponent } = useDashboardComponentsContext();

    return <AlertingManagementDialogComponent {...props} />;
}
