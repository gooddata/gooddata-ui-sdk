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
    title: "01 Stories From Test Scenarios/DependencyWheelChart/customization/color",
};

export const Coloring = () =>
    groupedStory(getScenariosGroupByIndexes(16, 3), {
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

export const AssignColorToNodes = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(16, 4).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "assign color to nodes");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'assign color to nodes'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'assign color to nodes' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
AssignColorToNodes.parameters = {
    kind: "assign color to nodes",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
