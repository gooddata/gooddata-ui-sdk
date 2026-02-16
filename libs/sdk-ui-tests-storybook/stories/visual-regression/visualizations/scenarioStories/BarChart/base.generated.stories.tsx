// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/BarChart/base",
};

export const SingleMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "single measure");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'single measure'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'single measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
SingleMeasure.parameters = {
    kind: "single measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleMeasureWithViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "single measure with viewBy");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure with viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure with viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
SingleMeasureWithViewby.parameters = {
    kind: "single measure with viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleMeasureWithViewbyAndStackby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure with viewBy and stackBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure with viewBy and stackBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure with viewBy and stackBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
SingleMeasureWithViewbyAndStackby.parameters = {
    kind: "single measure with viewBy and stackBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleMeasureWithTwoViewbyAndStack = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure with two viewBy and stack",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure with two viewBy and stack'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure with two viewBy and stack' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
SingleMeasureWithTwoViewbyAndStack.parameters = {
    kind: "single measure with two viewBy and stack",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "two measures with viewBy");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
TwoMeasuresWithViewby.parameters = {
    kind: "two measures with viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithTwoViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "two measures with two viewBy");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with two viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with two viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
TwoMeasuresWithTwoViewby.parameters = {
    kind: "two measures with two viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithTwoViewbyFilteredToSingleValue = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with two viewBy, filtered to single value",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures with two viewBy, filtered to single value'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures with two viewBy, filtered to single value' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
TwoMeasuresWithTwoViewbyFilteredToSingleValue.parameters = {
    kind: "two measures with two viewBy, filtered to single value",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithViewbySortedByAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with viewBy sorted by attribute",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with viewBy sorted by attribute'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with viewBy sorted by attribute' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
TwoMeasuresWithViewbySortedByAttribute.parameters = {
    kind: "two measures with viewBy sorted by attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithViewbySortedByMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with viewBy sorted by measure",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with viewBy sorted by measure'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with viewBy sorted by measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
TwoMeasuresWithViewbySortedByMeasure.parameters = {
    kind: "two measures with viewBy sorted by measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const ViewbyDateAndPopMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "viewBy date and PoP measure");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'viewBy date and PoP measure'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'viewBy date and PoP measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
ViewbyDateAndPopMeasure.parameters = {
    kind: "viewBy date and PoP measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const ArithmeticMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "arithmetic measures");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'arithmetic measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'arithmetic measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
ArithmeticMeasures.parameters = {
    kind: "arithmetic measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const FourMeasuresAndPop = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "four measures and PoP");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'four measures and PoP'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'four measures and PoP' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
FourMeasuresAndPop.parameters = {
    kind: "four measures and PoP",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const ViewbyWithTwoDates = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "viewBy with two dates");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'viewBy with two dates'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'viewBy with two dates' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
ViewbyWithTwoDates.parameters = {
    kind: "viewBy with two dates",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const StackbyWithOneDate = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "stackBy with one date");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'stackBy with one date'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'stackBy with one date' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
StackbyWithOneDate.parameters = {
    kind: "stackBy with one date",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
