// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { IAlertingDialogProps } from "./types.js";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";

/**
 * @internal
 */
export function AlertingDialog(props: IAlertingDialogProps): ReactElement {
    const { AlertingDialogComponent } = useDashboardComponentsContext();

    return <AlertingDialogComponent {...props} />;
}
