// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    getScenariosGroupByIndexes,
    groupedStory,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/LineChart/customization/legend responsive",
};

export const $180x154ForcePositionTopMax1RowGradientLegendMinimized = () =>
    groupedStory(getScenariosGroupByIndexes(11, 12), {
        width: 180,
        height: 154,
    })();
$180x154ForcePositionTopMax1RowGradientLegendMinimized.parameters = {
    kind: "180x154 - Force position TOP, max 1 row, Gradient legend minimized",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $260x154ForcePositionTopMax1RowGradientLegendMinimized = () =>
    groupedStory(getScenariosGroupByIndexes(11, 13), {
        width: 260,
        height: 154,
    })();
$260x154ForcePositionTopMax1RowGradientLegendMinimized.parameters = {
    kind: "260x154 - Force position TOP, max 1 row, Gradient legend minimized",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $180x300ForcePositionTopMax2RowsGradientLegendMinimized = () =>
    groupedStory(getScenariosGroupByIndexes(11, 14), {
        width: 180,
        height: 300,
    })();
$180x300ForcePositionTopMax2RowsGradientLegendMinimized.parameters = {
    kind: "180x300 - Force position TOP, max 2 rows, Gradient legend minimized",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $440x154ForcePositionTopMax1RowGradientLegendNormal = () =>
    groupedStory(getScenariosGroupByIndexes(11, 15), {
        width: 440,
        height: 154,
    })();
$440x154ForcePositionTopMax1RowGradientLegendNormal.parameters = {
    kind: "440x154 - Force position TOP, max 1 row, Gradient legend normal",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $610x154ForcePositionRight = () =>
    groupedStory(getScenariosGroupByIndexes(11, 16), {
        width: 610,
        height: 154,
    })();
$610x154ForcePositionRight.parameters = {
    kind: "610x154 - Force position RIGHT",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $610x194PositionRespectsConfigurationMax1RowForTopBottom = () =>
    groupedStory(getScenariosGroupByIndexes(11, 17), {
        width: 610,
        height: 194,
    })();
$610x194PositionRespectsConfigurationMax1RowForTopBottom.parameters = {
    kind: "610x194 - Position respects configuration, max 1 row for TOP/BOTTOM",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $610x274PositionRespectsConfigurationMax2RowForTopBottom = () =>
    groupedStory(getScenariosGroupByIndexes(11, 18), {
        width: 610,
        height: 274,
    })();
$610x274PositionRespectsConfigurationMax2RowForTopBottom.parameters = {
    kind: "610x274 - Position respects configuration, max 2 row for TOP/BOTTOM",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $650x354PositionRespectsConfigurationMapLegendFitsInto1RowForTopBottom = () =>
    groupedStory(getScenariosGroupByIndexes(11, 19), {
        width: 650,
        height: 354,
    })();
$650x354PositionRespectsConfigurationMapLegendFitsInto1RowForTopBottom.parameters = {
    kind: "650x354 - Position respects configuration, map legend fits into 1 row for TOP/BOTTOM",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;
