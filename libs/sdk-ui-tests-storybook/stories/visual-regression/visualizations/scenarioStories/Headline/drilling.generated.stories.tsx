// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/Headline/drilling",
};

export const MultiMeasuresWithDrillingOnSingleMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi measures with drilling on single measure",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'multi measures with drilling on single measure'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'multi measures with drilling on single measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
MultiMeasuresWithDrillingOnSingleMeasure.parameters = {
    kind: "multi measures with drilling on single measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const MultiMeasuresWithDrillingOnSingleMeasureWithUnderliningDisabled = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi measures with drilling on single measure with underlining disabled",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'multi measures with drilling on single measure with underlining disabled'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'multi measures with drilling on single measure with underlining disabled' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
MultiMeasuresWithDrillingOnSingleMeasureWithUnderliningDisabled.parameters = {
    kind: "multi measures with drilling on single measure with underlining disabled",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const MultiMeasuresWithDrillingOnTwoMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi measures with drilling on two measures",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'multi measures with drilling on two measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'multi measures with drilling on two measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
MultiMeasuresWithDrillingOnTwoMeasures.parameters = {
    kind: "multi measures with drilling on two measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const MultiMeasuresWithDrillingOnTwoMeasuresWithUnderliningDisabled = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi measures with drilling on two measures with underlining disabled",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'multi measures with drilling on two measures with underlining disabled'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'multi measures with drilling on two measures with underlining disabled' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
MultiMeasuresWithDrillingOnTwoMeasuresWithUnderliningDisabled.parameters = {
    kind: "multi measures with drilling on two measures with underlining disabled",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const MultiMeasuresWithDrillingOnThreeMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi measures with drilling on three measures",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'multi measures with drilling on three measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'multi measures with drilling on three measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
MultiMeasuresWithDrillingOnThreeMeasures.parameters = {
    kind: "multi measures with drilling on three measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const MultiMeasuresWithDrillingOnThreeMeasuresWithUnderliningDisabled = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi measures with drilling on three measures with underlining disabled",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'multi measures with drilling on three measures with underlining disabled'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'multi measures with drilling on three measures with underlining disabled' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
MultiMeasuresWithDrillingOnThreeMeasuresWithUnderliningDisabled.parameters = {
    kind: "multi measures with drilling on three measures with underlining disabled",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const ComparisonWithDrillingOnTwoMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "comparison with drilling on two measures",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'comparison with drilling on two measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'comparison with drilling on two measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithDrillingOnTwoMeasures.parameters = {
    kind: "comparison with drilling on two measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const ComparisonWithDrillingOnTwoMeasuresWithUnderliningDisabled = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "comparison with drilling on two measures with underlining disabled",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'comparison with drilling on two measures with underlining disabled'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'comparison with drilling on two measures with underlining disabled' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithDrillingOnTwoMeasuresWithUnderliningDisabled.parameters = {
    kind: "comparison with drilling on two measures with underlining disabled",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;
