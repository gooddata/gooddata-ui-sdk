// (C) 2007-2018 GoodData Corporation
import { createHighChartResolver, ScreenshotReadyWrapper } from "../_infra/ScreenshotReadyWrapper";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import chartGroups from "../../../scenarios";
import { ScenarioGroup } from "../../../src";

import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { withScreenshot } from "../_infra/backstopWrapper";
import { ScenarioStories } from "../_infra/storyGroups";
import { StorybookBackend } from "../_infra/backend";
import groupBy = require("lodash/groupBy");

const DefaultWrapperStyle = { width: 800, height: 400 };

const backend = StorybookBackend();
const ScenarioGroupsByVis = Object.entries(groupBy<ScenarioGroup<any>>(chartGroups, g => g.vis));

function simpleStory(Component: React.ComponentType, props: any, wrapperStyle: any) {
    return () => {
        return withScreenshot(
            <div style={wrapperStyle}>
                <Component {...props} />
            </div>,
        );
    };
}

function groupedStory(group: ScenarioGroup<any>, wrapperStyle: any) {
    const scenarios = group.asScenarioDescAndScenario();

    return () => {
        return withScreenshot(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(scenarios.length)}>
                {scenarios.map(([name, scenario], idx) => {
                    const { propsFactory, workspaceType, component: Component } = scenario;
                    const props = propsFactory(backend, workspaceType);

                    return (
                        <div key={idx}>
                            <div className="storybook-title">{name}</div>
                            <div style={wrapperStyle} className="screenshot-container">
                                <Component {...props} />
                            </div>
                        </div>
                    );
                })}
            </ScreenshotReadyWrapper>,
        );
    };
}

ScenarioGroupsByVis.forEach(([vis, groups]) => {
    const storiesForChart = storiesOf(`${ScenarioStories}/${vis}`, module);

    for (const group of groups) {
        // only interested in scenarios for visual regression
        const visualOnly: ScenarioGroup<any> = group.forTestTypes("visual");

        if (visualOnly.isEmpty()) {
            // it is completely valid that some groups have no scenarios for visual regression
            continue;
        }

        // group may specify the size for its screenshots; if not there, use the default
        const wrapperStyle = group.testConfig.visual.screenshotSize || DefaultWrapperStyle;

        if (group.testConfig.visual.groupUnder) {
            // group may specify, that the scenarios should be grouped under a single story
            storiesForChart.add(group.testConfig.visual.groupUnder, groupedStory(visualOnly, wrapperStyle));
        } else {
            // otherwise there will be story-per-scenario
            const scenarios = visualOnly.asScenarioDescAndScenario();

            scenarios.forEach(([name, scenario]) => {
                const { propsFactory, workspaceType, component: Component } = scenario;
                const props = propsFactory(backend, workspaceType);

                storiesForChart.add(name, simpleStory(Component, props, wrapperStyle));
            });
        }
    }
});
