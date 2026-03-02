// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/GeoChart/customization/multi-layer/clusters",
};

export const AreaWithClusteredPushpinOverlay = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(22, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "area with clustered pushpin overlay",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area with clustered pushpin overlay'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area with clustered pushpin overlay' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaWithClusteredPushpinOverlay.parameters = {
    kind: "area with clustered pushpin overlay",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AreaWithNonClusteredPushpinOverlay = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(22, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "area with non-clustered pushpin overlay",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area with non-clustered pushpin overlay'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area with non-clustered pushpin overlay' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaWithNonClusteredPushpinOverlay.parameters = {
    kind: "area with non-clustered pushpin overlay",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
