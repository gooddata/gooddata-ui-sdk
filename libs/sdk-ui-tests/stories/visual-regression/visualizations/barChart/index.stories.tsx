// (C) 2020-2025 GoodData Corporation
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { StorybookBackend, ReferenceWorkspaceId } from "../../../_infra/backend.js";

import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "../insightStories.css";
import "./zoomButtonFix.css";
import {
    BarChartWithArithmeticMeasuresAndViewBy,
    BarChartWithLargeLegend,
    BarChartWithTwoMeasuresAndTwoViewBy,
} from "../../../../scenarios/charts/barChart/base.js";
import {
    createElementCountResolver,
    ScreenshotReadyWrapper,
} from "../../../_infra/ScreenshotReadyWrapper.js";
import { wrapWithTheme } from "../../themeWrapper.js";

const backend = StorybookBackend();

const BarChartTest = (config: Partial<IBarChartProps> = {}) => (
    <div
        style={{
            width: 400,
            height: 400,
            padding: 10,
            border: "solid 1px #000000",
            resize: "both",
            overflow: "auto",
        }}
        className="s-table"
    >
        <BarChart
            backend={backend}
            workspace={ReferenceWorkspaceId}
            measures={BarChartWithLargeLegend.measures}
            stackBy={BarChartWithLargeLegend.stackBy}
            filters={BarChartWithLargeLegend.filters}
            config={{
                legend: {
                    position: "top",
                    responsive: "autoPositionWithPopup",
                },
            }}
            {...config}
        />
    </div>
);

const BarChartZoomTest = (config: Partial<IBarChartProps> = {}) => (
    <div
        style={{
            width: 400,
            height: 400,
            padding: 10,
            border: "solid 1px #000000",
            resize: "both",
            overflow: "auto",
        }}
        className="s-table"
    >
        <BarChart
            backend={backend}
            workspace={ReferenceWorkspaceId}
            measures={BarChartWithArithmeticMeasuresAndViewBy.measures.slice(0, 1)}
            viewBy={BarChartWithArithmeticMeasuresAndViewBy.viewBy}
            config={{
                legend: {
                    position: "top",
                    responsive: "autoPositionWithPopup",
                },
                zoomInsight: true,
            }}
            {...config}
        />
    </div>
);

const BarChartWithHierarchicalLabelsTest = (config: Partial<IBarChartProps> = {}) => (
    <div
        style={{
            width: 400,
            height: 134,
            padding: 10,
            border: "solid 1px #000000",
            resize: "both",
            overflow: "auto",
        }}
        className="s-table"
    >
        <BarChart
            backend={backend}
            workspace={ReferenceWorkspaceId}
            measures={BarChartWithTwoMeasuresAndTwoViewBy.measures}
            viewBy={BarChartWithTwoMeasuresAndTwoViewBy.viewBy}
            config={{
                legend: {
                    position: "top",
                    responsive: "autoPositionWithPopup",
                },
                enableCompactSize: true,
            }}
            {...config}
        />
    </div>
);

export default {
    title: "02 Custom Test Stories/BarChart",
};

export const ResponsivePopupLegend = () => (
    <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
        <BarChartTest />
    </ScreenshotReadyWrapper>
);
ResponsivePopupLegend.parameters = {
    kind: "responsive popup legend",
    screenshots: {
        closed: {},
        menuLegendClick: {
            clickSelector: ".s-legend-popup-icon",
            postInteractionWait: 300,
        },
        paginatorClick: {
            clickSelectors: [".s-legend-popup-icon", 200, ".gd-icon-chevron-right"],
            postInteractionWait: 300,
        },
    },
};

export const ThemedPopupLegend = () =>
    wrapWithTheme(
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <BarChartTest />
        </ScreenshotReadyWrapper>,
    );
ThemedPopupLegend.parameters = {
    kind: "themed popup legend",
    screenshots: {
        closed: {},
        menuLegendClick: {
            clickSelector: ".s-legend-popup-icon",
            postInteractionWait: 300,
        },
    },
};

export const HidingOfHierarchicalAxisLabels = () => (
    <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
        <BarChartWithHierarchicalLabelsTest />
    </ScreenshotReadyWrapper>
);
HidingOfHierarchicalAxisLabels.parameters = { kind: "hiding of hierarchical axis labels", screenshot: true };

export const ZoomingEnabled = () => <BarChartZoomTest />;
ZoomingEnabled.parameters = { kind: "zooming enabled" };
