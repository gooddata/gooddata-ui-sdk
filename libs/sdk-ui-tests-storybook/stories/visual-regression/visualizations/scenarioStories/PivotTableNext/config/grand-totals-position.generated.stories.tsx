// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/PivotTableNext/config/grand totals position",
};

export const GrandTotalsPinnedAtBottomDefault = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "grand totals pinned at bottom (default)",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'grand totals pinned at bottom (default)'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'grand totals pinned at bottom (default)' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
GrandTotalsPinnedAtBottomDefault.parameters = {
    kind: "grand totals pinned at bottom (default)",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const GrandTotalsPinnedAtTop = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "grand totals pinned at top");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'grand totals pinned at top'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'grand totals pinned at top' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
GrandTotalsPinnedAtTop.parameters = {
    kind: "grand totals pinned at top",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const GrandTotalsAtBottomNotPinned = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "grand totals at bottom (not pinned)",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'grand totals at bottom (not pinned)'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'grand totals at bottom (not pinned)' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
GrandTotalsAtBottomNotPinned.parameters = {
    kind: "grand totals at bottom (not pinned)",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const GrandTotalsAtTopNotPinned = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 2).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "grand totals at top (not pinned)",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'grand totals at top (not pinned)'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'grand totals at top (not pinned)' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
GrandTotalsAtTopNotPinned.parameters = {
    kind: "grand totals at top (not pinned)",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;
