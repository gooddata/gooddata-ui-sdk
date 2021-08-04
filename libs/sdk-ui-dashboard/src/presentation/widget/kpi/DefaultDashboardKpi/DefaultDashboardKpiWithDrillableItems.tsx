// (C) 2020 GoodData Corporation
import React, { useCallback } from "react";
import { DashboardKpiProps } from "../types";
import { DashboardKpiCore } from "./DashboardKpiCore";
import { OnFiredDashboardViewDrillEvent } from "../../../../types";
import { useDrill } from "../../../drill";

/**
 * @internal
 */
export const DefaultDashboardKpiWithDrillableItems = (props: DashboardKpiProps): JSX.Element => {
    const { kpiWidget } = props;

    const { run: handleDrill } = useDrill();

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
