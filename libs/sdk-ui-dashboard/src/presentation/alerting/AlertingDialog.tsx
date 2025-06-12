// (C) 2020-2024 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { IAlertingDialogProps } from "./types.js";

/**
 * @internal
 */
export const AlertingDialog = (props: IAlertingDialogProps): JSX.Element => {
    const { AlertingDialogComponent } = useDashboardComponentsContext();

    return <AlertingDialogComponent {...props} />;
};
