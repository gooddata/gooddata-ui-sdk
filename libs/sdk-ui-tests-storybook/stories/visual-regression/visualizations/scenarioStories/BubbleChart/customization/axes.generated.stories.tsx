// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    groupedStory,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/BubbleChart/customization/axes",
};

export const XAxisMinMaxConfiguration = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(2, 4).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "X axis min/max configuration");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'X axis min/max configuration'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'X axis min/max configuration' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
XAxisMinMaxConfiguration.parameters = {
    kind: "X axis min/max configuration",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const YAxisMinMaxConfiguration = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(2, 4).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "Y axis min/max configuration");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'Y axis min/max configuration'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'Y axis min/max configuration' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
YAxisMinMaxConfiguration.parameters = {
    kind: "Y axis min/max configuration",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const YAxisMaxOnlyConfiguration = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(2, 4).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "Y axis max only configuration",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'Y axis max only configuration'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'Y axis max only configuration' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
YAxisMaxOnlyConfiguration.parameters = {
    kind: "Y axis max only configuration",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAxisMaxOnlyConfiguration = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(2, 4).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "X axis max only configuration",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'X axis max only configuration'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'X axis max only configuration' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
XAxisMaxOnlyConfiguration.parameters = {
    kind: "X axis max only configuration",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAndYAxisMinMaxConfiguration = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(2, 4).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "X and Y axis min/max configuration",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'X and Y axis min/max configuration'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'X and Y axis min/max configuration' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
XAndYAxisMinMaxConfiguration.parameters = {
    kind: "X and Y axis min/max configuration",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AxisNameCustomization = () =>
    groupedStory(getScenariosGroupByIndexes(2, 5), {
        width: 800,
        height: 600,
    })();
AxisNameCustomization.parameters = {
    kind: "axis name customization",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
