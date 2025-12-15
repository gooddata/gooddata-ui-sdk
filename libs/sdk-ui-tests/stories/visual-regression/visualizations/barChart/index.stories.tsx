// (C) 2020-2025 GoodData Corporation

import { BarChart, type IBarChartProps } from "@gooddata/sdk-ui-charts";
import "@gooddata/sdk-ui-charts/styles/css/main.css";

import {
    BarChartWithArithmeticMeasuresAndViewBy,
    BarChartWithLargeLegend,
    BarChartWithTwoMeasuresAndTwoViewBy,
} from "../../../../scenarios/charts/barChart/base.js";
import { ReferenceWorkspaceId, StorybookBackend } from "../../../_infra/backend.js";
import { type IStoryParameters } from "../../../_infra/backstopScenario.js";
import {
    ScreenshotReadyWrapper,
    createElementCountResolver,
} from "../../../_infra/ScreenshotReadyWrapper.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import "../insightStories.css";
import "./zoomButtonFix.css";

const backend = StorybookBackend();

function BarChartTest(config: Partial<IBarChartProps> = {}) {
    return (
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
}

function BarChartZoomTest(config: Partial<IBarChartProps> = {}) {
    return (
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
}

function BarChartWithHierarchicalLabelsTest(config: Partial<IBarChartProps> = {}) {
    return (
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
}

function BarChartAutoDataLabelsTest(config: Partial<IBarChartProps> = {}) {
    return (
        <div
            style={{
                width: 800,
                height: 800,
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
                    dataLabels: {
                        visible: true,
                        totalsVisible: true,
                        style: "auto",
                    },
                }}
                {...config}
            />
        </div>
    );
}

function BarChartBackplatedDataLabelsTest(config: Partial<IBarChartProps> = {}) {
    return (
        <div
            style={{
                width: 800,
                height: 800,
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
                    dataLabels: {
                        visible: true,
                        totalsVisible: true,
                        style: "backplate",
                    },
                }}
                {...config}
            />
        </div>
    );
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "02 Custom Test Stories/BarChart",
};

export function ResponsivePopupLegend() {
    return (
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <BarChartTest />
        </ScreenshotReadyWrapper>
    );
}
ResponsivePopupLegend.parameters = {
    kind: "responsive popup legend",
    screenshots: {
        closed: { readySelector: ".screenshot-ready-wrapper-done" },
        menuLegendClick: {
            readySelector: ".screenshot-ready-wrapper-done",
            clickSelector: ".s-legend-popup-icon",
            postInteractionWait: 300,
        },
        paginatorClick: {
            readySelector: ".screenshot-ready-wrapper-done",
            clickSelectors: [".s-legend-popup-icon", 200, ".gd-icon-chevron-right"],
            postInteractionWait: 300,
        },
    },
} satisfies IStoryParameters;

export const ThemedPopupLegend = () =>
    wrapWithTheme(
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <BarChartTest />
        </ScreenshotReadyWrapper>,
    );
ThemedPopupLegend.parameters = {
    kind: "themed popup legend",
    screenshots: {
        closed: { readySelector: ".screenshot-ready-wrapper-done" },
        menuLegendClick: {
            readySelector: ".screenshot-ready-wrapper-done",
            clickSelector: ".s-legend-popup-icon",
            postInteractionWait: 300,
        },
    },
} satisfies IStoryParameters;

export function HidingOfHierarchicalAxisLabels() {
    return (
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <BarChartWithHierarchicalLabelsTest />
        </ScreenshotReadyWrapper>
    );
}
HidingOfHierarchicalAxisLabels.parameters = {
    kind: "hiding of hierarchical axis labels",
    screenshot: { readySelector: ".screenshot-ready-wrapper-done" },
} satisfies IStoryParameters;

export function ZoomingEnabled() {
    return <BarChartZoomTest />;
}
ZoomingEnabled.parameters = { kind: "zooming enabled" } satisfies IStoryParameters;

export function BackplateDataLabels() {
    return (
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <BarChartBackplatedDataLabelsTest />
        </ScreenshotReadyWrapper>
    );
}

BackplateDataLabels.parameters = {
    kind: "backplate data labels",
    screenshot: { readySelector: ".screenshot-ready-wrapper-done" },
} satisfies IStoryParameters;

export const ThemedDataLabels = () =>
    wrapWithTheme(
        <ScreenshotReadyWrapper resolver={createElementCountResolver(2)}>
            <BarChartAutoDataLabelsTest />
            <BarChartBackplatedDataLabelsTest />
        </ScreenshotReadyWrapper>,
        ["themed", "dataLabels"],
    );
ThemedDataLabels.parameters = {
    kind: "themed data labels",
    screenshot: { readySelector: ".screenshot-ready-wrapper-done" },
} satisfies IStoryParameters;
