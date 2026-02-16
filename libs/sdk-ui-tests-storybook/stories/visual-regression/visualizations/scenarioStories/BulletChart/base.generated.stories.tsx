// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/BulletChart/base",
};

export const PrimaryMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "primary measure");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'primary measure'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'primary measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
PrimaryMeasure.parameters = {
    kind: "primary measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const PrimaryAndTargetMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "primary and target measures");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'primary and target measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'primary and target measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
PrimaryAndTargetMeasures.parameters = {
    kind: "primary and target measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const PrimaryAndComparativeMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "primary and comparative measures",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'primary and comparative measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'primary and comparative measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
PrimaryAndComparativeMeasures.parameters = {
    kind: "primary and comparative measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const PrimaryTargetAndComparativeMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "primary, target and comparative measures",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'primary, target and comparative measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'primary, target and comparative measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
PrimaryTargetAndComparativeMeasures.parameters = {
    kind: "primary, target and comparative measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const PrimaryAndTargetMeasuresWithViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "primary and target measures with viewBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'primary and target measures with viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'primary and target measures with viewBy' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
PrimaryAndTargetMeasuresWithViewby.parameters = {
    kind: "primary and target measures with viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const PrimaryTargetAndComparativeMeasuresWithViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "primary, target and comparative measures with viewBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'primary, target and comparative measures with viewBy'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'primary, target and comparative measures with viewBy' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
PrimaryTargetAndComparativeMeasuresWithViewby.parameters = {
    kind: "primary, target and comparative measures with viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const PrimaryTargetAndComparativeMeasuresWithViewbyAndSort = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "primary, target and comparative measures with viewBy and sort",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'primary, target and comparative measures with viewBy and sort'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'primary, target and comparative measures with viewBy and sort' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
PrimaryTargetAndComparativeMeasuresWithViewbyAndSort.parameters = {
    kind: "primary, target and comparative measures with viewBy and sort",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const PrimaryTargetAndComparativeMeasuresWithTwoViewby = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "primary, target and comparative measures with two viewBy",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'primary, target and comparative measures with two viewBy'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'primary, target and comparative measures with two viewBy' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
PrimaryTargetAndComparativeMeasuresWithTwoViewby.parameters = {
    kind: "primary, target and comparative measures with two viewBy",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const PrimaryWithTwoViewbyDates = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "primary with two viewBy dates",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'primary with two viewBy dates'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'primary with two viewBy dates' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
PrimaryWithTwoViewbyDates.parameters = {
    kind: "primary with two viewBy dates",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const PrimaryTargetAndComparativeMeasuresWithTwoViewbyDates = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "primary, target and comparative measures with two viewBy dates",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'primary, target and comparative measures with two viewBy dates'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'primary, target and comparative measures with two viewBy dates' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
PrimaryTargetAndComparativeMeasuresWithTwoViewbyDates.parameters = {
    kind: "primary, target and comparative measures with two viewBy dates",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
