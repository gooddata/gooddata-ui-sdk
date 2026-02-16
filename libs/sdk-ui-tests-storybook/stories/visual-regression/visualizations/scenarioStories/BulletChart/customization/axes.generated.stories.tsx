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
    title: "01 Stories From Test Scenarios/BulletChart/customization/axes",
};

export const XAxisMinMaxConfiguration = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 3).asScenarioDescAndScenario();
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

export const XAxisMaxOnlyConfiguration = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 3).asScenarioDescAndScenario();
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

export const XAxisHidden = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "X axis hidden");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'X axis hidden'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'X axis hidden' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
XAxisHidden.parameters = {
    kind: "X axis hidden",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const YAxisHidden = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "Y axis hidden");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'Y axis hidden'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'Y axis hidden' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
YAxisHidden.parameters = {
    kind: "Y axis hidden",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const YAxisRotation = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "Y axis rotation");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'Y axis rotation'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'Y axis rotation' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
YAxisRotation.parameters = {
    kind: "Y axis rotation",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAxisRotation = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "X axis rotation");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'X axis rotation'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'X axis rotation' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
XAxisRotation.parameters = {
    kind: "X axis rotation",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AxisNameCustomization = () =>
    groupedStory(getScenariosGroupByIndexes(3, 4), {
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
