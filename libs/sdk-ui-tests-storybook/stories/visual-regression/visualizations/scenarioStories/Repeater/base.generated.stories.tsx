// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/Repeater/base",
};

export const OneAttribute = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(19, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "one attribute");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'one attribute'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'one attribute' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
OneAttribute.parameters = {
    kind: "one attribute",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const OneAttributeAndOneMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(19, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "one attribute and one measure",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'one attribute and one measure'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'one attribute and one measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
OneAttributeAndOneMeasure.parameters = {
    kind: "one attribute and one measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const OneAttributeAndOneVisualisation = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(19, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "one attribute and one visualisation",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'one attribute and one visualisation'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'one attribute and one visualisation' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
OneAttributeAndOneVisualisation.parameters = {
    kind: "one attribute and one visualisation",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
