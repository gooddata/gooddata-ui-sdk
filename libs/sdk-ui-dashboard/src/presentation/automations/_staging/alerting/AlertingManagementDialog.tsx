// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useDashboardComponentsContext } from "../../../dashboardContexts/DashboardComponentsContext.js";
import { type IAlertingManagementDialogProps } from "../../alerting/types.js";

/**
 * @internal
 */
export function AlertingManagementDialog(props: IAlertingManagementDialogProps): ReactElement {
    const { AlertingManagementDialogComponent } = useDashboardComponentsContext();

    return <AlertingManagementDialogComponent {...props} />;
}
