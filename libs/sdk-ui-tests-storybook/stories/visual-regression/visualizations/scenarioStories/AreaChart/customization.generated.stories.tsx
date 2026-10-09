// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    groupedStory,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/AreaChart/customization",
};

export const LegendPosition = () =>
    groupedStory(getScenariosGroupByIndexes(0, 1), {
        width: 800,
        height: 400,
    })();
LegendPosition.parameters = {
    kind: "legend position",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DataLabels = () =>
    groupedStory(getScenariosGroupByIndexes(0, 2), {
        width: 800,
        height: 400,
    })();
DataLabels.parameters = {
    kind: "data labels",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DataPoints = () =>
    groupedStory(getScenariosGroupByIndexes(0, 3), {
        width: 800,
        height: 400,
    })();
DataPoints.parameters = {
    kind: "data points",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const LineShapeDefault = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(0, 4).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "line shape - default");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'line shape - default'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'line shape - default' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
LineShapeDefault.parameters = {
    kind: "line shape - default",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const LineShapeLinear = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(0, 4).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "line shape - linear");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'line shape - linear'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'line shape - linear' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
LineShapeLinear.parameters = {
    kind: "line shape - linear",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const LineShapeSpline = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(0, 4).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "line shape - spline");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'line shape - spline'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'line shape - spline' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
LineShapeSpline.parameters = {
    kind: "line shape - spline",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const LineShapeStepped = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(0, 4).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "line shape - stepped");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'line shape - stepped'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'line shape - stepped' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
LineShapeStepped.parameters = {
    kind: "line shape - stepped",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
