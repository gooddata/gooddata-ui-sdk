// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/ComboChart/base",
};

export const OnePrimaryMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(5, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "one primary measure");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'one primary measure'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'one primary measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
OnePrimaryMeasure.parameters = {
    kind: "one primary measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const OnePrimaryMeasureWithViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(5, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "one primary measure with viewBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'one primary measure with viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'one primary measure with viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
OnePrimaryMeasureWithViewby.parameters = {
    kind: "one primary measure with viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoSecondaryMeasureWithViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(5, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two secondary measure with viewBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two secondary measure with viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two secondary measure with viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
TwoSecondaryMeasureWithViewby.parameters = {
    kind: "two secondary measure with viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const OneSecondaryMeasureWithViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(5, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "one secondary measure with viewBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'one secondary measure with viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'one secondary measure with viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
OneSecondaryMeasureWithViewby.parameters = {
    kind: "one secondary measure with viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const OnePrimaryAndSecondaryMeasureNoViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(5, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "one primary and secondary measure no viewBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'one primary and secondary measure no viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'one primary and secondary measure no viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
OnePrimaryAndSecondaryMeasureNoViewby.parameters = {
    kind: "one primary and secondary measure no viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const OnePrimaryAndSecondaryMeasureWithViewbySortedByAttr = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(5, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "one primary and secondary measure with viewBy sorted by attr",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'one primary and secondary measure with viewBy sorted by attr'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'one primary and secondary measure with viewBy sorted by attr' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
OnePrimaryAndSecondaryMeasureWithViewbySortedByAttr.parameters = {
    kind: "one primary and secondary measure with viewBy sorted by attr",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const OnePrimaryAndSecondaryMeasureWithViewbySortedByPrimaryMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(5, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "one primary and secondary measure with viewBy sorted by primary measure",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'one primary and secondary measure with viewBy sorted by primary measure'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'one primary and secondary measure with viewBy sorted by primary measure' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
OnePrimaryAndSecondaryMeasureWithViewbySortedByPrimaryMeasure.parameters = {
    kind: "one primary and secondary measure with viewBy sorted by primary measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const OnePrimaryAndSecondaryMeasureWithViewbySortedBySecondaryMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(5, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "one primary and secondary measure with viewBy sorted by secondary measure",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'one primary and secondary measure with viewBy sorted by secondary measure'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'one primary and secondary measure with viewBy sorted by secondary measure' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
OnePrimaryAndSecondaryMeasureWithViewbySortedBySecondaryMeasure.parameters = {
    kind: "one primary and secondary measure with viewBy sorted by secondary measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const OnePrimaryAndSecondaryMeasureWithViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(5, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "one primary and secondary measure with viewBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'one primary and secondary measure with viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'one primary and secondary measure with viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
OnePrimaryAndSecondaryMeasureWithViewby.parameters = {
    kind: "one primary and secondary measure with viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const MultiplePrimaryAndSecondaryMeasuresWithViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(5, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multiple primary and secondary measures with viewBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'multiple primary and secondary measures with viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'multiple primary and secondary measures with viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
MultiplePrimaryAndSecondaryMeasuresWithViewby.parameters = {
    kind: "multiple primary and secondary measures with viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const MultipleMeasuresAndNoViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(5, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "multiple measures and no viewBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'multiple measures and no viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'multiple measures and no viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
MultipleMeasuresAndNoViewby.parameters = {
    kind: "multiple measures and no viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const ArithmeticMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(5, 0).asScenarioDescAndScenario();
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

export const TwoMeasuresWithNullValues = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(5, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with null values",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with null values'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with null values' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
TwoMeasuresWithNullValues.parameters = {
    kind: "two measures with null values",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
