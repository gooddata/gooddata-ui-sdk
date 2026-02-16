// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/PivotTable/totals/rows & columns",
};

export const SingleMeasureAndSingleColumnRowGrandTotal = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 13).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure and single column/row grand total",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure and single column/row grand total'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure and single column/row grand total' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
SingleMeasureAndSingleColumnRowGrandTotal.parameters = {
    kind: "single measure and single column/row grand total",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasureAndMultipleColumnRowGrandTotals = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 13).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure and multiple column/row grand totals",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure and multiple column/row grand totals'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure and multiple column/row grand totals' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
SingleMeasureAndMultipleColumnRowGrandTotals.parameters = {
    kind: "single measure and multiple column/row grand totals",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndSingleColumnRowGrandTotalForOne = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 13).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and single column/row grand total for one",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures and single column/row grand total for one'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures and single column/row grand total for one' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndSingleColumnRowGrandTotalForOne.parameters = {
    kind: "two measures and single column/row grand total for one",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndSingleColumnRowGrandTotalForEach = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 13).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and single column/row grand total for each",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures and single column/row grand total for each'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures and single column/row grand total for each' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndSingleColumnRowGrandTotalForEach.parameters = {
    kind: "two measures and single column/row grand total for each",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndMultipleColumnRowGrandTotalsForEach = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 13).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and multiple column/row grand totals for each",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures and multiple column/row grand totals for each'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures and multiple column/row grand totals for each' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndMultipleColumnRowGrandTotalsForEach.parameters = {
    kind: "two measures and multiple column/row grand totals for each",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndOneColumnRowSubtotal = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 13).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and one column/row subtotal",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures and one column/row subtotal'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures and one column/row subtotal' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndOneColumnRowSubtotal.parameters = {
    kind: "two measures and one column/row subtotal",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndMultipleColumnRowSubtotals = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 13).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and multiple column/row subtotals",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures and multiple column/row subtotals'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures and multiple column/row subtotals' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndMultipleColumnRowSubtotals.parameters = {
    kind: "two measures and multiple column/row subtotals",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndColumnRowGrandTotalsAndMultipleSubtotals = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 13).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and column/row grand totals and multiple subtotals",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures and column/row grand totals and multiple subtotals'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures and column/row grand totals and multiple subtotals' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndColumnRowGrandTotalsAndMultipleSubtotals.parameters = {
    kind: "two measures and column/row grand totals and multiple subtotals",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;
