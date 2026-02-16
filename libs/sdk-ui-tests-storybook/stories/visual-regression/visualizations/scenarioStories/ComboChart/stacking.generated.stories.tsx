// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    getScenariosGroupByIndexes,
    groupedStory,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/ComboChart/stacking",
};

export const StackPrimaryMeasuresWithDifferentChartType = () =>
    groupedStory(getScenariosGroupByIndexes(5, 24), {
        width: 800,
        height: 400,
    })();
StackPrimaryMeasuresWithDifferentChartType.parameters = {
    kind: "stack primary measures with different chart type",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const StackPrimaryMeasuresTo100WithDifferentChartType = () =>
    groupedStory(getScenariosGroupByIndexes(5, 25), {
        width: 800,
        height: 400,
    })();
StackPrimaryMeasuresTo100WithDifferentChartType.parameters = {
    kind: "stack primary measures to 100% with different chart type",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const StackPrimaryMeasuresWhenBothColumnChart = () =>
    groupedStory(getScenariosGroupByIndexes(5, 26), {
        width: 800,
        height: 400,
    })();
StackPrimaryMeasuresWhenBothColumnChart.parameters = {
    kind: "stack primary measures when both column chart",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DiscardStackingWhenPrimaryMeasuresAreOnLineChart = () =>
    groupedStory(getScenariosGroupByIndexes(5, 27), {
        width: 800,
        height: 400,
    })();
DiscardStackingWhenPrimaryMeasuresAreOnLineChart.parameters = {
    kind: "discard stacking when primary measures are on line chart",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const DiscardStackingWhenPrimaryMeasuresAreNotSpecified = () =>
    groupedStory(getScenariosGroupByIndexes(5, 28), {
        width: 800,
        height: 400,
    })();
DiscardStackingWhenPrimaryMeasuresAreNotSpecified.parameters = {
    kind: "discard stacking when primary measures are not specified",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;

export const StackingWithoutDualAxis = () =>
    groupedStory(getScenariosGroupByIndexes(5, 29), {
        width: 800,
        height: 400,
    })();
StackingWithoutDualAxis.parameters = {
    kind: "stacking without dual axis",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    },
} satisfies IStoryParameters;
