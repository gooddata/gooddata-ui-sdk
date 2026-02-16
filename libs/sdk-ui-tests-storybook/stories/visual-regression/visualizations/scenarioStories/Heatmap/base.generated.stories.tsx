// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/Heatmap/base",
};

export const MeasureOnly = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(10, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "measure only");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'measure only'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'measure only' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
MeasureOnly.parameters = {
    kind: "measure only",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const MeasureAndRows = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(10, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "measure and rows");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'measure and rows'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'measure and rows' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
MeasureAndRows.parameters = {
    kind: "measure and rows",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const MeasureAndColumns = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(10, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "measure and columns");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'measure and columns'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'measure and columns' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
MeasureAndColumns.parameters = {
    kind: "measure and columns",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const MeasureRowsAndColumns = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(10, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "measure, rows and columns");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'measure, rows and columns'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'measure, rows and columns' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
MeasureRowsAndColumns.parameters = {
    kind: "measure, rows and columns",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const MeasureRowsAndColumnsWithNullDataPoints = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(10, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "measure, rows and columns with null data points",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'measure, rows and columns with null data points'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'measure, rows and columns with null data points' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
MeasureRowsAndColumnsWithNullDataPoints.parameters = {
    kind: "measure, rows and columns with null data points",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
