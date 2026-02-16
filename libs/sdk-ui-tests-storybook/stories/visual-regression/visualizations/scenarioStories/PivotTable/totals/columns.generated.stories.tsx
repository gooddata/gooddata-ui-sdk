// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/PivotTable/totals/columns",
};

export const SingleMeasureAndSingleColumnGrandTotal = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 11).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure and single column grand total",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure and single column grand total'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure and single column grand total' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
SingleMeasureAndSingleColumnGrandTotal.parameters = {
    kind: "single measure and single column grand total",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasureAndMultipleColumnGrandTotals = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 11).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure and multiple column grand totals",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure and multiple column grand totals'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure and multiple column grand totals' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
SingleMeasureAndMultipleColumnGrandTotals.parameters = {
    kind: "single measure and multiple column grand totals",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndSingleColumnGrandTotalForOne = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 11).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and single column grand total for one",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures and single column grand total for one'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures and single column grand total for one' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndSingleColumnGrandTotalForOne.parameters = {
    kind: "two measures and single column grand total for one",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndSingleColumnGrandTotalForEach = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 11).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and single column grand total for each",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures and single column grand total for each'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures and single column grand total for each' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndSingleColumnGrandTotalForEach.parameters = {
    kind: "two measures and single column grand total for each",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndMultipleColumnGrandTotalsForEach = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 11).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and multiple column grand totals for each",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures and multiple column grand totals for each'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures and multiple column grand totals for each' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndMultipleColumnGrandTotalsForEach.parameters = {
    kind: "two measures and multiple column grand totals for each",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndOneColumnSubtotal = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 11).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and one column subtotal",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures and one column subtotal'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures and one column subtotal' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndOneColumnSubtotal.parameters = {
    kind: "two measures and one column subtotal",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndMultipleColumnSubtotals = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 11).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and multiple column subtotals",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures and multiple column subtotals'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures and multiple column subtotals' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndMultipleColumnSubtotals.parameters = {
    kind: "two measures and multiple column subtotals",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndColumnGrandTotalsAndMultipleSubtotals = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 11).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and column grand totals and multiple subtotals",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures and column grand totals and multiple subtotals'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures and column grand totals and multiple subtotals' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndColumnGrandTotalsAndMultipleSubtotals.parameters = {
    kind: "two measures and column grand totals and multiple subtotals",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndColumnSingleGrandTotalSortedBySecondAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 11).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and column single grand total sorted by second attribute",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures and column single grand total sorted by second attribute'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures and column single grand total sorted by second attribute' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndColumnSingleGrandTotalSortedBySecondAttribute.parameters = {
    kind: "two measures and column single grand total sorted by second attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndSingleColumnGrandTotalAndSingleSubtotalSortedBySecondAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 11).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) =>
                name ===
                "two measures and single column grand total and single subtotal sorted by second attribute",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures and single column grand total and single subtotal sorted by second attribute'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures and single column grand total and single subtotal sorted by second attribute' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndSingleColumnGrandTotalAndSingleSubtotalSortedBySecondAttribute.parameters = {
    kind: "two measures and single column grand total and single subtotal sorted by second attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;
