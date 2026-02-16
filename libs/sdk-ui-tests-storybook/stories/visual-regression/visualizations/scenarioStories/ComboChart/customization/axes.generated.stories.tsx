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
    title: "01 Stories From Test Scenarios/ComboChart/customization/axes",
};

export const DualAxisTwoMeasuresWithSlicing = () =>
    groupedStory(getScenariosGroupByIndexes(5, 7), {
        width: 800,
        height: 400,
    })();
DualAxisTwoMeasuresWithSlicing.parameters = {
    kind: "dual axis two measures with slicing",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DualAxisTwoMeasuresWithoutSlicing = () =>
    groupedStory(getScenariosGroupByIndexes(5, 8), {
        width: 800,
        height: 400,
    })();
DualAxisTwoMeasuresWithoutSlicing.parameters = {
    kind: "dual axis two measures without slicing",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DualAxisMultipleMeasuresWithSlicing = () =>
    groupedStory(getScenariosGroupByIndexes(5, 9), {
        width: 800,
        height: 400,
    })();
DualAxisMultipleMeasuresWithSlicing.parameters = {
    kind: "dual axis multiple measures with slicing",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DualAxisMultipleMeasuresWithoutSlicing = () =>
    groupedStory(getScenariosGroupByIndexes(5, 10), {
        width: 800,
        height: 400,
    })();
DualAxisMultipleMeasuresWithoutSlicing.parameters = {
    kind: "dual axis multiple measures without slicing",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AxisNameConfiguration = () =>
    groupedStory(getScenariosGroupByIndexes(5, 11), {
        width: 800,
        height: 400,
    })();
AxisNameConfiguration.parameters = {
    kind: "axis name configuration",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DualAxisDisabled = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(5, 12).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "dual axis disabled");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'dual axis disabled'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'dual axis disabled' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
DualAxisDisabled.parameters = {
    kind: "dual axis disabled",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
