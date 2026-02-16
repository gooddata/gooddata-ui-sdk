// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/PivotTableNext/drilling",
};

export const WithDrillOnAllRowAtributes = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 5).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "with drill on all row atributes",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'with drill on all row atributes'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'with drill on all row atributes' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1200, height: 800 }, scenario.tags)();
    })();
WithDrillOnAllRowAtributes.parameters = {
    kind: "with drill on all row atributes",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const WithDrillOnAllRowAttributesAndMeasures = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 5).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "with drill on all row attributes and measures",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'with drill on all row attributes and measures'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'with drill on all row attributes and measures' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1200, height: 800 }, scenario.tags)();
    })();
WithDrillOnAllRowAttributesAndMeasures.parameters = {
    kind: "with drill on all row attributes and measures",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;
