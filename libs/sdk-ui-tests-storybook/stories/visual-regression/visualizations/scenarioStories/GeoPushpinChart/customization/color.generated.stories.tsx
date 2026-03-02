// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/GeoPushpinChart/customization/color",
};

export const PushpinChartLevelCustomSegmentMapping = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "pushpin chart-level custom segment mapping",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'pushpin chart-level custom segment mapping'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'pushpin chart-level custom segment mapping' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
PushpinChartLevelCustomSegmentMapping.parameters = {
    kind: "pushpin chart-level custom segment mapping",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const PushpinChartLevelCustomGradientPalette = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "pushpin chart-level custom gradient palette",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'pushpin chart-level custom gradient palette'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'pushpin chart-level custom gradient palette' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
PushpinChartLevelCustomGradientPalette.parameters = {
    kind: "pushpin chart-level custom gradient palette",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const PushpinSizeColorGradientAndSegment = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "pushpin size color gradient and segment",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'pushpin size color gradient and segment'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'pushpin size color gradient and segment' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
PushpinSizeColorGradientAndSegment.parameters = {
    kind: "pushpin size color gradient and segment",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
