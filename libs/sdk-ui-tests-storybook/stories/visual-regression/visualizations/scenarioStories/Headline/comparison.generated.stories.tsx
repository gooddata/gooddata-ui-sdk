// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/Headline/comparison",
};

export const ComparisonWithDefaultConfig = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "comparison with default config",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'comparison with default config'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'comparison with default config' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithDefaultConfig.parameters = {
    kind: "comparison with default config",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithDefaultConfigWithSecondaryMeasureIsPop = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "comparison with default config with secondary measure is PoP",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'comparison with default config with secondary measure is PoP'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'comparison with default config with secondary measure is PoP' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithDefaultConfigWithSecondaryMeasureIsPop.parameters = {
    kind: "comparison with default config with secondary measure is PoP",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithCalculateAsDifferentAndDefaultFormat = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "comparison with calculate as different and default format",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'comparison with calculate as different and default format'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'comparison with calculate as different and default format' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithCalculateAsDifferentAndDefaultFormat.parameters = {
    kind: "comparison with calculate as different and default format",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithCalculateAsChangeDifferenceAndDefaultSubFormat = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "comparison with calculate as change (difference) and default sub format",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'comparison with calculate as change (difference) and default sub format'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'comparison with calculate as change (difference) and default sub format' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithCalculateAsChangeDifferenceAndDefaultSubFormat.parameters = {
    kind: "comparison with calculate as change (difference) and default sub format",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithCalculateAsChangeDifferenceAndCustomFormat = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "comparison with calculate as change (difference) and custom format",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error(
                "Failed to find scenario 'comparison with calculate as change (difference) and custom format'",
            );
        if (scenarioAndDescriptions.length > 1)
            throw new Error(
                "Multiple 'comparison with calculate as change (difference) and custom format' scenarios found",
            );
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithCalculateAsChangeDifferenceAndCustomFormat.parameters = {
    kind: "comparison with calculate as change (difference) and custom format",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithDecimal1Format = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "comparison with decimal-1 format",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'comparison with decimal-1 format'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'comparison with decimal-1 format' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithDecimal1Format.parameters = {
    kind: "comparison with decimal-1 format",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithCustomFormat = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "comparison with custom format",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'comparison with custom format'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'comparison with custom format' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithCustomFormat.parameters = {
    kind: "comparison with custom format",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithPositiveArrow = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "comparison with positive arrow",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'comparison with positive arrow'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'comparison with positive arrow' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithPositiveArrow.parameters = {
    kind: "comparison with positive arrow",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithPositiveArrowAndColor = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "comparison with positive arrow and color",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'comparison with positive arrow and color'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'comparison with positive arrow and color' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithPositiveArrowAndColor.parameters = {
    kind: "comparison with positive arrow and color",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithNegativeArrow = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "comparison with negative arrow",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'comparison with negative arrow'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'comparison with negative arrow' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithNegativeArrow.parameters = {
    kind: "comparison with negative arrow",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithNegativeArrowAndColor = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "comparison with negative arrow and color",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'comparison with negative arrow and color'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'comparison with negative arrow and color' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithNegativeArrowAndColor.parameters = {
    kind: "comparison with negative arrow and color",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithEqualsArrow = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "comparison with equals arrow");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'comparison with equals arrow'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'comparison with equals arrow' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithEqualsArrow.parameters = {
    kind: "comparison with equals arrow",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithEqualsArrowAndColor = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "comparison with equals arrow and color",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'comparison with equals arrow and color'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'comparison with equals arrow and color' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithEqualsArrowAndColor.parameters = {
    kind: "comparison with equals arrow and color",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithCustomLabel = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "comparison with custom label");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'comparison with custom label'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'comparison with custom label' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithCustomLabel.parameters = {
    kind: "comparison with custom label",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithPositionOnTop = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "comparison with position on top",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'comparison with position on top'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'comparison with position on top' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithPositionOnTop.parameters = {
    kind: "comparison with position on top",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithPositionOnRight = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(9, 1).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "comparison with position on right",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'comparison with position on right'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'comparison with position on right' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 400 }, scenario.tags)();
    })();
ComparisonWithPositionOnRight.parameters = {
    kind: "comparison with position on right",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;
