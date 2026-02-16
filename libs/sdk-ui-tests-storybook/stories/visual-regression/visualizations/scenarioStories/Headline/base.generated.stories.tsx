// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/Headline/base",
};

export const MultiMeasuresWithOnlyPrimaryMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi measures with only primary measure",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'multi measures with only primary measure'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'multi measures with only primary measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
MultiMeasuresWithOnlyPrimaryMeasure.parameters = {
    kind: "multi measures with only primary measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const MultiMeasuresWithTwoMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi measures with two measures",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'multi measures with two measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'multi measures with two measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
MultiMeasuresWithTwoMeasures.parameters = {
    kind: "multi measures with two measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const MultiMeasuresWithThreeMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi measures with three measures",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'multi measures with three measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'multi measures with three measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
MultiMeasuresWithThreeMeasures.parameters = {
    kind: "multi measures with three measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const MultiMeasuresWithTwoMeasuresOnePop = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi measures with two measures one PoP",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'multi measures with two measures one PoP'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'multi measures with two measures one PoP' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
MultiMeasuresWithTwoMeasuresOnePop.parameters = {
    kind: "multi measures with two measures one PoP",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const MultiMeasuresWithTwoMeasuresWithGermanSeparators = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi measures with two measures with german separators",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'multi measures with two measures with german separators'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'multi measures with two measures with german separators' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
MultiMeasuresWithTwoMeasuresWithGermanSeparators.parameters = {
    kind: "multi measures with two measures with german separators",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithComparison = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "two measures with comparison");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with comparison'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with comparison' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
TwoMeasuresWithComparison.parameters = {
    kind: "two measures with comparison",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;
