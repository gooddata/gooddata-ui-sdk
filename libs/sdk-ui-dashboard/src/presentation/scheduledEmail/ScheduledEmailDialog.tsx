// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboardContexts";
import { IScheduledEmailDialogProps } from "./types";

/**
 * @internal
 */
export const ScheduledEmailDialog = (props: IScheduledEmailDialogProps): JSX.Element => {
    const { ScheduledEmailDialogComponent } = useDashboardComponentsContext();

    return <ScheduledEmailDialogComponent {...props} />;
};
