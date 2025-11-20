// (C) 2022-2025 GoodData Corporation

import { useEffect, useState } from "react";

import { ReferenceRecordings } from "@gooddata/reference-workspace";

import { setWebComponentsContext } from "../../_infra/webComponents.js";

/**
 * WARNING: Web-components stories are designed for screen test,
 * to view them properly you have to select story and hit reload button in browser.
 * After that it loads all styles and this could poison css of other stories.
 */

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
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setWebComponentsContext(() => {
            setIsLoaded(true);
        });
    }, []);

    // @ts-expect-error Unrecognised tag
    return isLoaded ? <gd-insight style={{ height: 500 }} {...props} /> : <div>Loading...</div>;
}

export default {
    title: "13 Web Components/Insight",
};
export function Base() {
    return <InsightContainer insight={insightIds[15]} />;
}

Base.parameters = { kind: "Base", screenshot: true };

export function WithLocalization() {
    return <InsightContainer insight={insightIds[15]} locale="fr-FR" />;
}
WithLocalization.parameters = { kind: "With localization", screenshot: true };

export function WithCustomTitle() {
    return <InsightContainer insight={insightIds[15]} title="Custom title" />;
}
WithCustomTitle.parameters = { kind: "With custom title", screenshot: true };

// JSX+React has issues with setting boolean props on custom element, so we can't use
//  <InsightContainer title /> without specifying an empty string value or boolean
export function WithDefaultTitle() {
    return <InsightContainer insight={insightIds[15]} title="" />;
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
AllInsightTypes.parameters = {
    kind: "All insight types",
    screenshot: {
        // Wait for AGgrid watermark to disappear
        postInteractionWait: 6500,
    },
};
