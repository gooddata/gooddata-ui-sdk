// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/GeoAreaChart/customization/legend",
};

export const AreaLegendPositionTopLeft = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "area legend position top-left",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area legend position top-left'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area legend position top-left' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaLegendPositionTopLeft.parameters = {
    kind: "area legend position top-left",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AreaLegendPositionTopRight = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "area legend position top-right",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area legend position top-right'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area legend position top-right' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaLegendPositionTopRight.parameters = {
    kind: "area legend position top-right",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AreaLegendPositionBottomLeft = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "area legend position bottom-left",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area legend position bottom-left'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area legend position bottom-left' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaLegendPositionBottomLeft.parameters = {
    kind: "area legend position bottom-left",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AreaLegendPositionBottomRight = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "area legend position bottom-right",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area legend position bottom-right'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area legend position bottom-right' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaLegendPositionBottomRight.parameters = {
    kind: "area legend position bottom-right",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AreaLegendWithSelection = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "area legend with selection");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area legend with selection'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area legend with selection' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaLegendWithSelection.parameters = {
    kind: "area legend with selection",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AreaLegendWithColorScaleOnly = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "area legend with color-scale only",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area legend with color-scale only'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area legend with color-scale only' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaLegendWithColorScaleOnly.parameters = {
    kind: "area legend with color-scale only",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AreaLegendWithCategoryAndColorScale = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "area legend with category and color-scale",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area legend with category and color-scale'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area legend with category and color-scale' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaLegendWithCategoryAndColorScale.parameters = {
    kind: "area legend with category and color-scale",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
