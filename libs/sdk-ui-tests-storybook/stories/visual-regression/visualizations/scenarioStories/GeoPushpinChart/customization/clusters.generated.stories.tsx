// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/GeoPushpinChart/customization/clusters",
};

export const ClusteredPoints = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "clustered points");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'clustered points'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'clustered points' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
ClusteredPoints.parameters = {
    kind: "clustered points",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const NonClusteredPoints = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "non-clustered points");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'non-clustered points'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'non-clustered points' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
NonClusteredPoints.parameters = {
    kind: "non-clustered points",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
