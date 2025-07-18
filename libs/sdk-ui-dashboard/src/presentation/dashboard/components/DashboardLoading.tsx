// (C) 2022-2025 GoodData Corporation
import { useDashboardSelector, selectDashboardLoading } from "../../../model/index.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IDashboardProps } from "../types.js";
import { DashboardInner } from "./DashboardInner.js";

export function DashboardLoading(props: IDashboardProps) {
    const { loading, error, result } = useDashboardSelector(selectDashboardLoading);
    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext();

    if (error) {
        return <ErrorComponent message={error.message} />;
    }

    if (loading || !result) {
        return <LoadingComponent />;
    }

    return <DashboardInner {...props} />;
}
