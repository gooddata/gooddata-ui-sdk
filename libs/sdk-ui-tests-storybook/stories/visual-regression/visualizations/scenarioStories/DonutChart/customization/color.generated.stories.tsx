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
    title: "01 Stories From Test Scenarios/DonutChart/customization/color",
};

export const Coloring = () =>
    groupedStory(getScenariosGroupByIndexes(6, 4), {
        width: 800,
        height: 400,
    })();
Coloring.parameters = {
    kind: "coloring",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AssignColorToMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(6, 5).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "assign color to measures");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'assign color to measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'assign color to measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
AssignColorToMeasures.parameters = {
    kind: "assign color to measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AssignColorToAttributes = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(6, 5).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "assign color to attributes");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'assign color to attributes'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'assign color to attributes' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
AssignColorToAttributes.parameters = {
    kind: "assign color to attributes",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
