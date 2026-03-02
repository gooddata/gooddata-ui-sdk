// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/GeoAreaChart/customization/color",
};

export const AreaChartLevelCustomSegmentMapping = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "area chart-level custom segment mapping",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area chart-level custom segment mapping'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area chart-level custom segment mapping' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaChartLevelCustomSegmentMapping.parameters = {
    kind: "area chart-level custom segment mapping",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AreaChartLevelCustomGradientPalette = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "area chart-level custom gradient palette",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area chart-level custom gradient palette'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area chart-level custom gradient palette' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaChartLevelCustomGradientPalette.parameters = {
    kind: "area chart-level custom gradient palette",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AreaWithColorAttributeCategories = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "area with color attribute categories",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'area with color attribute categories'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'area with color attribute categories' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaWithColorAttributeCategories.parameters = {
    kind: "area with color attribute categories",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
