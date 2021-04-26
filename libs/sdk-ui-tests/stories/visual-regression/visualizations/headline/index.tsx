// (C) 2020 GoodData Corporation
import { storiesOf } from "@storybook/react";
import React from "react";
import { Headline } from "@gooddata/sdk-ui-charts";
import { HeadlineWithTwoMeasures } from "../../../../scenarios/charts/headline/base";
import { withScreenshot } from "../../../_infra/backstopWrapper";
import { CustomStories } from "../../../_infra/storyGroups";
import { ScreenshotReadyWrapper, createElementCountResolver } from "../../../_infra/ScreenshotReadyWrapper";

import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "../insightStories.css";
import { StorybookBackend, ReferenceWorkspaceId } from "../../../_infra/backend";
import { wrapWithTheme } from "../../themeWrapper";

const backend = StorybookBackend();

const config = {
    enableCompactSize: true,
};

storiesOf(`${CustomStories}/Headline`, module)
    .add("responsive", () =>
        withScreenshot(
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
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("themed", () =>
        withScreenshot(
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
        ),
    )
    .add("compactSize", () =>
        withScreenshot(
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
            </ScreenshotReadyWrapper>,
        ),
    );
