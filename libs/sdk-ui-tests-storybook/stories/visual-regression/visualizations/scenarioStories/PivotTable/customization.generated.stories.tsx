// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/PivotTable/customization",
};

export const GermanNumberFormat = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "german number format");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'german number format'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'german number format' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
GermanNumberFormat.parameters = {
    kind: "german number format",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const NoTotalsAndMaxHeight200 = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "no totals and max height 200");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'no totals and max height 200'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'no totals and max height 200' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
NoTotalsAndMaxHeight200.parameters = {
    kind: "no totals and max height 200",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const NoTotalsAndMaxHeight300 = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "no totals and max height 300");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'no totals and max height 300'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'no totals and max height 300' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
NoTotalsAndMaxHeight300.parameters = {
    kind: "no totals and max height 300",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const NoTotalsAndNoGrouping = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "no totals and no grouping");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'no totals and no grouping'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'no totals and no grouping' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
NoTotalsAndNoGrouping.parameters = {
    kind: "no totals and no grouping",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const MeasureFormatWithColors = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "measure format with colors");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'measure format with colors'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'measure format with colors' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
MeasureFormatWithColors.parameters = {
    kind: "measure format with colors",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TotalsAndMaxHeight200 = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "totals and max height 200");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'totals and max height 200'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'totals and max height 200' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TotalsAndMaxHeight200.parameters = {
    kind: "totals and max height 200",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TotalsAndMaxHeight300 = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "totals and max height 300");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'totals and max height 300'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'totals and max height 300' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TotalsAndMaxHeight300.parameters = {
    kind: "totals and max height 300",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TotalsAndMaxHeight800 = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "totals and max height 800");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'totals and max height 800'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'totals and max height 800' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 800 }, scenario.tags)();
    })();
TotalsAndMaxHeight800.parameters = {
    kind: "totals and max height 800",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;
