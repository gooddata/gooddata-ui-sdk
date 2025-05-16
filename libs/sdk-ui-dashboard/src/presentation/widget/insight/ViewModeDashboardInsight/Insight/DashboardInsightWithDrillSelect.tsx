// (C) 2020-2025 GoodData Corporation
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
        drillStep,
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
            // If we drilled into an insight, we want to keep the root drill select open, so it can be focused when the dialog is closed
            closeBehavior={drillStep ? "preventClose" : undefined}
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
