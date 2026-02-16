// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    groupedStory,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/ColumnChart/customization/axes",
};

export const YAxisMinMaxConfiguration = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "Y axis min/max configuration");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'Y axis min/max configuration'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'Y axis min/max configuration' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
YAxisMinMaxConfiguration.parameters = {
    kind: "Y axis min/max configuration",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const YAxisOnRight = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "Y axis on right");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'Y axis on right'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'Y axis on right' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
YAxisOnRight.parameters = {
    kind: "Y axis on right",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const NoGridline = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "no gridline");
        if (scenarioAndDescriptions.length === 0) throw new Error("Failed to find scenario 'no gridline'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'no gridline' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
NoGridline.parameters = {
    kind: "no gridline",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DualAxisWithOneRightMeasureAndThreeLeft = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "dual axis with one right measure and three left",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'dual axis with one right measure and three left'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'dual axis with one right measure and three left' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
DualAxisWithOneRightMeasureAndThreeLeft.parameters = {
    kind: "dual axis with one right measure and three left",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DualAxisWithRightAxisLabelsRotated = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "dual axis with right axis labels rotated",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'dual axis with right axis labels rotated'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'dual axis with right axis labels rotated' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
DualAxisWithRightAxisLabelsRotated.parameters = {
    kind: "dual axis with right axis labels rotated",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DualAxisWithHiddenRightYAxis = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "dual axis with hidden right Y axis",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'dual axis with hidden right Y axis'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'dual axis with hidden right Y axis' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
DualAxisWithHiddenRightYAxis.parameters = {
    kind: "dual axis with hidden right Y axis",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DualAxisWithNoLabelsOnRightYAxis = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "dual axis with no labels on right Y axis",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'dual axis with no labels on right Y axis'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'dual axis with no labels on right Y axis' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
DualAxisWithNoLabelsOnRightYAxis.parameters = {
    kind: "dual axis with no labels on right Y axis",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DualAxisWhenTwoViewbyAttributes = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "dual axis when two viewBy attributes",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'dual axis when two viewBy attributes'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'dual axis when two viewBy attributes' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
DualAxisWhenTwoViewbyAttributes.parameters = {
    kind: "dual axis when two viewBy attributes",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAxisRotation = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "X axis rotation");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'X axis rotation'");
        if (scenarioAndDescriptions.length > 1) throw new Error("Multiple 'X axis rotation' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
XAxisRotation.parameters = {
    kind: "X axis rotation",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAxisInvisible = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "X axis invisible");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'X axis invisible'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'X axis invisible' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
XAxisInvisible.parameters = {
    kind: "X axis invisible",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const XAndYAxisInvisible = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(([name]) => name === "X and Y axis invisible");
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'X and Y axis invisible'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'X and Y axis invisible' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
XAndYAxisInvisible.parameters = {
    kind: "X and Y axis invisible",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const YAxisOnRightWithTwoViewbyAttributes = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(4, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "Y axis on right with two viewBy attributes",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'Y axis on right with two viewBy attributes'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'Y axis on right with two viewBy attributes' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 800, height: 600 }, scenario.tags)();
    })();
YAxisOnRightWithTwoViewbyAttributes.parameters = {
    kind: "Y axis on right with two viewBy attributes",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const SingleAxisNameCustomization = () =>
    groupedStory(getScenariosGroupByIndexes(4, 4), {
        width: 800,
        height: 600,
    })();
SingleAxisNameCustomization.parameters = {
    kind: "single axis name customization",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DualAxisNameCustomization = () =>
    groupedStory(getScenariosGroupByIndexes(4, 5), {
        width: 800,
        height: 600,
    })();
DualAxisNameCustomization.parameters = {
    kind: "dual axis name customization",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
