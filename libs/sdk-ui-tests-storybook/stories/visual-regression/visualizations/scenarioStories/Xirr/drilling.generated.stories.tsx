// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/Xirr/drilling",
};

export const DrillingOnSingleMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(17, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "drilling on single measure");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'drilling on single measure'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'drilling on single measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
DrillingOnSingleMeasure.parameters = {
    kind: "drilling on single measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const DrillingOnSingleMeasureWithUnderliningDisabled = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(17, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "drilling on single measure with underlining disabled",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'drilling on single measure with underlining disabled'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'drilling on single measure with underlining disabled' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
DrillingOnSingleMeasureWithUnderliningDisabled.parameters = {
    kind: "drilling on single measure with underlining disabled",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;
