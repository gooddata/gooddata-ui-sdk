// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/GeoAreaChart/base",
};

export const AreaWithColorGradient = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "area with color gradient");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area with color gradient'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area with color gradient' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaWithColorGradient.parameters = {
    kind: "area with color gradient",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AreaWithColorAndSegment = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "area with color and segment");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area with color and segment'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area with color and segment' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaWithColorAndSegment.parameters = {
    kind: "area with color and segment",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AreaWithColorAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "area with color attribute");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area with color attribute'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area with color attribute' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaWithColorAttribute.parameters = {
    kind: "area with color attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
