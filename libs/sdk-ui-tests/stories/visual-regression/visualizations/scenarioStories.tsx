// (C) 2007-2025 GoodData Corporation

import { ComponentType } from "react";

import { groupBy, sortBy } from "lodash-es";

import { withCustomWorkspaceSettings } from "@gooddata/sdk-backend-base";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ISettings } from "@gooddata/sdk-model";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-geo/styles/css/main.css";

import allScenarios from "../../../scenarios/index.js";
import { ScenarioGroup } from "../../../src/index.js";
import { StorybookBackend } from "../../_infra/backend.js";
import { ScreenshotReadyWrapper, createElementCountResolver } from "../../_infra/ScreenshotReadyWrapper.js";
import { wrapWithTheme } from "../themeWrapper.js";

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

    function Grouped() {
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
    }

    return Grouped;
}

export function withCustomSetting(backend: IAnalyticalBackend, customSettings: ISettings) {
    return withCustomWorkspaceSettings(backend, {
        commonSettingsWrapper: (settings: ISettings) => {
            return {
                ...settings,
                ...(customSettings || {}),
            };
        },
    });
}

const ScenarioGroupsByVis = Object.values(groupBy<ScenarioGroup<any>>(allScenarios, (g) => g.vis));

export function getScenariosGroupByIndexes(groupsIndex: number, groupIndex: number): ScenarioGroup<any> {
    const groups = ScenarioGroupsByVis[groupsIndex];

    const sortedGroups = sortBy(groups, (g) => g.groupNames.join("/"));

    const group = sortedGroups[groupIndex];

    const visualOnly: ScenarioGroup<any> = group.forTestTypes("visual");

    return visualOnly;
}
