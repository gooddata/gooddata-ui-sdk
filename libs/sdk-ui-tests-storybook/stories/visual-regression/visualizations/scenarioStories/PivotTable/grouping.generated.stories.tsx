// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/PivotTable/grouping",
};

export const SingleMeasurePivotWithGroupingSortedByFirstRowAttr = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 5).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure pivot with grouping sorted by first row attr",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'single measure pivot with grouping sorted by first row attr'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'single measure pivot with grouping sorted by first row attr' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
SingleMeasurePivotWithGroupingSortedByFirstRowAttr.parameters = {
    kind: "single measure pivot with grouping sorted by first row attr",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasurePivotWithGroupingSortedBySecondRowAttr = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 5).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure pivot with grouping sorted by second row attr",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'single measure pivot with grouping sorted by second row attr'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'single measure pivot with grouping sorted by second row attr' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
SingleMeasurePivotWithGroupingSortedBySecondRowAttr.parameters = {
    kind: "single measure pivot with grouping sorted by second row attr",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasurePivotWithGroupingSortedByMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 5).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure pivot with grouping sorted by measure",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure pivot with grouping sorted by measure'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'single measure pivot with grouping sorted by measure' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
SingleMeasurePivotWithGroupingSortedByMeasure.parameters = {
    kind: "single measure pivot with grouping sorted by measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;
