// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/AreaChart/stacking",
};

export const TwoMeasuresWithViewbyAndDisabledStacking = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(0, 15).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with viewBy and disabled stacking",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with viewBy and disabled stacking'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with viewBy and disabled stacking' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
TwoMeasuresWithViewbyAndDisabledStacking.parameters = {
    kind: "two measures with viewBy and disabled stacking",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithViewbyAndEnabledStacking = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(0, 15).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with viewBy and enabled stacking",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with viewBy and enabled stacking'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with viewBy and enabled stacking' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
TwoMeasuresWithViewbyAndEnabledStacking.parameters = {
    kind: "two measures with viewBy and enabled stacking",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithViewbyAndDisabledStackMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(0, 15).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with viewBy and disabled stack measures",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with viewBy and disabled stack measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures with viewBy and disabled stack measures' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
TwoMeasuresWithViewbyAndDisabledStackMeasures.parameters = {
    kind: "two measures with viewBy and disabled stack measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithViewbyAndEnabledStackMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(0, 15).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with viewBy and enabled stack measures",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'two measures with viewBy and enabled stack measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'two measures with viewBy and enabled stack measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
TwoMeasuresWithViewbyAndEnabledStackMeasures.parameters = {
    kind: "two measures with viewBy and enabled stack measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithViewbyAndStackMeasuresToPercent = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(0, 15).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "two measures with viewBy and stack measures to percent",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'two measures with viewBy and stack measures to percent'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'two measures with viewBy and stack measures to percent' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
TwoMeasuresWithViewbyAndStackMeasuresToPercent.parameters = {
    kind: "two measures with viewBy and stack measures to percent",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleMeasureWithViewbyAndStackbyAndStackToPercent = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(0, 15).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure with viewBy and stackBy and stack to percent",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'single measure with viewBy and stackBy and stack to percent'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'single measure with viewBy and stackBy and stack to percent' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
SingleMeasureWithViewbyAndStackbyAndStackToPercent.parameters = {
    kind: "single measure with viewBy and stackBy and stack to percent",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleMeasureWithViewbyAndStackbyAndStackToPercentWithLabels = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(0, 15).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure with viewBy and stackBy and stack to percent with labels",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'single measure with viewBy and stackBy and stack to percent with labels'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'single measure with viewBy and stackBy and stack to percent with labels' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
SingleMeasureWithViewbyAndStackbyAndStackToPercentWithLabels.parameters = {
    kind: "single measure with viewBy and stackBy and stack to percent with labels",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleMeasureWithViewbyAndStackbyAndDisabledStacking = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(0, 15).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure with viewBy and stackBy and disabled stacking",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'single measure with viewBy and stackBy and disabled stacking'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'single measure with viewBy and stackBy and disabled stacking' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
SingleMeasureWithViewbyAndStackbyAndDisabledStacking.parameters = {
    kind: "single measure with viewBy and stackBy and disabled stacking",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleMeasureWithViewbyAndStackToPercent = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(0, 15).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "single measure with viewBy and stack to percent",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'single measure with viewBy and stack to percent'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'single measure with viewBy and stack to percent' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
SingleMeasureWithViewbyAndStackToPercent.parameters = {
    kind: "single measure with viewBy and stack to percent",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const UndefinedValuesAndDisabledStacking = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(0, 15).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "undefined values and disabled stacking",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'undefined values and disabled stacking'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'undefined values and disabled stacking' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
UndefinedValuesAndDisabledStacking.parameters = {
    kind: "undefined values and disabled stacking",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const UndefinedValuesDisabledStackingAndTheContinuousLineEnabled = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(0, 15).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "undefined values, disabled stacking and the continuous line enabled",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'undefined values, disabled stacking and the continuous line enabled'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'undefined values, disabled stacking and the continuous line enabled' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
UndefinedValuesDisabledStackingAndTheContinuousLineEnabled.parameters = {
    kind: "undefined values, disabled stacking and the continuous line enabled",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
