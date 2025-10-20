// (C) 2020-2025 GoodData Corporation

import { ReactElement } from "react";

import { DashboardInsight } from "./DashboardInsight.js";
import { WithDrillSelect } from "../../../../drill/index.js";
import { IDashboardInsightProps } from "../../types.js";

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
