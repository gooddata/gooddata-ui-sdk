// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IAlertingDialogProps } from "./types.js";
import { useDashboardComponentsContext } from "../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function AlertingDialog(props: IAlertingDialogProps): ReactElement {
    const { AlertingDialogComponent } = useDashboardComponentsContext();

    return <AlertingDialogComponent {...props} />;
}
