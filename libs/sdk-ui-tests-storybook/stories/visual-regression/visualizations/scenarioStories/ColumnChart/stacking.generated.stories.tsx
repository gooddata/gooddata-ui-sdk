// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/ColumnChart/stacking",
};

export const TwoMeasuresAndTwoViewbyWithStackmeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 24).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and two viewBy with stackMeasures",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures and two viewBy with stackMeasures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures and two viewBy with stackMeasures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndTwoViewbyWithStackmeasures.parameters = {
    kind: "two measures and two viewBy with stackMeasures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndTwoViewbyWithStackmeasurestopercent = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 24).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and two viewBy with stackMeasuresToPercent",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures and two viewBy with stackMeasuresToPercent'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures and two viewBy with stackMeasuresToPercent' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndTwoViewbyWithStackmeasurestopercent.parameters = {
    kind: "two measures and two viewBy with stackMeasuresToPercent",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndTwoViewbyWithRightAxisAndStackmeasurestopercent = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 24).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and two viewBy with right axis and stackMeasuresToPercent",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures and two viewBy with right axis and stackMeasuresToPercent'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures and two viewBy with right axis and stackMeasuresToPercent' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndTwoViewbyWithRightAxisAndStackmeasurestopercent.parameters = {
    kind: "two measures and two viewBy with right axis and stackMeasuresToPercent",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const StackMeasuresTo100WithAndAxisMinMax = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 24).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "Stack measures to 100% with and axis min/max",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'Stack measures to 100% with and axis min/max'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'Stack measures to 100% with and axis min/max' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
StackMeasuresTo100WithAndAxisMinMax.parameters = {
    kind: "Stack measures to 100% with and axis min/max",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithDualAxisIgnoresStackMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 24).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with dual axis ignores stack measures",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with dual axis ignores stack measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with dual axis ignores stack measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
TwoMeasuresWithDualAxisIgnoresStackMeasures.parameters = {
    kind: "two measures with dual axis ignores stack measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithDualAxisAndStackMeasuresTo100 = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 24).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with dual axis and stack measures to 100%",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures with dual axis and stack measures to 100%'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures with dual axis and stack measures to 100%' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
TwoMeasuresWithDualAxisAndStackMeasuresTo100.parameters = {
    kind: "two measures with dual axis and stack measures to 100%",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const StackMeasuresAndDualAxis = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 24).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "stack measures and dual axis");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'stack measures and dual axis'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'stack measures and dual axis' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
StackMeasuresAndDualAxis.parameters = {
    kind: "stack measures and dual axis",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const StackMeasuresTo100AndDualAxis = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 24).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "stack measures to 100% and dual axis",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'stack measures to 100% and dual axis'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'stack measures to 100% and dual axis' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
StackMeasuresTo100AndDualAxis.parameters = {
    kind: "stack measures to 100% and dual axis",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const StackMeasuresTo100WithDualAxisAndAxisMinMax = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 24).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "stack measures to 100% with dual axis and axis min/max",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'stack measures to 100% with dual axis and axis min/max'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'stack measures to 100% with dual axis and axis min/max' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
StackMeasuresTo100WithDualAxisAndAxisMinMax.parameters = {
    kind: "stack measures to 100% with dual axis and axis min/max",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleMeasureIgnoresStackMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 24).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure ignores stack measures",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure ignores stack measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure ignores stack measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
SingleMeasureIgnoresStackMeasures.parameters = {
    kind: "single measure ignores stack measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleMeasureWithStackTo100 = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 24).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure with stack to 100%",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure with stack to 100%'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure with stack to 100%' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
SingleMeasureWithStackTo100.parameters = {
    kind: "single measure with stack to 100%",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
