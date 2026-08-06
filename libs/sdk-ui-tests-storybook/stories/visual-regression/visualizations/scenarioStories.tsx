// (C) 2007-2026 GoodData Corporation

import { type ComponentType } from "react";

import { groupBy, sortBy } from "lodash-es";
import { action } from "storybook/actions";

import { withCustomWorkspaceSettings } from "@gooddata/sdk-backend-base";
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type ISettings } from "@gooddata/sdk-model";
import { type ScenarioGroup, allScenarios, isScenarioAction } from "@gooddata/sdk-ui-tests-scenarios";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { StorybookBackend } from "../../_infra/backend.js";
import { ScreenshotReadyWrapper, createElementCountResolver } from "../../_infra/ScreenshotReadyWrapper.js";
import { wrapWithTheme } from "../themeWrapper.js";

export const backend = StorybookBackend();

/**
 * Scenario props are storybook-free; handlers that should be reported to storybook are described by action
 * placeholders (see `scenarioAction` in sdk-ui-tests-scenarios). This resolves each of them into a real
 * storybook action, so that the events end up in the storybook actions panel.
 */
function resolveScenarioActions(props: Record<string, unknown>): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(props)) {
        resolved[key] = isScenarioAction(value) ? action(value.scenarioActionLabel) : value;
    }

    return resolved;
}

export function buildStory(Component: ComponentType, props: any, wrapperStyle: any, tags: string[] = []) {
    const resolvedProps = resolveScenarioActions(props);

    return () => {
        return wrapWithTheme(
            <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
                <div style={wrapperStyle}>
                    <Component {...resolvedProps} />
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
                    const props = resolveScenarioActions(
                        propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType),
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
