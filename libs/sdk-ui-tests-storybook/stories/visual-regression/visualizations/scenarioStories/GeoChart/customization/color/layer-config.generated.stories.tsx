// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/GeoChart/customization/color/layer-config",
};

export const AreaLayerLevelSegmentMappingOverridesChartLevel = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(22, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "area layer-level segment mapping overrides chart-level",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'area layer-level segment mapping overrides chart-level'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'area layer-level segment mapping overrides chart-level' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaLayerLevelSegmentMappingOverridesChartLevel.parameters = {
    kind: "area layer-level segment mapping overrides chart-level",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const AreaLayerLevelGradientPaletteOverridesChartLevel = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(22, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "area layer-level gradient palette overrides chart-level",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'area layer-level gradient palette overrides chart-level'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'area layer-level gradient palette overrides chart-level' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
AreaLayerLevelGradientPaletteOverridesChartLevel.parameters = {
    kind: "area layer-level gradient palette overrides chart-level",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const PushpinLayerLevelSegmentMappingOverridesChartLevel = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(22, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "pushpin layer-level segment mapping overrides chart-level",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'pushpin layer-level segment mapping overrides chart-level'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'pushpin layer-level segment mapping overrides chart-level' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
PushpinLayerLevelSegmentMappingOverridesChartLevel.parameters = {
    kind: "pushpin layer-level segment mapping overrides chart-level",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const PushpinLayerLevelGradientPaletteOverridesChartLevel = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(22, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "pushpin layer-level gradient palette overrides chart-level",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'pushpin layer-level gradient palette overrides chart-level'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'pushpin layer-level gradient palette overrides chart-level' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
PushpinLayerLevelGradientPaletteOverridesChartLevel.parameters = {
    kind: "pushpin layer-level gradient palette overrides chart-level",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const MultiLayerBothInheritChartLevelColors = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(22, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi-layer both inherit chart-level colors",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'multi-layer both inherit chart-level colors'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'multi-layer both inherit chart-level colors' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
MultiLayerBothInheritChartLevelColors.parameters = {
    kind: "multi-layer both inherit chart-level colors",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const MultiLayerPushpinOverrideOnly = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(22, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi-layer pushpin override only",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'multi-layer pushpin override only'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'multi-layer pushpin override only' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
MultiLayerPushpinOverrideOnly.parameters = {
    kind: "multi-layer pushpin override only",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const MultiLayerAreaOverrideOnly = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(22, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi-layer area override only",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'multi-layer area override only'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'multi-layer area override only' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
MultiLayerAreaOverrideOnly.parameters = {
    kind: "multi-layer area override only",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const MultiLayerBothLayerOverridesWithConflictingChartFallback = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(22, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multi-layer both layer overrides with conflicting chart fallback",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'multi-layer both layer overrides with conflicting chart fallback'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'multi-layer both layer overrides with conflicting chart fallback' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
MultiLayerBothLayerOverridesWithConflictingChartFallback.parameters = {
    kind: "multi-layer both layer overrides with conflicting chart fallback",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
