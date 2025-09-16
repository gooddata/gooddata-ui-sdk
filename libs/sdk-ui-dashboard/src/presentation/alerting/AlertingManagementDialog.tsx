// (C) 2020-2025 GoodData Corporation

import { ReactElement } from "react";

import { IAlertingManagementDialogProps } from "./types.js";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";

/**
 * @internal
 */
export function AlertingManagementDialog(props: IAlertingManagementDialogProps): ReactElement {
    const { AlertingManagementDialogComponent } = useDashboardComponentsContext();

    return <AlertingManagementDialogComponent {...props} />;
}
