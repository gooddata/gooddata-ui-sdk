// (C) 2020 GoodData Corporation
import React from "react";
import { DashboardInsightProps } from "./types";
import { WithDrillSelect } from "../drill/DrillSelect/WithDrillSelect";
import { DefaultDashboardInsight } from "./DefaultDashboardInsight";

/**
 * @internal
 */
export const DefaultDashboardInsightWithDrillSelect: React.FC<DashboardInsightProps> = (
    props,
): JSX.Element => {
    const { onDrillDown, onDrillToInsight, onDrillToAttributeUrl, onDrillToCustomUrl, onDrillToDashboard } =
        props;
    return (
        <WithDrillSelect
            insight={props.insight}
            onDrillDown={onDrillDown}
            onDrillToInsight={onDrillToInsight}
            onDrillToAttributeUrl={onDrillToAttributeUrl}
            onDrillToCustomUrl={onDrillToCustomUrl}
            onDrillToDashboard={onDrillToDashboard}
        >
            {({ onDrill }) => {
                return <DefaultDashboardInsight {...props} onDrill={onDrill} />;
            }}
        </WithDrillSelect>
    );
};
