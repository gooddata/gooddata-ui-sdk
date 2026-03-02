// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/GeoChart/customization/multi-layer",
};

export const AreaPrimaryWithPushpinOverlay = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(22, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "area primary with pushpin overlay",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area primary with pushpin overlay'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area primary with pushpin overlay' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaPrimaryWithPushpinOverlay.parameters = {
    kind: "area primary with pushpin overlay",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AreaPrimaryWithTwoPushpinOverlays = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(22, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "area primary with two pushpin overlays",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area primary with two pushpin overlays'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area primary with two pushpin overlays' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaPrimaryWithTwoPushpinOverlays.parameters = {
    kind: "area primary with two pushpin overlays",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const MultiLayerChartLevelSegmentMapping = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(22, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi-layer chart-level segment mapping",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'multi-layer chart-level segment mapping'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'multi-layer chart-level segment mapping' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
MultiLayerChartLevelSegmentMapping.parameters = {
    kind: "multi-layer chart-level segment mapping",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const MultiLayerPerLayerSegmentMappingOverride = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(22, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi-layer per-layer segment mapping override",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'multi-layer per-layer segment mapping override'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'multi-layer per-layer segment mapping override' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
MultiLayerPerLayerSegmentMappingOverride.parameters = {
    kind: "multi-layer per-layer segment mapping override",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
