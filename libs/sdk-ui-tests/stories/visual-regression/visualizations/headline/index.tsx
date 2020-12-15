// (C) 2020 GoodData Corporation
import { storiesOf } from "@storybook/react";
import React from "react";
import { Headline } from "@gooddata/sdk-ui-charts";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";
import { HeadlineWithTwoMeasures } from "../../../../scenarios/charts/headline/base";
import { withScreenshot } from "../../../_infra/backstopWrapper";
import { CustomStories } from "../../../_infra/storyGroups";
import { ScreenshotReadyWrapper, createElementCountResolver } from "../../../_infra/ScreenshotReadyWrapper";

import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "../insightStories.css";
import { StorybookBackend, ReferenceWorkspaceId } from "../../../_infra/backend";

const backend = StorybookBackend({
    theme: {
        kpi: {
            primaryMeasureColor: "#f00",
            secondaryInfoColor: "#00f",
        },
    },
});

storiesOf(`${CustomStories}/Headline`, module)
    .add("themed", () =>
        withScreenshot(
            <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
                <ThemeProvider backend={backend} workspace={ReferenceWorkspaceId}>
                    <div className="dashboard-like-6">
                        <Headline
                            backend={backend}
                            workspace={ReferenceWorkspaceId}
                            primaryMeasure={HeadlineWithTwoMeasures.primaryMeasure}
                            secondaryMeasure={HeadlineWithTwoMeasures.secondaryMeasure}
                        />
                    </div>
                </ThemeProvider>
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("responsive", () =>
        withScreenshot(
            <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
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
    );
