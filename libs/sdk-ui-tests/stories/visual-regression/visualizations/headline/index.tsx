// (C) 2020 GoodData Corporation
import React from "react";

import { Headline, IChartConfig } from "@gooddata/sdk-ui-charts";
import { withCustomWorkspaceSettings } from "@gooddata/sdk-backend-base";
import { ISettings } from "@gooddata/sdk-model";
import "@gooddata/sdk-ui-charts/styles/css/main.css";

import "../insightStories.css";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { HeadlineWithTwoMeasures } from "../../../../scenarios/charts/headline/base.js";
import { CustomStories } from "../../../_infra/storyGroups.js";
import {
    ScreenshotReadyWrapper,
    createElementCountResolver,
} from "../../../_infra/ScreenshotReadyWrapper.js";
import { StorybookBackend, ReferenceWorkspaceId } from "../../../_infra/backend.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import {
    comparisonEnabled,
    HeadlinePositiveComparisonMeasures,
} from "../../../../scenarios/charts/headline/comparison.js";

const backend = StorybookBackend();

const enabledNewHeadlineBackend = withCustomWorkspaceSettings(backend, {
    commonSettingsWrapper: (settings: ISettings) => {
        return {
            ...settings,
            enableNewHeadline: true,
        };
    },
});

const config: IChartConfig = {
    enableCompactSize: true,
};

const configWithComparisonEnabled: IChartConfig = {
    comparison: comparisonEnabled,
};

