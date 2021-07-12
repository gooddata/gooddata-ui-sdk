// (C) 2020 GoodData Corporation
import React from "react";
import { IDrillToLegacyDashboard } from "@gooddata/sdk-backend-spi";

import { useDashboardComponentsContext } from "../../dashboardContexts";
import { useDrillToLegacyDashboard } from "../../drill";

import { DashboardKpiProps } from "./types";

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
