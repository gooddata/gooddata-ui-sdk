// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/ColumnChart/drilling",
};

export const SingleMeasureAndViewbyWithDrillingOnBars = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 23).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure and viewBy with drilling on bars",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure and viewBy with drilling on bars'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure and viewBy with drilling on bars' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
SingleMeasureAndViewbyWithDrillingOnBars.parameters = {
    kind: "single measure and viewBy with drilling on bars",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const SingleMeasureAndTwoViewbyWithDrillingOnParentAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 23).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure and two viewBy with drilling on parent attribute",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'single measure and two viewBy with drilling on parent attribute'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'single measure and two viewBy with drilling on parent attribute' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
SingleMeasureAndTwoViewbyWithDrillingOnParentAttribute.parameters = {
    kind: "single measure and two viewBy with drilling on parent attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const ForceDisableDrillOnAxes = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 23).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "force disable drill on axes");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'force disable drill on axes'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'force disable drill on axes' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
ForceDisableDrillOnAxes.parameters = {
    kind: "force disable drill on axes",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const SingleMeasureAndTwoViewbyWithDrillingOnChildAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 23).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure and two viewBy with drilling on child attribute",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'single measure and two viewBy with drilling on child attribute'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'single measure and two viewBy with drilling on child attribute' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
SingleMeasureAndTwoViewbyWithDrillingOnChildAttribute.parameters = {
    kind: "single measure and two viewBy with drilling on child attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndTwoViewbyDualAxisWithDrillingOnChildAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 23).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and two viewBy, dual axis, with drilling on child attribute",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures and two viewBy, dual axis, with drilling on child attribute'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures and two viewBy, dual axis, with drilling on child attribute' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndTwoViewbyDualAxisWithDrillingOnChildAttribute.parameters = {
    kind: "two measures and two viewBy, dual axis, with drilling on child attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndTwoViewbyDualAxisWithDrillingOnParentAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 23).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures and two viewBy, dual axis, with drilling on parent attribute",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures and two viewBy, dual axis, with drilling on parent attribute'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures and two viewBy, dual axis, with drilling on parent attribute' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndTwoViewbyDualAxisWithDrillingOnParentAttribute.parameters = {
    kind: "two measures and two viewBy, dual axis, with drilling on parent attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const TwoMeasuresAndTwoViewbyDualAxisWithDrillingOnParentAndChildAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 23).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) =>
                name ===
                "two measures and two viewBy, dual axis, with drilling on parent and child attribute",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures and two viewBy, dual axis, with drilling on parent and child attribute'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures and two viewBy, dual axis, with drilling on parent and child attribute' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
TwoMeasuresAndTwoViewbyDualAxisWithDrillingOnParentAndChildAttribute.parameters = {
    kind: "two measures and two viewBy, dual axis, with drilling on parent and child attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const SingleMeasureTwoViewbyAndStackingWithDrillingOnParent = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 23).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure, two viewBy and stacking with drilling on parent",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'single measure, two viewBy and stacking with drilling on parent'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'single measure, two viewBy and stacking with drilling on parent' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
SingleMeasureTwoViewbyAndStackingWithDrillingOnParent.parameters = {
    kind: "single measure, two viewBy and stacking with drilling on parent",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const SingleMeasureTwoViewbyAndStackingWithDrillingOnChild = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 23).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure, two viewBy and stacking with drilling on child",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'single measure, two viewBy and stacking with drilling on child'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'single measure, two viewBy and stacking with drilling on child' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
SingleMeasureTwoViewbyAndStackingWithDrillingOnChild.parameters = {
    kind: "single measure, two viewBy and stacking with drilling on child",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;
