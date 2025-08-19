// (C) 2021-2025 GoodData Corporation
import React, { useCallback } from "react";

import { idRef } from "@gooddata/sdk-model";
import { Dashboard, DashboardStoreAccessorRepository, resetDashboard } from "@gooddata/sdk-ui-dashboard";

import { Dashboards } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";

const dashboardRef = idRef(Dashboards.DependentFilterSet);

export const DashboardCommands: React.FC = () => {
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
};

function useCommand(action: any) {
    return useCallback(() => {
        const dispatch = DashboardStoreAccessorRepository.getDashboardDispatchForDashboard(dashboardRef);
        dispatch(action);
    }, [action]);
}
