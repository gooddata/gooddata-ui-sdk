// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/DependencyWheelChart/base",
};

export const MeasureOnly = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(16, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "measure only");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'measure only'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'measure only' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
MeasureOnly.parameters = {
    kind: "measure only",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const MeasureAndAttributefrom = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(16, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "measure and attributeFrom");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'measure and attributeFrom'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'measure and attributeFrom' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
MeasureAndAttributefrom.parameters = {
    kind: "measure and attributeFrom",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const MeasureAndAttributeto = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(16, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "measure and attributeTo");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'measure and attributeTo'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'measure and attributeTo' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
MeasureAndAttributeto.parameters = {
    kind: "measure and attributeTo",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const MeasureAttributefromAndAttributeto = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(16, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "measure, attributeFrom and attributeTo",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'measure, attributeFrom and attributeTo'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'measure, attributeFrom and attributeTo' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 800 }, scenario.tags)();
    })();
MeasureAttributefromAndAttributeto.parameters = {
    kind: "measure, attributeFrom and attributeTo",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
