// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/GeoAreaChart/customization/viewport",
};

export const AreaViewportNorthAmerica = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "area viewport north america");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area viewport north america'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area viewport north america' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaViewportNorthAmerica.parameters = {
    kind: "area viewport north america",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AreaViewportWorld = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "area viewport world");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area viewport world'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area viewport world' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaViewportWorld.parameters = {
    kind: "area viewport world",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
