// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/BulletChart/drilling",
};

export const DrillingWithSingleViewByDrilling = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 22).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "drilling with single view by drilling",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'drilling with single view by drilling'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'drilling with single view by drilling' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
DrillingWithSingleViewByDrilling.parameters = {
    kind: "drilling with single view by drilling",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const SingleMeasureAndTwoViewbyWithDrillingOnParentAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 22).asScenarioDescAndScenario();
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

export const SingleMeasureAndTwoViewbyWithDrillingOnChildAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(3, 22).asScenarioDescAndScenario();
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
