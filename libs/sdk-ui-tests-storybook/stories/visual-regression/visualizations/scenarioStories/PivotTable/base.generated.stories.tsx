// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/PivotTable/base",
};

export const SingleAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "single attribute");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single attribute'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single attribute' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
SingleAttribute.parameters = {
    kind: "single attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleColumn = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "single column");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'single column'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'single column' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
SingleColumn.parameters = {
    kind: "single column",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "single measure");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'single measure'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'single measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
SingleMeasure.parameters = {
    kind: "single measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasureWithRowAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure with row attribute",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure with row attribute'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure with row attribute' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
SingleMeasureWithRowAttribute.parameters = {
    kind: "single measure with row attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasureWithColumnAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure with column attribute",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure with column attribute'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure with column attribute' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
SingleMeasureWithColumnAttribute.parameters = {
    kind: "single measure with column attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasureWithRowAndColumnAttributes = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure with row and column attributes",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure with row and column attributes'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure with row and column attributes' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
SingleMeasureWithRowAndColumnAttributes.parameters = {
    kind: "single measure with row and column attributes",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasureWithTwoRowAndOneColumnAttributes = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure with two row and one column attributes",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'single measure with two row and one column attributes'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'single measure with two row and one column attributes' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
SingleMeasureWithTwoRowAndOneColumnAttributes.parameters = {
    kind: "single measure with two row and one column attributes",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasureWithTwoRowAndTwoColumnAttributes = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure with two row and two column attributes",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'single measure with two row and two column attributes'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'single measure with two row and two column attributes' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
SingleMeasureWithTwoRowAndTwoColumnAttributes.parameters = {
    kind: "single measure with two row and two column attributes",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "two measures");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'two measures'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'two measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasures.parameters = {
    kind: "two measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithRowAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with row attribute",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with row attribute'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with row attribute' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasuresWithRowAttribute.parameters = {
    kind: "two measures with row attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithColumnAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with column attribute",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with column attribute'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with column attribute' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasuresWithColumnAttribute.parameters = {
    kind: "two measures with column attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithRowAndColumnAttributes = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with row and column attributes",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with row and column attributes'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with row and column attributes' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasuresWithRowAndColumnAttributes.parameters = {
    kind: "two measures with row and column attributes",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithTwoRowAndOneColumnAttributes = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with two row and one column attributes",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with two row and one column attributes'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with two row and one column attributes' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasuresWithTwoRowAndOneColumnAttributes.parameters = {
    kind: "two measures with two row and one column attributes",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithTwoRowAndTwoColumnAttributes = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with two row and two column attributes",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with two row and two column attributes'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with two row and two column attributes' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasuresWithTwoRowAndTwoColumnAttributes.parameters = {
    kind: "two measures with two row and two column attributes",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithThreeRowsAndTwoColumnAttributes = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with three rows and two column attributes",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures with three rows and two column attributes'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures with three rows and two column attributes' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasuresWithThreeRowsAndTwoColumnAttributes.parameters = {
    kind: "two measures with three rows and two column attributes",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const EmptyValues = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "empty values");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'empty values'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'empty values' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
EmptyValues.parameters = {
    kind: "empty values",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const ArithmeticMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "arithmetic measures");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'arithmetic measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'arithmetic measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
ArithmeticMeasures.parameters = {
    kind: "arithmetic measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const WithAttributesWithoutMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "with attributes without measures",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'with attributes without measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'with attributes without measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
WithAttributesWithoutMeasures.parameters = {
    kind: "with attributes without measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const WithTwoSameDates = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "with two same dates");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'with two same dates'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'with two same dates' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
WithTwoSameDates.parameters = {
    kind: "with two same dates",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const OneMeasureAndRepeatingRowAttributesOnDifferentPositions = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "one measure and repeating row attributes on different positions",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'one measure and repeating row attributes on different positions'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'one measure and repeating row attributes on different positions' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
OneMeasureAndRepeatingRowAttributesOnDifferentPositions.parameters = {
    kind: "one measure and repeating row attributes on different positions",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;
