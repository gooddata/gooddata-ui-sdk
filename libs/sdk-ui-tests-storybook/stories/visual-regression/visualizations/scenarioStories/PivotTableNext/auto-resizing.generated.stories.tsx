// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/PivotTableNext/auto-resizing",
};

export const WithColumnAttributesOnlyAndAutoResizing = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "with column attributes only and auto-resizing",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'with column attributes only and auto-resizing'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'with column attributes only and auto-resizing' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1200, height: 800 }, scenario.tags)();
    })();
WithColumnAttributesOnlyAndAutoResizing.parameters = {
    kind: "with column attributes only and auto-resizing",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const WithSmallPageAndAutoResizing = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "with small page and auto-resizing",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'with small page and auto-resizing'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'with small page and auto-resizing' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1200, height: 800 }, scenario.tags)();
    })();
WithSmallPageAndAutoResizing.parameters = {
    kind: "with small page and auto-resizing",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const WithTwoMeasuresAndRowAttributeWithAutoResizing = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "with two measures and row attribute with auto-resizing",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'with two measures and row attribute with auto-resizing'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'with two measures and row attribute with auto-resizing' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1200, height: 800 }, scenario.tags)();
    })();
WithTwoMeasuresAndRowAttributeWithAutoResizing.parameters = {
    kind: "with two measures and row attribute with auto-resizing",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const WithTwoMeasuresAndRowAttributeWithAutoResizingAndGrowToFit = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "with two measures and row attribute with auto-resizing and grow to fit",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'with two measures and row attribute with auto-resizing and grow to fit'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'with two measures and row attribute with auto-resizing and grow to fit' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1200, height: 800 }, scenario.tags)();
    })();
WithTwoMeasuresAndRowAttributeWithAutoResizingAndGrowToFit.parameters = {
    kind: "with two measures and row attribute with auto-resizing and grow to fit",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const WithTwoMeasuresGrandTotalsAndSubtotalsWithAutoResizing = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "with two measures, grand totals and subtotals with auto-resizing",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'with two measures, grand totals and subtotals with auto-resizing'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'with two measures, grand totals and subtotals with auto-resizing' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1200, height: 800 }, scenario.tags)();
    })();
WithTwoMeasuresGrandTotalsAndSubtotalsWithAutoResizing.parameters = {
    kind: "with two measures, grand totals and subtotals with auto-resizing",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const WithTwoMeasuresGrandTotalsAndSubtotalsWithAutoResizingAndGrowToFit = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) =>
                name === "with two measures, grand totals and subtotals with auto-resizing and grow to fit",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'with two measures, grand totals and subtotals with auto-resizing and grow to fit'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'with two measures, grand totals and subtotals with auto-resizing and grow to fit' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1200, height: 800 }, scenario.tags)();
    })();
WithTwoMeasuresGrandTotalsAndSubtotalsWithAutoResizingAndGrowToFit.parameters = {
    kind: "with two measures, grand totals and subtotals with auto-resizing and grow to fit",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;
