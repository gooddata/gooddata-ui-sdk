// (C) 2020 GoodData Corporation
import React from "react";

import { WithDrillSelect } from "../../../../drill/index.js";
import { IDashboardInsightProps } from "../../types.js";

import { DashboardInsight } from "./DashboardInsight.js";

/**
 * @internal
 */
export const DashboardInsightWithDrillSelect = (props: IDashboardInsightProps): JSX.Element => {
    const {
        widget,
        onDrillDown,
        onDrillToInsight,
        onDrillToAttributeUrl,
        onDrillToCustomUrl,
        onDrillToDashboard,
    } = props;

    return (
        <WithDrillSelect
            widgetRef={widget.ref}
            insight={props.insight}
            onDrillDownSuccess={onDrillDown}
            onDrillToInsightSuccess={onDrillToInsight}
            onDrillToAttributeUrlSuccess={onDrillToAttributeUrl}
            onDrillToCustomUrlSuccess={onDrillToCustomUrl}
            onDrillToDashboardSuccess={onDrillToDashboard}
        >
            {({ onDrill }) => {
                return <DashboardInsight {...props} onDrill={onDrill} />;
            }}
        </WithDrillSelect>
    );
};
