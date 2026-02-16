// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/PivotTable/transposition",
};

export const SingleMeasurePivotWithBothAttributesAndMetricsInRows = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 14).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure pivot with both attributes and metrics in rows",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'single measure pivot with both attributes and metrics in rows'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'single measure pivot with both attributes and metrics in rows' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
SingleMeasurePivotWithBothAttributesAndMetricsInRows.parameters = {
    kind: "single measure pivot with both attributes and metrics in rows",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithSingleRowAttrWithMetricsInRows = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 14).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with single row attr with metrics in rows",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures with single row attr with metrics in rows'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures with single row attr with metrics in rows' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasuresWithSingleRowAttrWithMetricsInRows.parameters = {
    kind: "two measures with single row attr with metrics in rows",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndMultipleColumnRowSubtotalsWithMetricsInRows = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 14).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and multiple column/row subtotals with metrics in rows",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures and multiple column/row subtotals with metrics in rows'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures and multiple column/row subtotals with metrics in rows' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasuresAndMultipleColumnRowSubtotalsWithMetricsInRows.parameters = {
    kind: "two measures and multiple column/row subtotals with metrics in rows",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const MultipleMeasuresAndNoColumnsWithTotals = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 14).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multiple measures and no columns, with totals",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'multiple measures and no columns, with totals'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'multiple measures and no columns, with totals' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
MultipleMeasuresAndNoColumnsWithTotals.parameters = {
    kind: "multiple measures and no columns, with totals",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const MultipleMeasuresAndNoRowsWithTotals = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 14).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multiple measures and no rows, with totals",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'multiple measures and no rows, with totals'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'multiple measures and no rows, with totals' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
MultipleMeasuresAndNoRowsWithTotals.parameters = {
    kind: "multiple measures and no rows, with totals",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const MultipleMeasuresAndRowAttributesWithMetricsInRowsWithDrilling = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 14).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multiple measures and row attributes with metrics in rows, with drilling",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'multiple measures and row attributes with metrics in rows, with drilling'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'multiple measures and row attributes with metrics in rows, with drilling' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
MultipleMeasuresAndRowAttributesWithMetricsInRowsWithDrilling.parameters = {
    kind: "multiple measures and row attributes with metrics in rows, with drilling",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresInRowsAndOnlyColumnAttrsOnLeft = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 14).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures in rows and only column attrs on left",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures in rows and only column attrs on left'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures in rows and only column attrs on left' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasuresInRowsAndOnlyColumnAttrsOnLeft.parameters = {
    kind: "two measures in rows and only column attrs on left",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresInRowsAndOnlyColumnAttrsOnLeftWithDrilling = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 14).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures in rows and only column attrs on left, with drilling",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures in rows and only column attrs on left, with drilling'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures in rows and only column attrs on left, with drilling' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasuresInRowsAndOnlyColumnAttrsOnLeftWithDrilling.parameters = {
    kind: "two measures in rows and only column attrs on left, with drilling",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresInRowsAndColumnAttrsOnTopWithInvalidDrillingOnAttributes = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 14).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) =>
                name === "two measures in rows and column attrs on top, with invalid drilling on attributes",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures in rows and column attrs on top, with invalid drilling on attributes'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures in rows and column attrs on top, with invalid drilling on attributes' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasuresInRowsAndColumnAttrsOnTopWithInvalidDrillingOnAttributes.parameters = {
    kind: "two measures in rows and column attrs on top, with invalid drilling on attributes",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresInRowsAndColumnAttrsOnTopWithDrillingOnMetrics = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 14).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures in rows and column attrs on top, with drilling on metrics",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures in rows and column attrs on top, with drilling on metrics'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures in rows and column attrs on top, with drilling on metrics' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasuresInRowsAndColumnAttrsOnTopWithDrillingOnMetrics.parameters = {
    kind: "two measures in rows and column attrs on top, with drilling on metrics",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresInRowsAndColumnAttrsOnLeftWithTotals = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 14).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures in rows and column attrs on left, with totals",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures in rows and column attrs on left, with totals'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures in rows and column attrs on left, with totals' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasuresInRowsAndColumnAttrsOnLeftWithTotals.parameters = {
    kind: "two measures in rows and column attrs on left, with totals",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresInRowsAndOnlyColumnAttrsOnLeftWithTotals = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 14).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures in rows and only column attrs on left, with totals",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures in rows and only column attrs on left, with totals'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures in rows and only column attrs on left, with totals' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TwoMeasuresInRowsAndOnlyColumnAttrsOnLeftWithTotals.parameters = {
    kind: "two measures in rows and only column attrs on left, with totals",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;
