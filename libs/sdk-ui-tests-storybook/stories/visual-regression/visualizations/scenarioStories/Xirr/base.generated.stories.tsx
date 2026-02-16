// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/Xirr/base",
};

export const OnlyMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(17, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "only measure");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'only measure'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'only measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
OnlyMeasure.parameters = {
    kind: "only measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const CorrectConfig = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(17, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "correct config");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'correct config'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'correct config' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
CorrectConfig.parameters = {
    kind: "correct config",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SemanticallyWrongMeasure = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(17, 0).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "semantically wrong measure");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'semantically wrong measure'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'semantically wrong measure' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
SemanticallyWrongMeasure.parameters = {
    kind: "semantically wrong measure",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
