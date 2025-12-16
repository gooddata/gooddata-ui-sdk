// (C) 2022-2025 GoodData Corporation

import { useEffect, useRef, useState } from "react";

import { ReferenceRecordings } from "@gooddata/reference-workspace";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
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

// eslint-disable-next-line no-restricted-exports
export default {
    title: "13 Web Components/Insight",
};
export function Base() {
    return <InsightContainer insight={insightIds[15]} />;
}

Base.parameters = {
    kind: "Base",
    screenshot: { misMatchThreshold: 0.01 },
} satisfies IStoryParameters;

export function WithLocalization() {
    return <InsightContainer insight={insightIds[15]} locale="fr-FR" />;
}
WithLocalization.parameters = {
    kind: "With localization",
    screenshot: { misMatchThreshold: 0.01 },
} satisfies IStoryParameters;

export function WithCustomTitle() {
    return <InsightContainer insight={insightIds[15]} title="Custom title" />;
}
WithCustomTitle.parameters = {
    kind: "With custom title",
    screenshot: { misMatchThreshold: 0.01 },
} satisfies IStoryParameters;

// JSX+React has issues with setting boolean props on custom element, so we can't use
//  <InsightContainer title /> without specifying an empty string value or boolean
export function WithDefaultTitle() {
    return <InsightContainer insight={insightIds[15]} title="" />;
}
WithDefaultTitle.parameters = {
    kind: "With default title",
    screenshot: { misMatchThreshold: 0.01 },
} satisfies IStoryParameters;

// Expected counts: 17 charts + 1 pivot + 2 headlines = 20 visualizations
const EXPECTED_VIS_COUNT = 20;

function AllInsightsTracker({ ids }: { ids: string[] }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [allReady, setAllReady] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setWebComponentsContext(() => {
            setIsLoaded(true);
        });
    }, []);

    // Poll for actual rendered visualization elements
    useEffect(() => {
        if (!isLoaded || !containerRef.current) {
            return;
        }

        const checkVisualizations = () => {
            const container = containerRef.current;
            if (!container) {
                return false;
            }

            // Count actual rendered visualizations
            const charts = container.querySelectorAll(".highcharts-container").length;
            const pivots = container.querySelectorAll(".s-pivot-table").length;
            const pivotsNext = container.querySelectorAll("[data-testid='pivot-table-next']").length;
            const agGrid = container.querySelectorAll(".ag-root-wrapper").length;
            const headlines = container.querySelectorAll(".s-headline-primary-item").length;

            const total = charts + Math.max(pivots, pivotsNext, agGrid) + headlines;
            return total >= EXPECTED_VIS_COUNT;
        };

        const interval = setInterval(() => {
            if (checkVisualizations()) {
                setAllReady(true);
                clearInterval(interval);
            }
        }, 200);

        return () => clearInterval(interval);
    }, [isLoaded]);

    return (
        <div ref={containerRef} className={allReady ? "all-insights-ready" : undefined}>
            {isLoaded
                ? ids.map((id) => (
                      // @ts-expect-error Unrecognised tag
                      <gd-insight style={{ height: 500 }} insight={id} key={id} />
                  ))
                : "Loading..."}
        </div>
    );
}

export function AllInsightTypes() {
    return <AllInsightsTracker ids={insightIds} />;
}
AllInsightTypes.parameters = {
    kind: "All insight types",
    screenshot: {
        // Wait for all insights to finish loading
        readySelector: { selector: ".all-insights-ready", state: State.Attached },
        misMatchThreshold: 0.06,
    },
} satisfies IStoryParameters;
