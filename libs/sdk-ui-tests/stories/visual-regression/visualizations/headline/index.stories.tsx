// (C) 2020-2025 GoodData Corporation

import { Headline, IChartConfig } from "@gooddata/sdk-ui-charts";
import "@gooddata/sdk-ui-charts/styles/css/main.css";

import { HeadlineWithThreeMeasures } from "../../../../scenarios/charts/headline/base.js";
import {
    HeadlinePositiveComparisonMeasures,
    comparisonEnabled,
} from "../../../../scenarios/charts/headline/comparison.js";
import { ReferenceWorkspaceId, StorybookBackend } from "../../../_infra/backend.js";
import {
    ScreenshotReadyWrapper,
    createElementCountResolver,
} from "../../../_infra/ScreenshotReadyWrapper.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import "../insightStories.css";

const backend = StorybookBackend();

const config: IChartConfig = {
    enableCompactSize: true,
};

const configWithComparisonEnabled: IChartConfig = {
    comparison: comparisonEnabled,
};

export default {
    title: "02 Custom Test Stories/Headline",
};

export function ResponsiveWithComparison() {
    return (
        <ScreenshotReadyWrapper resolver={createElementCountResolver(2)}>
            <div style={{ width: 250, border: "1px solid black" }}>
                <Headline
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    primaryMeasure={HeadlinePositiveComparisonMeasures.primaryMeasure}
                    secondaryMeasures={HeadlinePositiveComparisonMeasures.secondaryMeasures}
                    config={configWithComparisonEnabled}
                />
            </div>
            <div style={{ width: 150, border: "1px solid black" }}>
                <Headline
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    primaryMeasure={HeadlinePositiveComparisonMeasures.primaryMeasure}
                    secondaryMeasures={HeadlinePositiveComparisonMeasures.secondaryMeasures}
                    config={configWithComparisonEnabled}
                />
            </div>
        </ScreenshotReadyWrapper>
    );
}
ResponsiveWithComparison.parameters = { kind: "responsive with comparison", screenshot: true };

export function ResponsiveWithMultiMeasures() {
    return (
        <ScreenshotReadyWrapper resolver={createElementCountResolver(2)}>
            <div style={{ width: 250, border: "1px solid black" }}>
                <Headline
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    primaryMeasure={HeadlineWithThreeMeasures.primaryMeasure}
                    secondaryMeasures={HeadlineWithThreeMeasures.secondaryMeasures}
                />
            </div>
            <div style={{ width: 150, border: "1px solid black" }}>
                <Headline
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    primaryMeasure={HeadlineWithThreeMeasures.primaryMeasure}
                    secondaryMeasures={HeadlineWithThreeMeasures.secondaryMeasures}
                />
            </div>
        </ScreenshotReadyWrapper>
    );
}
ResponsiveWithMultiMeasures.parameters = { kind: "responsive with multi measures", screenshot: true };

export const ThemedWithComparison = () =>
    wrapWithTheme(
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <div className="dashboard-like-6">
                <Headline
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    primaryMeasure={HeadlinePositiveComparisonMeasures.primaryMeasure}
                    secondaryMeasures={HeadlinePositiveComparisonMeasures.secondaryMeasures}
                    config={configWithComparisonEnabled}
                />
            </div>
        </ScreenshotReadyWrapper>,
    );
ThemedWithComparison.parameters = { kind: "themed with comparison", screenshot: true };

export const ThemedWithMultiMeasure = () =>
    wrapWithTheme(
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <div className="dashboard-like-6">
                <Headline
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    primaryMeasure={HeadlineWithThreeMeasures.primaryMeasure}
                    secondaryMeasures={HeadlineWithThreeMeasures.secondaryMeasures}
                    config={configWithComparisonEnabled}
                />
            </div>
        </ScreenshotReadyWrapper>,
    );
ThemedWithMultiMeasure.parameters = { kind: "themed with multi measure", screenshot: true };

export function CompactSizeWithComparison() {
    return (
        <ScreenshotReadyWrapper resolver={createElementCountResolver(3)}>
            <div style={{ width: 150, height: 120, border: "1px solid black" }}>
                <Headline
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    primaryMeasure={HeadlinePositiveComparisonMeasures.primaryMeasure}
                    secondaryMeasures={HeadlinePositiveComparisonMeasures.secondaryMeasures}
                    config={{ ...config, ...configWithComparisonEnabled }}
                />
            </div>
            <div style={{ width: 180, height: 160, border: "1px solid black" }}>
                <Headline
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    primaryMeasure={HeadlinePositiveComparisonMeasures.primaryMeasure}
                    secondaryMeasures={HeadlinePositiveComparisonMeasures.secondaryMeasures}
                    config={{ ...config, ...configWithComparisonEnabled }}
                />
            </div>
            <div style={{ width: 150, height: 260, border: "1px solid black" }}>
                <Headline
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    primaryMeasure={HeadlinePositiveComparisonMeasures.primaryMeasure}
                    secondaryMeasures={HeadlinePositiveComparisonMeasures.secondaryMeasures}
                    config={{ ...config, ...configWithComparisonEnabled }}
                />
            </div>
        </ScreenshotReadyWrapper>
    );
}
CompactSizeWithComparison.parameters = { kind: "compactSize with comparison", screenshot: true };

export function CompactsizeWithMultiMeasure() {
    return (
        <ScreenshotReadyWrapper resolver={createElementCountResolver(3)}>
            <div style={{ width: 150, height: 120, border: "1px solid black" }}>
                <Headline
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    primaryMeasure={HeadlineWithThreeMeasures.primaryMeasure}
                    secondaryMeasures={HeadlineWithThreeMeasures.secondaryMeasures}
                    config={config}
                />
            </div>
            <div style={{ width: 180, height: 160, border: "1px solid black" }}>
                <Headline
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    primaryMeasure={HeadlineWithThreeMeasures.primaryMeasure}
                    secondaryMeasures={HeadlineWithThreeMeasures.secondaryMeasures}
                    config={config}
                />
            </div>
            <div style={{ width: 150, height: 260, border: "1px solid black" }}>
                <Headline
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    primaryMeasure={HeadlineWithThreeMeasures.primaryMeasure}
                    secondaryMeasures={HeadlineWithThreeMeasures.secondaryMeasures}
                    config={config}
                />
            </div>
        </ScreenshotReadyWrapper>
    );
}
CompactsizeWithMultiMeasure.parameters = { kind: "compactSize with multi measure", screenshot: true };
