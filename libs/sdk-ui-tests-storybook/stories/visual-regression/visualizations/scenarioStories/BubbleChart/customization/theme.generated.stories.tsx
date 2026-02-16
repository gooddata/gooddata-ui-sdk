// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/BubbleChart/customization/theme",
};

export const Themed = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(2, 16).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "themed");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'themed'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'themed' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
Themed.parameters = {
    kind: "themed",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        reloadAfterReady: true,
    },
} satisfies IStoryParameters;

export const Font = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(2, 16).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "font");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'font'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'font' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
Font.parameters = {
    kind: "font",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        reloadAfterReady: true,
    },
} satisfies IStoryParameters;
