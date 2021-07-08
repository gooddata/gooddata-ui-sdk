// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboardContexts";
import { DashboardKpiProps } from "./types";
import { useDrillToLegacyDashboard } from "../drill/hooks/useDrillToLegacyDashboard";
import { IDrillToLegacyDashboard } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export const DashboardKpi = (props: DashboardKpiProps): JSX.Element => {
    const { KpiComponent } = useDashboardComponentsContext({});
    const { run: handleDrillToLegacyDashboard } = useDrillToLegacyDashboard({});

    return (
        <KpiComponent
            {...props}
            onDrill={(event) => {
                // TODO: RAIL-3533 correct Kpi drill typings
                handleDrillToLegacyDashboard(event.drillDefinitions![0] as IDrillToLegacyDashboard, event);
            }}
        />
    );
};
