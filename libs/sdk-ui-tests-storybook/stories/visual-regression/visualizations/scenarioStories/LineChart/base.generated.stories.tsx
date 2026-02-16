// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/LineChart/base",
};

export const SingleMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "single measure");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'single measure'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'single measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
SingleMeasure.parameters = {
    kind: "single measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleMeasureWithTrendby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "single measure with trendBy");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure with trendBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure with trendBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
SingleMeasureWithTrendby.parameters = {
    kind: "single measure with trendBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleMeasureWithAndTrendby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure with % and trendBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure with % and trendBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure with % and trendBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
SingleMeasureWithAndTrendby.parameters = {
    kind: "single measure with % and trendBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithTrendby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "two measures with trendBy");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with trendBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with trendBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
TwoMeasuresWithTrendby.parameters = {
    kind: "two measures with trendBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithTrendbyAndSortByMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with trendBy and sort by measure",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with trendBy and sort by measure'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with trendBy and sort by measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
TwoMeasuresWithTrendbyAndSortByMeasure.parameters = {
    kind: "two measures with trendBy and sort by measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithTrendbyAndSortByAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with trendBy and sort by attribute",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with trendBy and sort by attribute'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with trendBy and sort by attribute' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
TwoMeasuresWithTrendbyAndSortByAttribute.parameters = {
    kind: "two measures with trendBy and sort by attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleMeasureWithTrendbyAndSegmentby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure with trendBy and segmentBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure with trendBy and segmentBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure with trendBy and segmentBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
SingleMeasureWithTrendbyAndSegmentby.parameters = {
    kind: "single measure with trendBy and segmentBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const ArithmeticMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "arithmetic measures");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'arithmetic measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'arithmetic measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ArithmeticMeasures.parameters = {
    kind: "arithmetic measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const WithOneMeasureAndSegmentByDate = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "with one measure and segment by date",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'with one measure and segment by date'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'with one measure and segment by date' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
WithOneMeasureAndSegmentByDate.parameters = {
    kind: "with one measure and segment by date",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const WithOneMeasureAndTrendByDateAndSegmentByDate = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "with one measure and trend by date and segment by date",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'with one measure and trend by date and segment by date'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'with one measure and trend by date and segment by date' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
WithOneMeasureAndTrendByDateAndSegmentByDate.parameters = {
    kind: "with one measure and trend by date and segment by date",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const WithTwoMeasuresAndNullValues = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "with two measures and null values",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'with two measures and null values'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'with two measures and null values' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
WithTwoMeasuresAndNullValues.parameters = {
    kind: "with two measures and null values",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
