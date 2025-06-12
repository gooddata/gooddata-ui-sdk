// (C) 2007-2018 GoodData Corporation
import { createElementCountResolver, ScreenshotReadyWrapper } from "../../_infra/ScreenshotReadyWrapper.js";
import React from "react";
import groupBy from "lodash/groupBy.js";
import sortBy from "lodash/sortBy.js";
import values from "lodash/values.js";

import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import { ISettings } from "@gooddata/sdk-model";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { withCustomWorkspaceSettings } from "@gooddata/sdk-backend-base";

import allScenarios from "../../../scenarios/index.js";
import { ScenarioGroup } from "../../../src/index.js";
import { StorybookBackend } from "../../_infra/backend.js";
import { storyGroupFor } from "./storyGroupFactory.js";
import { ScenarioStories } from "../../_infra/storyGroups.js";
import { wrapWithTheme } from "../themeWrapper.js";

const DefaultWrapperStyle = { width: 800, height: 400 };

const backend = StorybookBackend();
const ScenarioGroupsByVis = values(groupBy<ScenarioGroup<any>>(allScenarios, (g) => g.vis));

function buildStory(Component: React.ComponentType, props: any, wrapperStyle: any, tags: string[] = []) {
    return () => {
        return wrapWithTheme(
            <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
                <div style={wrapperStyle}>
                    <Component {...props} />
                </div>
            </ScreenshotReadyWrapper>,
            tags,
        );
    };
}

function groupedStory(group: ScenarioGroup<any>, wrapperStyle: any) {
    const scenarios = group.asScenarioDescAndScenario();

    return function Grouped() {
        return (
            <ScreenshotReadyWrapper resolver={createElementCountResolver(scenarios.length)}>
                {scenarios.map(([name, scenario], idx) => {
                    const { propsFactory, workspaceType, component: Component } = scenario;
                    const props = propsFactory(
                        withCustomSetting(backend, scenario.backendSettings),
                        workspaceType,
                    );

                    return (
                        <div key={idx}>
                            <div className="storybook-title">{name}</div>
                            <div style={wrapperStyle} className="screenshot-container">
                                <Component {...props} />
                            </div>
                        </div>
                    );
                })}
            </ScreenshotReadyWrapper>
        );
    };
}

function withCustomSetting(backend: IAnalyticalBackend, customSettings: ISettings) {
    return withCustomWorkspaceSettings(backend, {
        commonSettingsWrapper: (settings: ISettings) => {
            return {
                ...settings,
                ...(customSettings ? customSettings : {}),
            };
        },
    });
}

ScenarioGroupsByVis.forEach((groups) => {
    /*
     * Sort groups; the order in which stories for the group are created is important as that is the order
     * in which the groups appear in storybook.
     */
    const sortedGroups = sortBy(groups, (g) => g.groupNames.join("/"));

    for (const group of sortedGroups) {
        const storiesForChart = storyGroupFor(ScenarioStories, group);
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
            storiesForChart.add(group.testConfig.visual.groupUnder, groupedStory(visualOnly, wrapperStyle), {
                screenshot: true,
            });
        } else {
            // otherwise there will be story-per-scenario
            const scenarios = visualOnly.asScenarioDescAndScenario();

            scenarios.forEach(([name, scenario]) => {
                const { propsFactory, workspaceType, component: Component } = scenario;
                const props = propsFactory(
                    withCustomSetting(backend, scenario.backendSettings),
                    workspaceType,
                );

                storiesForChart.add(name, buildStory(Component, props, wrapperStyle, scenario.tags), {
                    screenshot: true,
                });
            });
        }
    }
});
