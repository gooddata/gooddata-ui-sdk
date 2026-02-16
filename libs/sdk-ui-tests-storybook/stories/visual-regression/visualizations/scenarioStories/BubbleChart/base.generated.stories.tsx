// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/BubbleChart/base",
};

export const XAxisMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(2, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "x axis measure");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'x axis measure'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'x axis measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
XAxisMeasure.parameters = {
    kind: "x axis measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAxisMeasureWithViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(2, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "x axis measure with viewBy");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'x axis measure with viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'x axis measure with viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
XAxisMeasureWithViewby.parameters = {
    kind: "x axis measure with viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAxisAndSizeMeasuresWithViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(2, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "x axis and size measures with viewBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'x axis and size measures with viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'x axis and size measures with viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
XAxisAndSizeMeasuresWithViewby.parameters = {
    kind: "x axis and size measures with viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAndYAxisMeasuresWithViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(2, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "x and y axis measures with viewBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'x and y axis measures with viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'x and y axis measures with viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
XAndYAxisMeasuresWithViewby.parameters = {
    kind: "x and y axis measures with viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAndYAxisAndSizeMeasuresWithViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(2, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "x and y axis and size measures with viewBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'x and y axis and size measures with viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'x and y axis and size measures with viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
XAndYAxisAndSizeMeasuresWithViewby.parameters = {
    kind: "x and y axis and size measures with viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const YAxisAndSizeMeasuresWithViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(2, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "y axis and size measures with viewBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'y axis and size measures with viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'y axis and size measures with viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
YAxisAndSizeMeasuresWithViewby.parameters = {
    kind: "y axis and size measures with viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const ArithmeticMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(2, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "arithmetic measure");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'arithmetic measure'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'arithmetic measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ArithmeticMeasure.parameters = {
    kind: "arithmetic measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAndYAxisAndSizeMeasuresWithViewbyAndSortedByAttr = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(2, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "x and y axis and size measures with viewBy and sorted by attr",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'x and y axis and size measures with viewBy and sorted by attr'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'x and y axis and size measures with viewBy and sorted by attr' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
XAndYAxisAndSizeMeasuresWithViewbyAndSortedByAttr.parameters = {
    kind: "x and y axis and size measures with viewBy and sorted by attr",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAndYAxisAndSizeMeasuresWithViewbyWithNullsInData = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(2, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "x and y axis and size measures with viewBy with nulls in data",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'x and y axis and size measures with viewBy with nulls in data'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'x and y axis and size measures with viewBy with nulls in data' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
XAndYAxisAndSizeMeasuresWithViewbyWithNullsInData.parameters = {
    kind: "x and y axis and size measures with viewBy with nulls in data",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
