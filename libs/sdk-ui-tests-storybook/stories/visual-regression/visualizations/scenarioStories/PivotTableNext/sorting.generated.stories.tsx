// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/PivotTableNext/sorting",
};

export const SingleMeasurePivotSortedByFirstRowAttr = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 10).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure pivot sorted by first row attr",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure pivot sorted by first row attr'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure pivot sorted by first row attr' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
SingleMeasurePivotSortedByFirstRowAttr.parameters = {
    kind: "single measure pivot sorted by first row attr",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasurePivotSortedBySecondRowAttr = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 10).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure pivot sorted by second row attr",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure pivot sorted by second row attr'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure pivot sorted by second row attr' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
SingleMeasurePivotSortedBySecondRowAttr.parameters = {
    kind: "single measure pivot sorted by second row attr",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithSingleRowAttrSortedByFirstMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 10).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with single row attr sorted by first measure",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures with single row attr sorted by first measure'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures with single row attr sorted by first measure' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasuresWithSingleRowAttrSortedByFirstMeasure.parameters = {
    kind: "two measures with single row attr sorted by first measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithSingleRowAttrSortedBySecondMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 10).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with single row attr sorted by second measure",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures with single row attr sorted by second measure'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures with single row attr sorted by second measure' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasuresWithSingleRowAttrSortedBySecondMeasure.parameters = {
    kind: "two measures with single row attr sorted by second measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasurePivotSortedByFirstAndSecondRowAttr = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 10).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure pivot sorted by first and second row attr",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'single measure pivot sorted by first and second row attr'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'single measure pivot sorted by first and second row attr' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
SingleMeasurePivotSortedByFirstAndSecondRowAttr.parameters = {
    kind: "single measure pivot sorted by first and second row attr",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;
