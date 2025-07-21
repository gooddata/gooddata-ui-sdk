// (C) 2007-2025 GoodData Corporation
import { createElementCountResolver, ScreenshotReadyWrapper } from "../../_infra/ScreenshotReadyWrapper.js";
import { ComponentType } from "react";

import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import { ISettings } from "@gooddata/sdk-model";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { withCustomWorkspaceSettings } from "@gooddata/sdk-backend-base";

import { ScenarioGroup } from "../../../src/index.js";
import { StorybookBackend } from "../../_infra/backend.js";
import { wrapWithTheme } from "../themeWrapper.js";

import allScenarios from "../../../scenarios/index.js";
import groupBy from "lodash/groupBy.js";
import sortBy from "lodash/sortBy.js";
import values from "lodash/values.js";

export const backend = StorybookBackend();

export function buildStory(Component: ComponentType, props: any, wrapperStyle: any, tags: string[] = []) {
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

export function groupedStory(group: ScenarioGroup<any>, wrapperStyle: any) {
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

export function withCustomSetting(backend: IAnalyticalBackend, customSettings: ISettings) {
    return withCustomWorkspaceSettings(backend, {
        commonSettingsWrapper: (settings: ISettings) => {
            return {
                ...settings,
                ...(customSettings ? customSettings : {}),
            };
        },
    });
}

const ScenarioGroupsByVis = values(groupBy<ScenarioGroup<any>>(allScenarios, (g) => g.vis));

export function getScenariosGroupByIndexes(groupsIndex: number, groupIndex: number): ScenarioGroup<any> {
    const groups = ScenarioGroupsByVis[groupsIndex];

    const sortedGroups = sortBy(groups, (g) => g.groupNames.join("/"));

    const group = sortedGroups[groupIndex];

    return group.forTestTypes("visual");
}
