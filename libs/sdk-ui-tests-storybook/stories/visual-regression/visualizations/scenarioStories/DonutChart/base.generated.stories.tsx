// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/DonutChart/base",
};

export const SingleMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(6, 0).asScenarioDescAndScenario();
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

export const TwoMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(6, 0).asScenarioDescAndScenario();
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

export const SingleMeasureWithViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(6, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "single measure with viewBy");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure with viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure with viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
SingleMeasureWithViewby.parameters = {
    kind: "single measure with viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const ArithmeticMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(6, 0).asScenarioDescAndScenario();
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
