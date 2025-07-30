// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { IAlertingDialogProps } from "./types.js";

/**
 * @internal
 */
export const AlertingDialog = (props: IAlertingDialogProps): ReactElement => {
    const { AlertingDialogComponent } = useDashboardComponentsContext();

    return <AlertingDialogComponent {...props} />;
};
