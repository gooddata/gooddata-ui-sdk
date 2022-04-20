// (C) 2022 GoodData Corporation
import React from "react";
import { useDashboardSelector, selectDashboardLoading } from "../../../model";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { IDashboardProps } from "../types";
import { DashboardInner } from "./DashboardInner";

export const DashboardLoading: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const { loading, error, result } = useDashboardSelector(selectDashboardLoading);
    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext();

    if (error) {
        return <ErrorComponent message={error.message} />;
    }

    if (loading || !result) {
        return <LoadingComponent />;
    }

    return <DashboardInner {...props} />;
};
