// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/ScatterPlot/base",
};

export const XAxisMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(13, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "x axis measure");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'x axis measure'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'x axis measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
XAxisMeasure.parameters = {
    kind: "x axis measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAxisMeasureAndAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(13, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "x axis measure and attribute");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'x axis measure and attribute'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'x axis measure and attribute' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
XAxisMeasureAndAttribute.parameters = {
    kind: "x axis measure and attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const YAxisMeasureAndAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(13, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "y axis measure and attribute");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'y axis measure and attribute'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'y axis measure and attribute' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
YAxisMeasureAndAttribute.parameters = {
    kind: "y axis measure and attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAndYAxisMeasuresAndAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(13, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "x and y axis measures and attribute",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'x and y axis measures and attribute'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'x and y axis measures and attribute' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
XAndYAxisMeasuresAndAttribute.parameters = {
    kind: "x and y axis measures and attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAndYAxisMeasuresAttributeAndSegmentation = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(13, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "x and y axis measures, attribute and segmentation",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'x and y axis measures, attribute and segmentation'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'x and y axis measures, attribute and segmentation' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
XAndYAxisMeasuresAttributeAndSegmentation.parameters = {
    kind: "x and y axis measures, attribute and segmentation",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAndYAxisMeasuresAndAttributeWithAttrSorting = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(13, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "x and y axis measures and attribute with attr sorting",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'x and y axis measures and attribute with attr sorting'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'x and y axis measures and attribute with attr sorting' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
XAndYAxisMeasuresAndAttributeWithAttrSorting.parameters = {
    kind: "x and y axis measures and attribute with attr sorting",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAndYAxisMeasuresAndAttributeWithNullsInData = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(13, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "x and y axis measures and attribute with nulls in data",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'x and y axis measures and attribute with nulls in data'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'x and y axis measures and attribute with nulls in data' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
XAndYAxisMeasuresAndAttributeWithNullsInData.parameters = {
    kind: "x and y axis measures and attribute with nulls in data",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
