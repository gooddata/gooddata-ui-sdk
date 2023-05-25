// (C) 2022 GoodData Corporation
import React from "react";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { storiesOf } from "../../_infra/storyRepository.js";
import { WebComponents } from "../../_infra/storyGroups.js";
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
    ReferenceRecordings.Insights.Headline.TwoMeasures,
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

const InsightContainer: React.FC<InsightContainerProps> = (props) => {
    return <gd-insight style={{ height: 500 }} {...props} />;
};

storiesOf(`${WebComponents}/Insight`)
    .add("Base", () => <InsightContainer insight={insightIds[0]} />, { screenshot: true })
    .add("With localization", () => <InsightContainer insight={insightIds[0]} locale="fr-FR" />, {
        screenshot: true,
    })
    .add("With custom title", () => <InsightContainer insight={insightIds[0]} title="Custom title" />, {
        screenshot: true,
    })
    // JSX+React has issues with setting boolean props on custom element, so we can't use
    //  <InsightContainer title /> without specifying an empty string value or boolean
    .add("With default title", () => <InsightContainer insight={insightIds[0]} title="" />, {
        screenshot: true,
    })
    .add(
        "All insight types",
        () => (
            <>
                {insightIds.map((id) => (
                    <InsightContainer insight={id} key={id} />
                ))}
            </>
        ),
        { screenshot: true },
    );
