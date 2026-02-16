// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/BarChart/stacking reversed",
};

export const ReversedTwoMeasuresAndTwoViewbyWithStackmeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 25).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "reversed two measures and two viewBy with stackMeasures",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'reversed two measures and two viewBy with stackMeasures'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'reversed two measures and two viewBy with stackMeasures' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
ReversedTwoMeasuresAndTwoViewbyWithStackmeasures.parameters = {
    kind: "reversed two measures and two viewBy with stackMeasures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const ReversedThreeMeasuresAndOneViewbyWithTopAxisAndStackmeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(1, 25).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "reversed three measures and one viewBy with top axis and stackMeasures",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'reversed three measures and one viewBy with top axis and stackMeasures'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'reversed three measures and one viewBy with top axis and stackMeasures' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
ReversedThreeMeasuresAndOneViewbyWithTopAxisAndStackmeasures.parameters = {
    kind: "reversed three measures and one viewBy with top axis and stackMeasures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
