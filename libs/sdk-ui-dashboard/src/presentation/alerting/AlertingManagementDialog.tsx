// (C) 2020-2024 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { IAlertingManagementDialogProps } from "./types.js";

/**
 * @internal
 */
export const AlertingManagementDialog = (props: IAlertingManagementDialogProps): JSX.Element => {
    const { AlertingManagementDialogComponent } = useDashboardComponentsContext();

    return <AlertingManagementDialogComponent {...props} />;
};
