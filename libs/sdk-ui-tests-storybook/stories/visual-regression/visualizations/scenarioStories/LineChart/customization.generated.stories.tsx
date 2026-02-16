// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    groupedStory,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/LineChart/customization",
};

export const LegendPosition = () =>
    groupedStory(getScenariosGroupByIndexes(11, 1), {
        width: 800,
        height: 400,
    })();
LegendPosition.parameters = {
    kind: "legend position",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DataLabels = () =>
    groupedStory(getScenariosGroupByIndexes(11, 2), {
        width: 800,
        height: 400,
    })();
DataLabels.parameters = {
    kind: "data labels",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DataPoints = () =>
    groupedStory(getScenariosGroupByIndexes(11, 3), {
        width: 800,
        height: 400,
    })();
DataPoints.parameters = {
    kind: "data points",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const NullValuesWithContinuousLine = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 4).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "null values with continuous line",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'null values with continuous line'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'null values with continuous line' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
NullValuesWithContinuousLine.parameters = {
    kind: "null values with continuous line",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const ThresholdZones = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 5).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "threshold zones");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'threshold zones'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'threshold zones' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ThresholdZones.parameters = {
    kind: "threshold zones",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const StackedThresholdZones = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(11, 6).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "stacked threshold zones");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'stacked threshold zones'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'stacked threshold zones' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
StackedThresholdZones.parameters = {
    kind: "stacked threshold zones",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
