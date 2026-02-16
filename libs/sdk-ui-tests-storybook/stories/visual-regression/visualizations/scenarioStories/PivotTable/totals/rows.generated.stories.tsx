// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/PivotTable/totals/rows",
};

export const SingleMeasureAndSingleGrandTotal = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 12).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure and single grand total",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure and single grand total'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure and single grand total' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
SingleMeasureAndSingleGrandTotal.parameters = {
    kind: "single measure and single grand total",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasureAndMultipleGrandTotals = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 12).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure and multiple grand totals",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure and multiple grand totals'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure and multiple grand totals' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
SingleMeasureAndMultipleGrandTotals.parameters = {
    kind: "single measure and multiple grand totals",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndSingleGrandTotalForOne = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 12).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and single grand total for one",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures and single grand total for one'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures and single grand total for one' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndSingleGrandTotalForOne.parameters = {
    kind: "two measures and single grand total for one",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndSingleGrandTotalForEach = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 12).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and single grand total for each",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures and single grand total for each'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures and single grand total for each' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndSingleGrandTotalForEach.parameters = {
    kind: "two measures and single grand total for each",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndMultipleGrandTotalsForEach = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 12).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and multiple grand totals for each",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures and multiple grand totals for each'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures and multiple grand totals for each' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndMultipleGrandTotalsForEach.parameters = {
    kind: "two measures and multiple grand totals for each",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndOneSubtotal = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 12).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and one subtotal",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures and one subtotal'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures and one subtotal' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndOneSubtotal.parameters = {
    kind: "two measures and one subtotal",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndMultipleSubtotals = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 12).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and multiple subtotals",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures and multiple subtotals'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures and multiple subtotals' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndMultipleSubtotals.parameters = {
    kind: "two measures and multiple subtotals",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndGrandTotalsAndMultipleSubtotals = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 12).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and grand totals and multiple subtotals",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures and grand totals and multiple subtotals'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures and grand totals and multiple subtotals' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndGrandTotalsAndMultipleSubtotals.parameters = {
    kind: "two measures and grand totals and multiple subtotals",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndSingleGrandTotalSortedBySecondAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 12).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and single grand total sorted by second attribute",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures and single grand total sorted by second attribute'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures and single grand total sorted by second attribute' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndSingleGrandTotalSortedBySecondAttribute.parameters = {
    kind: "two measures and single grand total sorted by second attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;
