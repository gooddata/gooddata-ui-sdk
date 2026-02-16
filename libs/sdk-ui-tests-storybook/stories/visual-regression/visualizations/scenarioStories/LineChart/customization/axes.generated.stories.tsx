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
    title: "01 Stories From Test Scenarios/LineChart/customization/axes",
};

export const YAxisMinMaxConfiguration = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 7).asScenarioDescAndScenario();
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

export const YAxisOnTheRight = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 7).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "Y axis on the right");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'Y axis on the right'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'Y axis on the right' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
YAxisOnTheRight.parameters = {
    kind: "Y axis on the right",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DualAxesWithOneRightMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 7).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "dual axes with one right measure",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'dual axes with one right measure'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'dual axes with one right measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
DualAxesWithOneRightMeasure.parameters = {
    kind: "dual axes with one right measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleAxisNameConfiguration = () =>
    groupedStory(getScenariosGroupByIndexes(11, 8), {
        width: 800,
        height: 400,
    })();
SingleAxisNameConfiguration.parameters = {
    kind: "single axis name configuration",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DualAxisNameConfiguration = () =>
    groupedStory(getScenariosGroupByIndexes(11, 9), {
        width: 800,
        height: 400,
    })();
DualAxisNameConfiguration.parameters = {
    kind: "dual axis name configuration",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
