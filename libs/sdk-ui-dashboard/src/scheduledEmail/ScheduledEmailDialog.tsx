// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboard/DashboardComponentsContext";
import { ScheduledEmailDialogProps } from "./types";

/**
 * @internal
 */
export const ScheduledEmailDialog = (props: ScheduledEmailDialogProps): JSX.Element => {
    const { ScheduledEmailDialogComponent } = useDashboardComponentsContext();

    return <ScheduledEmailDialogComponent {...props} />;
};
