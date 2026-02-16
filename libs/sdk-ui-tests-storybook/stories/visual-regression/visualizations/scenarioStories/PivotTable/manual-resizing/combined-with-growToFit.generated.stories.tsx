// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/PivotTable/manual-resizing/combined with growToFit",
};

export const SimpleTableWithCustomAttributeColumnSize = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 7).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "simple table with custom attribute column size",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'simple table with custom attribute column size'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'simple table with custom attribute column size' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1200, height: 800 }, scenario.tags)();
    })();
SimpleTableWithCustomAttributeColumnSize.parameters = {
    kind: "simple table with custom attribute column size",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SimpleTableWithCustomMetricColumnSize = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 7).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "simple table with custom metric column size",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'simple table with custom metric column size'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'simple table with custom metric column size' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1200, height: 800 }, scenario.tags)();
    })();
SimpleTableWithCustomMetricColumnSize.parameters = {
    kind: "simple table with custom metric column size",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SimpleTableWithAttributeAndMetricColumnSize = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 7).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "simple table with attribute and metric column size",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'simple table with attribute and metric column size'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'simple table with attribute and metric column size' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1200, height: 800 }, scenario.tags)();
    })();
SimpleTableWithAttributeAndMetricColumnSize.parameters = {
    kind: "simple table with attribute and metric column size",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TableWithMultipleMeasureColumnsAndWeakMeasureSize = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(20, 7).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "table with multiple measure columns and weak measure size",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'table with multiple measure columns and weak measure size'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'table with multiple measure columns and weak measure size' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1200, height: 800 }, scenario.tags)();
    })();
TableWithMultipleMeasureColumnsAndWeakMeasureSize.parameters = {
    kind: "table with multiple measure columns and weak measure size",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;
