// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/GeoPushpinChart/customization/viewport",
};

export const ViewportWorld = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 4).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "viewport world");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'viewport world'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'viewport world' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
ViewportWorld.parameters = {
    kind: "viewport world",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const ViewportEurope = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 4).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "viewport europe");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'viewport europe'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'viewport europe' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
ViewportEurope.parameters = {
    kind: "viewport europe",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const ViewportNorthAmericaWithSegment = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 4).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "viewport north america with segment",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'viewport north america with segment'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'viewport north america with segment' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
ViewportNorthAmericaWithSegment.parameters = {
    kind: "viewport north america with segment",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
