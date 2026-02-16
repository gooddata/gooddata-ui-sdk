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
    title: "01 Stories From Test Scenarios/BarChart/customization/axes",
};

export const XAxisMinMaxConfiguration = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 3).asScenarioDescAndScenario();
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

export const XAxisOnTop = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "X axis on top");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'X axis on top'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'X axis on top' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
XAxisOnTop.parameters = {
    kind: "X axis on top",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DualAxisWithOneTopMeasureAndThreeBottom = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "dual axis with one top measure and three bottom",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'dual axis with one top measure and three bottom'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'dual axis with one top measure and three bottom' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
DualAxisWithOneTopMeasureAndThreeBottom.parameters = {
    kind: "dual axis with one top measure and three bottom",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DualAxisWhenTwoViewbyAttributes = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "dual axis when two viewBy attributes",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'dual axis when two viewBy attributes'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'dual axis when two viewBy attributes' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
DualAxisWhenTwoViewbyAttributes.parameters = {
    kind: "dual axis when two viewBy attributes",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const YAxisRotation = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 3).asScenarioDescAndScenario();
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

export const YAxisInvisible = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "Y axis invisible");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'Y axis invisible'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'Y axis invisible' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
YAxisInvisible.parameters = {
    kind: "Y axis invisible",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAxisOnTopWithTwoViewbyAttributes = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "X axis on top with two viewBy attributes",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'X axis on top with two viewBy attributes'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'X axis on top with two viewBy attributes' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
XAxisOnTopWithTwoViewbyAttributes.parameters = {
    kind: "X axis on top with two viewBy attributes",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleAxisNameCustomization = () =>
    groupedStory(getScenariosGroupByIndexes(1, 4), {
        width: 800,
        height: 600,
    })();
SingleAxisNameCustomization.parameters = {
    kind: "single axis name customization",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DualAxisNameCustomization = () =>
    groupedStory(getScenariosGroupByIndexes(1, 5), {
        width: 800,
        height: 600,
    })();
DualAxisNameCustomization.parameters = {
    kind: "dual axis name customization",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DualAxisLabelRotation = () =>
    groupedStory(getScenariosGroupByIndexes(1, 6), {
        width: 800,
        height: 600,
    })();
DualAxisLabelRotation.parameters = {
    kind: "dual axis label rotation",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
