// (C) 2022-2026 GoodData Corporation

import { DashboardInner } from "./DashboardInner.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectDashboardLoading } from "../../../model/store/loading/loadingSelectors.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";
import { type IDashboardProps } from "../types.js";

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