storiesOf(`${CustomStories}/Headline`)
    .add(
        "responsive",
        () => (
            <ScreenshotReadyWrapper resolver={createElementCountResolver(2)}>
                <div style={{ width: 250, border: "1px solid black" }}>
                    <Headline
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        primaryMeasure={HeadlineWithTwoMeasures.primaryMeasure}
                        secondaryMeasure={HeadlineWithTwoMeasures.secondaryMeasure}
                    />
                </div>
                <div style={{ width: 150, border: "1px solid black" }}>
                    <Headline
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        primaryMeasure={HeadlineWithTwoMeasures.primaryMeasure}
                        secondaryMeasure={HeadlineWithTwoMeasures.secondaryMeasure}
                    />
                </div>
            </ScreenshotReadyWrapper>
        ),
        { screenshot: true },
    )
    .add(
        "responsive with comparison",
        () => (
            <ScreenshotReadyWrapper resolver={createElementCountResolver(2)}>
                <div style={{ width: 250, border: "1px solid black" }}>
                    <Headline
                        backend={enabledNewHeadlineBackend}
                        workspace={ReferenceWorkspaceId}
                        primaryMeasure={HeadlinePositiveComparisonMeasures.primaryMeasure}
                        secondaryMeasures={HeadlinePositiveComparisonMeasures.secondaryMeasures}
                        config={configWithComparisonEnabled}
                    />
                </div>
                <div style={{ width: 150, border: "1px solid black" }}>
                    <Headline
                        backend={enabledNewHeadlineBackend}
                        workspace={ReferenceWorkspaceId}
                        primaryMeasure={HeadlinePositiveComparisonMeasures.primaryMeasure}
                        secondaryMeasures={HeadlinePositiveComparisonMeasures.secondaryMeasures}
                        config={configWithComparisonEnabled}
                    />
                </div>
            </ScreenshotReadyWrapper>
        ),
        { screenshot: true },
    )
    .add(
        "themed",
        () =>
            wrapWithTheme(
                <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
                    <div className="dashboard-like-6">
                        <Headline
                            backend={backend}
                            workspace={ReferenceWorkspaceId}
                            primaryMeasure={HeadlineWithTwoMeasures.primaryMeasure}
                            secondaryMeasure={HeadlineWithTwoMeasures.secondaryMeasure}
                        />
                    </div>
                </ScreenshotReadyWrapper>,
            ),
        { screenshot: true },
    )
    .add(
        "themed with comparison",
        () =>
            wrapWithTheme(
                <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
                    <div className="dashboard-like-6">
                        <Headline
                            backend={enabledNewHeadlineBackend}
                            workspace={ReferenceWorkspaceId}
                            primaryMeasure={HeadlinePositiveComparisonMeasures.primaryMeasure}
                            secondaryMeasures={HeadlinePositiveComparisonMeasures.secondaryMeasures}
                            config={configWithComparisonEnabled}
                        />
                    </div>
                </ScreenshotReadyWrapper>,
            ),
        { screenshot: true },
    )
    .add(
        "compactSize",
        () => (
            <ScreenshotReadyWrapper resolver={createElementCountResolver(7)}>
                <div style={{ width: 550, height: 34, border: "1px solid black" }}>
                    <Headline
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        primaryMeasure={HeadlineWithTwoMeasures.primaryMeasure}
                        config={config}
                    />
                </div>
                <div style={{ width: 550, height: 44, border: "1px solid black" }}>
                    <Headline
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        primaryMeasure={HeadlineWithTwoMeasures.primaryMeasure}
                        config={config}
                    />
                </div>
                <div style={{ width: 550, height: 64, border: "1px solid black" }}>
                    <Headline
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        primaryMeasure={HeadlineWithTwoMeasures.primaryMeasure}
                        config={config}
                    />
                </div>

                <div style={{ width: 550, height: 100, border: "1px solid black" }}>
                    <Headline
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        primaryMeasure={HeadlineWithTwoMeasures.primaryMeasure}
                        config={config}
                    />
                </div>
                <div style={{ width: 150, height: 120, border: "1px solid black" }}>
                    <Headline
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        primaryMeasure={HeadlineWithTwoMeasures.primaryMeasure}
                        secondaryMeasure={HeadlineWithTwoMeasures.secondaryMeasure}
                        config={config}
                    />
                </div>
                <div style={{ width: 180, height: 160, border: "1px solid black" }}>
                    <Headline
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        primaryMeasure={HeadlineWithTwoMeasures.primaryMeasure}
                        secondaryMeasure={HeadlineWithTwoMeasures.secondaryMeasure}
                        config={config}
                    />
                </div>
                <div style={{ width: 150, height: 260, border: "1px solid black" }}>
                    <Headline
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        primaryMeasure={HeadlineWithTwoMeasures.primaryMeasure}
                        secondaryMeasure={HeadlineWithTwoMeasures.secondaryMeasure}
                        config={config}
                    />
                </div>
            </ScreenshotReadyWrapper>
        ),
        { screenshot: true },
    )
    .add(
        "compactSize with comparison",
        () => (
            <ScreenshotReadyWrapper resolver={createElementCountResolver(3)}>
                <div style={{ width: 150, height: 120, border: "1px solid black" }}>
                    <Headline
                        backend={enabledNewHeadlineBackend}
                        workspace={ReferenceWorkspaceId}
                        primaryMeasure={HeadlinePositiveComparisonMeasures.primaryMeasure}
                        secondaryMeasures={HeadlinePositiveComparisonMeasures.secondaryMeasures}
                        config={{ ...config, ...configWithComparisonEnabled }}
                    />
                </div>
                <div style={{ width: 180, height: 160, border: "1px solid black" }}>
                    <Headline
                        backend={enabledNewHeadlineBackend}
                        workspace={ReferenceWorkspaceId}
                        primaryMeasure={HeadlinePositiveComparisonMeasures.primaryMeasure}
                        secondaryMeasures={HeadlinePositiveComparisonMeasures.secondaryMeasures}
                        config={{ ...config, ...configWithComparisonEnabled }}
                    />
                </div>
                <div style={{ width: 150, height: 260, border: "1px solid black" }}>
                    <Headline
                        backend={enabledNewHeadlineBackend}
                        workspace={ReferenceWorkspaceId}
                        primaryMeasure={HeadlinePositiveComparisonMeasures.primaryMeasure}
                        secondaryMeasures={HeadlinePositiveComparisonMeasures.secondaryMeasures}
                        config={{ ...config, ...configWithComparisonEnabled }}
                    />
                </div>
            </ScreenshotReadyWrapper>
        ),
        { screenshot: true },
    );
