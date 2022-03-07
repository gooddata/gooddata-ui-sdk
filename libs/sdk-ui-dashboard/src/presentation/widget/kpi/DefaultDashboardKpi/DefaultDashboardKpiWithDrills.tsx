// (C) 2020-2022 GoodData Corporation
import React, { useCallback } from "react";
import { IDrillToLegacyDashboard } from "@gooddata/sdk-backend-spi";
import { IDashboardKpiProps } from "../types";
import { DashboardKpiCore } from "./DashboardKpiCore";
import { OnFiredDashboardDrillEvent } from "../../../../types";
import { useDrill, useDrillToLegacyDashboard } from "../../../drill";
import { useDashboardSelector, selectDisableDefaultDrills } from "../../../../model";

/**
 * @internal
 */
export const DefaultDashboardKpiWithDrills = (props: IDashboardKpiProps): JSX.Element => {
    const { kpiWidget } = props;
    const disableDefaultDrills = useDashboardSelector(selectDisableDefaultDrills);

    const { run: handleDrillToLegacyDashboard } = useDrillToLegacyDashboard();
    const { run: handleDrill } = useDrill({
        onSuccess: (event) => {
            if (disableDefaultDrills || !event.payload.drillEvent.drillDefinitions[0]) {
                return;
            }

            handleDrillToLegacyDashboard(
                event.payload.drillEvent.drillDefinitions[0] as IDrillToLegacyDashboard,
                event.payload.drillEvent,
                event.correlationId,
            );
        },
    });

    const onDrill = useCallback<OnFiredDashboardDrillEvent>(
        (event) => {
            handleDrill(event, {
                widget: kpiWidget,
            });
        },
        [handleDrill, kpiWidget],
    );

    return <DashboardKpiCore {...props} onDrill={onDrill} />;
};
