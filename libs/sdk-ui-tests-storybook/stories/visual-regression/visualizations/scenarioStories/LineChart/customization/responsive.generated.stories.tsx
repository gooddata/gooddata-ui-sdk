// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    getScenariosGroupByIndexes,
    groupedStory,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/LineChart/customization/responsive",
};

export const $40x70WithoutXAxisWithoutYAxisVerySmallContainer = () =>
    groupedStory(getScenariosGroupByIndexes(11, 20), {
        width: 40,
        height: 70,
    })();
$40x70WithoutXAxisWithoutYAxisVerySmallContainer.parameters = {
    kind: "40x70 - without x axis, without y axis (very small container)",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $650x90WithoutXAxisLabels = () =>
    groupedStory(getScenariosGroupByIndexes(11, 21), {
        width: 650,
        height: 90,
    })();
$650x90WithoutXAxisLabels.parameters = {
    kind: "650x90 - without x axis labels",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $650x140WithoutXAxisTitle = () =>
    groupedStory(getScenariosGroupByIndexes(11, 22), {
        width: 650,
        height: 140,
    })();
$650x140WithoutXAxisTitle.parameters = {
    kind: "650x140 - without x axis title",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $60x354WithoutYAxisLabels = () =>
    groupedStory(getScenariosGroupByIndexes(11, 23), {
        width: 60,
        height: 354,
    })();
$60x354WithoutYAxisLabels.parameters = {
    kind: "60x354 - without y axis labels",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $140x354WithoutYAxisTitle = () =>
    groupedStory(getScenariosGroupByIndexes(11, 24), {
        width: 140,
        height: 354,
    })();
$140x354WithoutYAxisTitle.parameters = {
    kind: "140x354 - without y axis title",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $60x354WithoutYAxisLabelsWithYAxisTitle = () =>
    groupedStory(getScenariosGroupByIndexes(11, 25), {
        width: 60,
        height: 354,
    })();
$60x354WithoutYAxisLabelsWithYAxisTitle.parameters = {
    kind: "60x354 - without y axis labels, with y axis title",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;
