// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/GeoPushpinChart/customization/legend",
};

export const LegendPositionTopLeft = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "legend position top-left");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'legend position top-left'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'legend position top-left' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
LegendPositionTopLeft.parameters = {
    kind: "legend position top-left",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const LegendPositionTopRight = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "legend position top-right");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'legend position top-right'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'legend position top-right' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
LegendPositionTopRight.parameters = {
    kind: "legend position top-right",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const LegendPositionBottomLeft = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "legend position bottom-left");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'legend position bottom-left'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'legend position bottom-left' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
LegendPositionBottomLeft.parameters = {
    kind: "legend position bottom-left",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const LegendPositionBottomRight = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "legend position bottom-right");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'legend position bottom-right'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'legend position bottom-right' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
LegendPositionBottomRight.parameters = {
    kind: "legend position bottom-right",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const LegendWithSelection = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "legend with selection");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'legend with selection'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'legend with selection' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
LegendWithSelection.parameters = {
    kind: "legend with selection",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const LegendSizeColorScaleAndCategory = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "legend size color-scale and category",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'legend size color-scale and category'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'legend size color-scale and category' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
LegendSizeColorScaleAndCategory.parameters = {
    kind: "legend size color-scale and category",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const LegendCategoryEdgeCaseWithEmptyRegions = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "legend category edge case with empty regions",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'legend category edge case with empty regions'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'legend category edge case with empty regions' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
LegendCategoryEdgeCaseWithEmptyRegions.parameters = {
    kind: "legend category edge case with empty regions",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
