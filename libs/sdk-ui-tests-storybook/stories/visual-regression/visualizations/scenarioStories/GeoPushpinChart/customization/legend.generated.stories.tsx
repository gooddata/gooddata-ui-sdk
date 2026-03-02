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

export const LegendPositionTop = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "legend position top");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'legend position top'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'legend position top' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
LegendPositionTop.parameters = {
    kind: "legend position top",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const LegendPositionRight = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "legend position right");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'legend position right'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'legend position right' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
LegendPositionRight.parameters = {
    kind: "legend position right",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const LegendPositionBottom = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "legend position bottom");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'legend position bottom'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'legend position bottom' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
LegendPositionBottom.parameters = {
    kind: "legend position bottom",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const LegendPositionLeft = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "legend position left");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'legend position left'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'legend position left' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
LegendPositionLeft.parameters = {
    kind: "legend position left",
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
