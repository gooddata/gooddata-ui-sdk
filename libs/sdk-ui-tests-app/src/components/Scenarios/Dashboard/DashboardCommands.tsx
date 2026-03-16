// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { idRef } from "@gooddata/sdk-model";
import { Dashboard, DashboardStoreAccessorRepository, resetDashboard } from "@gooddata/sdk-ui-dashboard";
import { Dashboards } from "@gooddata/sdk-ui-tests-reference-workspace/current_bear";

const dashboardRef = idRef(Dashboards.DependentFilterSet);

export function DashboardCommands() {
    const runResetDashboard = useCommand(resetDashboard());

    return (
        <>
            <div>
                <button className="s-button-command reset-dashboard" onClick={runResetDashboard}>
                    Reset Dashboard
                </button>
            </div>
            <Dashboard
                dashboard={dashboardRef}
                onStateChange={DashboardStoreAccessorRepository.getOnChangeHandlerForDashboard(dashboardRef)}
            />
        </>
    );
}

function useCommand(action: any) {
    return useCallback(() => {
        const dispatch = DashboardStoreAccessorRepository.getDashboardDispatchForDashboard(dashboardRef);
        dispatch(action);
    }, [action]);
}
