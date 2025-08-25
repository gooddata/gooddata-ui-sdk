// (C) 2022-2025 GoodData Corporation
import React from "react";

import { ReferenceRecordings } from "@gooddata/reference-workspace";

import "../../_infra/webComponents.js";

const insightIds = [
    ReferenceRecordings.Insights.PivotTable.TwoMeasuresAndGrandTotalsAndMultipleSubtotals,
    ReferenceRecordings.Insights.AreaChart.SingleMeasureWithViewBy,
    ReferenceRecordings.Insights.BarChart.SingleMeasure,
    ReferenceRecordings.Insights.BubbleChart.XAndYAxisMeasuresWithViewBy,
    ReferenceRecordings.Insights.Xirr.CorrectConfig,
    ReferenceRecordings.Insights.BulletChart.PrimaryTargetAndComparativeMeasures,
    ReferenceRecordings.Insights.ColumnChart.SingleMeasureWithViewBy,
    ReferenceRecordings.Insights.ComboChart.MultiplePrimaryAndSecondaryMeasuresWithViewBy,
    ReferenceRecordings.Insights.DonutChart.SingleMeasureWithViewBy,
    ReferenceRecordings.Insights.FunnelChart.SingleMeasureWithViewBy,
    ReferenceRecordings.Insights.PyramidChart.SingleMeasureWithViewBy,
    ReferenceRecordings.Insights.SankeyChart.MeasureAttributeFromAndAttributeTo,
    ReferenceRecordings.Insights.DependencyWheelChart.MeasureAttributeFromAndAttributeTo,
    ReferenceRecordings.Insights.Headline.TwoMeasuresWithComparison,
    ReferenceRecordings.Insights.Heatmap.MeasureRowsAndColumns,
    ReferenceRecordings.Insights.LineChart.TwoMeasuresWithTrendBy,
    ReferenceRecordings.Insights.PieChart.TwoMeasures,
    ReferenceRecordings.Insights.ScatterPlot.XAxisMeasureAndAttribute,
    ReferenceRecordings.Insights.Treemap.TwoMeasuresAndViewBy,
    ReferenceRecordings.Insights.WaterfallChart.MultiMeasures,
].map((insight) => insight.obj.insight.identifier);

type InsightContainerProps = {
    insight: string;
    locale?: string;
    title?: string;
};

function InsightContainer(props: InsightContainerProps) {
    return <gd-insight style={{ height: 500 }} {...props} />;
}

export default {
    title: "13 Web Components/Insight",
};
export function Base() {
    return <InsightContainer insight={insightIds[0]} />;
}
Base.parameters = { kind: "Base", screenshot: true };

export function WithLocalization() {
    return <InsightContainer insight={insightIds[0]} locale="fr-FR" />;
}
WithLocalization.parameters = { kind: "With localization", screenshot: true };

export function WithCustomTitle() {
    return <InsightContainer insight={insightIds[0]} title="Custom title" />;
}
WithCustomTitle.parameters = { kind: "With custom title", screenshot: true };

// JSX+React has issues with setting boolean props on custom element, so we can't use
//  <InsightContainer title /> without specifying an empty string value or boolean
export function WithDefaultTitle() {
    return <InsightContainer insight={insightIds[0]} title="" />;
}
WithDefaultTitle.parameters = { kind: "With default title", screenshot: true };

export function AllInsightTypes() {
    return (
        <>
            {insightIds.map((id) => (
                <InsightContainer insight={id} key={id} />
            ))}
        </>
    );
}
AllInsightTypes.parameters = { kind: "All insight types", screenshot: { postInteractionWait: 1000 } };
