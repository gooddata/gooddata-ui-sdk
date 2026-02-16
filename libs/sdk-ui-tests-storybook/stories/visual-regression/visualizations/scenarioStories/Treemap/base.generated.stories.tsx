// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/Treemap/base",
};

export const SingleMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(14, 0).asScenarioDescAndScenario();
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

export const SingleMeasureAndSegment = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(14, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "single measure and segment");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure and segment'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure and segment' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
SingleMeasureAndSegment.parameters = {
    kind: "single measure and segment",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(14, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "two measures");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'two measures'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'two measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
TwoMeasures.parameters = {
    kind: "two measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleMeasureAndViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(14, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "single measure and viewBy");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure and viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure and viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
SingleMeasureAndViewby.parameters = {
    kind: "single measure and viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleMeasureAndViewbyFilteredToOneElement = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(14, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure and viewBy filtered to one element",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure and viewBy filtered to one element'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure and viewBy filtered to one element' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
SingleMeasureAndViewbyFilteredToOneElement.parameters = {
    kind: "single measure and viewBy filtered to one element",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleMeasureViewbyAndSegment = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(14, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure, viewBy and segment",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure, viewBy and segment'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure, viewBy and segment' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
SingleMeasureViewbyAndSegment.parameters = {
    kind: "single measure, viewBy and segment",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(14, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "two measures and viewBy");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures and viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures and viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
TwoMeasuresAndViewby.parameters = {
    kind: "two measures and viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndSegmentby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(14, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "two measures and segmentBy");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures and segmentBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures and segmentBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
TwoMeasuresAndSegmentby.parameters = {
    kind: "two measures and segmentBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const ArithmeticMeasuresAndSegment = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(14, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "arithmetic measures and segment",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'arithmetic measures and segment'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'arithmetic measures and segment' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ArithmeticMeasuresAndSegment.parameters = {
    kind: "arithmetic measures and segment",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const WithOneMeasureAndViewByDateAndSegmentByDate = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(14, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "with one measure and view by date and segment by date",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'with one measure and view by date and segment by date'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'with one measure and view by date and segment by date' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
WithOneMeasureAndViewByDateAndSegmentByDate.parameters = {
    kind: "with one measure and view by date and segment by date",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
