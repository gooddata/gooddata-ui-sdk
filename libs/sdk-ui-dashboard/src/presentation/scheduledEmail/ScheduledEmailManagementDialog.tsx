// (C) 2020-2022 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboardContexts";
import { IScheduledEmailManagementDialogProps } from "./types";

/**
 * @internal
 */
export const ScheduledEmailManagementDialog = (props: IScheduledEmailManagementDialogProps): JSX.Element => {
    const { ScheduledEmailManagementDialogComponent } = useDashboardComponentsContext();

    return <ScheduledEmailManagementDialogComponent {...props} />;
};
