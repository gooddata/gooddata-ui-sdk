// (C) 2020 GoodData Corporation
import React, { useCallback } from "react";
import { IDrillToLegacyDashboard } from "@gooddata/sdk-backend-spi";
import { DashboardKpiProps } from "../types";
import { DashboardKpiCore } from "./DashboardKpiCore";
import { OnFiredDashboardViewDrillEvent } from "../../../../types";
import { useDrill, useDrillToLegacyDashboard } from "../../../drill";

/**
 * @internal
 */
export const DefaultDashboardKpiWithDrills = (props: DashboardKpiProps): JSX.Element => {
    const { kpiWidget } = props;

    const { run: handleDrillToLegacyDashboard } = useDrillToLegacyDashboard();
    const { run: handleDrill } = useDrill({
        onSuccess: (event) => {
            handleDrillToLegacyDashboard(
                event.payload.drillEvent.drillDefinitions[0] as IDrillToLegacyDashboard,
                event.payload.drillEvent,
                event.correlationId,
            );
        },
    });

    const onDrill = useCallback<OnFiredDashboardViewDrillEvent>(
        (event) => {
            handleDrill(event, {
                widget: kpiWidget,
            });
        },
        [handleDrill, kpiWidget],
    );

    return <DashboardKpiCore {...props} onDrill={onDrill} />;
};
