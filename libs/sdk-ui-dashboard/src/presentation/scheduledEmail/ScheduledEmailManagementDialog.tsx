// (C) 2020-2022 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { IScheduledEmailManagementDialogProps } from "./types.js";

/**
 * @internal
 */
export const ScheduledEmailManagementDialog = (props: IScheduledEmailManagementDialogProps): JSX.Element => {
    const { ScheduledEmailManagementDialogComponent } = useDashboardComponentsContext();

    return <ScheduledEmailManagementDialogComponent {...props} />;
};
