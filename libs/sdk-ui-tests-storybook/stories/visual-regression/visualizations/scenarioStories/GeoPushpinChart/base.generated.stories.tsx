// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/GeoPushpinChart/base",
};

export const LatitudeLongitudeWithSizeAndColor = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "latitude/longitude with size and color",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'latitude/longitude with size and color'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'latitude/longitude with size and color' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
LatitudeLongitudeWithSizeAndColor.parameters = {
    kind: "latitude/longitude with size and color",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const LatitudeLongitudeWithColorAndSegment = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "latitude/longitude with color and segment",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'latitude/longitude with color and segment'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'latitude/longitude with color and segment' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
LatitudeLongitudeWithColorAndSegment.parameters = {
    kind: "latitude/longitude with color and segment",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const LatitudeLongitudeWithColorAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "latitude/longitude with color attribute",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'latitude/longitude with color attribute'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'latitude/longitude with color attribute' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
LatitudeLongitudeWithColorAttribute.parameters = {
    kind: "latitude/longitude with color attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
