// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { IAlertingManagementDialogProps } from "./types.js";

/**
 * @internal
 */
export const AlertingManagementDialog = (props: IAlertingManagementDialogProps): ReactElement => {
    const { AlertingManagementDialogComponent } = useDashboardComponentsContext();

    return <AlertingManagementDialogComponent {...props} />;
};
