// (C) 2025 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IInsightDefinition, insightMeasures, measureLocalId } from "@gooddata/sdk-model";
import { ChartFillType, PatternFillName } from "@gooddata/sdk-ui-charts";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { ReferenceWorkspaceId, StorybookBackend } from "../../../_infra/backend.js";
import { INeobackstopScenarioConfig, IStoryParameters } from "../../../_infra/backstopScenario.js";
import { ShortPostInteractionTimeout } from "../../../_infra/backstopWrapper.js";
import {
    ScreenshotReadyWrapper,
    createElementCountResolver,
} from "../../../_infra/ScreenshotReadyWrapper.js";

import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "./styles.css";

const config: INeobackstopScenarioConfig = {
    postInteractionWait: ShortPostInteractionTimeout,
    // use ScreenshotReadyWrapper, override default selector for suite "11" in backstop.json
    readySelector: ".screenshot-ready-wrapper-done",
};

const backend = StorybookBackend();

export default {
    title: "11 Configuration Controls/Colors/ChartFill",
};

const chartFillSupportedInsights = [
    ReferenceRecordings.Insights.AreaChart.TwoMeasuresWithViewBy,
    ReferenceRecordings.Insights.BarChart.TwoMeasuresWithViewBy,
    ReferenceRecordings.Insights.BulletChart.PrimaryTargetAndComparativeMeasuresWithViewByAndSort,
    ReferenceRecordings.Insights.ColumnChart.TwoMeasuresWithViewBy,
    ReferenceRecordings.Insights.ComboChart.MultiplePrimaryAndSecondaryMeasuresWithViewBy,
    ReferenceRecordings.Insights.DonutChart.SingleMeasureWithViewBy,
    ReferenceRecordings.Insights.FunnelChart.SingleMeasureWithViewBy,
    ReferenceRecordings.Insights.PyramidChart.SingleMeasureWithViewBy,
    ReferenceRecordings.Insights.PieChart.TwoMeasures,
    ReferenceRecordings.Insights.Treemap.SingleMeasureAndViewBy,
    ReferenceRecordings.Insights.Treemap.SingleMeasureViewByAndSegment, // always rendered with solid fill
    ReferenceRecordings.Insights.WaterfallChart.MultiMeasures,
];

const chartFillSupportedInsightIds = chartFillSupportedInsights.map(
    (insight) => insight.obj.insight.identifier,
);

const recordingById = new Map(
    chartFillSupportedInsights.map((insight) => [insight.obj.insight.identifier, insight]),
);

function getFirstMeasureLocalId(insight: IInsightDefinition): string | undefined {
    const measures = insightMeasures(insight);
    return measures.length > 0 ? measureLocalId(measures[0]) : undefined;
}

type MeasureToPatternNameFactory = (insightId: string) => Record<string, PatternFillName> | undefined;

function ChartFillStories({
    chartFillType,
    measureToPatternNameFactory,
}: {
    chartFillType: ChartFillType;
    measureToPatternNameFactory?: MeasureToPatternNameFactory;
}) {
    return (
        <ScreenshotReadyWrapper resolver={createElementCountResolver(chartFillSupportedInsightIds.length)}>
            {chartFillSupportedInsightIds.map((id) => (
                <div className="chart-fill-insight-container" key={id}>
                    <InsightView
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        insight={id}
                        config={{
                            chartFill: {
                                type: chartFillType,
                                ...(measureToPatternNameFactory
                                    ? { measureToPatternName: measureToPatternNameFactory(id) }
                                    : {}),
                            },
                            dataLabels: {
                                style: "backplate",
                            },
                            legend: {
                                enabled: false,
                            },
                        }}
                    />
                </div>
            ))}
        </ScreenshotReadyWrapper>
    );
}

export function AllInsightTypesWithSolidFill() {
    return <ChartFillStories chartFillType="solid" />;
}
AllInsightTypesWithSolidFill.parameters = {
    kind: "Supported insight types with solid fill",
    screenshot: config,
} satisfies IStoryParameters;

export function AllInsightTypesWithPatternFill() {
    return <ChartFillStories chartFillType="pattern" />;
}
AllInsightTypesWithPatternFill.parameters = {
    kind: "Supported insight types with pattern fill",
    screenshot: config,
} satisfies IStoryParameters;

export function AllInsightTypesWithSetPatternFill() {
    return (
        <ChartFillStories
            chartFillType="pattern"
            measureToPatternNameFactory={(insightId: string) => {
                const recording = recordingById.get(insightId);
                const firstMeasureLocalId = recording
                    ? getFirstMeasureLocalId(recording.obj as IInsightDefinition)
                    : undefined;
                if (!firstMeasureLocalId) {
                    return undefined;
                }
                return {
                    [firstMeasureLocalId]: "pizza_large",
                };
            }}
        />
    );
}
AllInsightTypesWithSetPatternFill.parameters = {
    kind: "Supported insight types with set pattern fill for the first measures",
    screenshot: config,
} satisfies IStoryParameters;

export function AllInsightTypesWithOutlineFill() {
    return <ChartFillStories chartFillType="outline" />;
}
AllInsightTypesWithOutlineFill.parameters = {
    kind: "Supported insight types with outline fill",
    screenshot: config,
} satisfies IStoryParameters;
