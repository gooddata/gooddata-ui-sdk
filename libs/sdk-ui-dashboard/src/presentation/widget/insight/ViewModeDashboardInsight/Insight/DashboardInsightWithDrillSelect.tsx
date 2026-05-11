// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { WithDrillSelect } from "../../../../drill/DrillSelect/WithDrillSelect.js";
import { type IDashboardInsightProps } from "../../types.js";

import { DashboardInsight } from "./DashboardInsight.js";

/**
 * @internal
 */
export function DashboardInsightWithDrillSelect(props: IDashboardInsightProps): ReactElement {
    const {
        widget,
        returnFocusToInsight,
        onDrillStart,
        onDrillDown,
        onDrillToInsight,
        onDrillToAttributeUrl,
        onDrillToCustomUrl,
        onDrillToDashboard,
        onKeyDriverAnalysisSuccess,
    } = props;

    return (
        <WithDrillSelect
            widgetRef={widget.ref}
            insight={props.insight}
            returnFocusToInsight={returnFocusToInsight}
            onDrillStart={onDrillStart}
            onDrillDownSuccess={onDrillDown}
            onDrillToInsightSuccess={onDrillToInsight}
            onDrillToAttributeUrlSuccess={onDrillToAttributeUrl}
            onDrillToCustomUrlSuccess={onDrillToCustomUrl}
            onDrillToDashboardSuccess={onDrillToDashboard}
            onKeyDriverAnalysisSuccess={onKeyDriverAnalysisSuccess}
        >
            {({ onDrill }) => {
                return <DashboardInsight {...props} onDrill={onDrill} />;
            }}
        </WithDrillSelect>
    );
}
