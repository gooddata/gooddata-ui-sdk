// (C) 2020 GoodData Corporation
import React, { useCallback } from "react";
import { IDrillToLegacyDashboard } from "@gooddata/sdk-backend-spi";

import { useDashboardComponentsContext } from "../../dashboardContexts";
import { useDrillToLegacyDashboard } from "../../drill";

import { DashboardKpiPropsProvider, useDashboardKpiProps } from "./DashboardKpiPropsContext";
import { OnFiredDashboardViewDrillEvent } from "@gooddata/sdk-ui-ext";

/**
 * @internal
 */
export const DashboardKpi = (): JSX.Element => {
    const { KpiComponent } = useDashboardComponentsContext({});
    const { run: handleDrillToLegacyDashboard } = useDrillToLegacyDashboard({});
    const props = useDashboardKpiProps();
    const onDrill = useCallback<OnFiredDashboardViewDrillEvent>(
        (event) => {
            handleDrillToLegacyDashboard(event.drillDefinitions![0] as IDrillToLegacyDashboard, event);
        },
        [handleDrillToLegacyDashboard],
    );

    return (
        <DashboardKpiPropsProvider {...props} onDrill={onDrill}>
            <KpiComponent />
        </DashboardKpiPropsProvider>
    );
};
