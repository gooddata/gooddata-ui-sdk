// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    getScenariosGroupByIndexes,
    groupedStory,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/ColumnChart/customization/responsive",
};

export const $40x60WithoutXAxisWithoutYAxisVerySmallContainer = () =>
    groupedStory(getScenariosGroupByIndexes(4, 16), {
        width: 40,
        height: 60,
    })();
$40x60WithoutXAxisWithoutYAxisVerySmallContainer.parameters = {
    kind: "40x60 - without x axis, without y axis (very small container)",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $650x90WithoutXAxisLabels = () =>
    groupedStory(getScenariosGroupByIndexes(4, 17), {
        width: 650,
        height: 90,
    })();
$650x90WithoutXAxisLabels.parameters = {
    kind: "650x90 - without x axis labels",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $650x120WithoutXAxisTitle = () =>
    groupedStory(getScenariosGroupByIndexes(4, 18), {
        width: 650,
        height: 120,
    })();
$650x120WithoutXAxisTitle.parameters = {
    kind: "650x120 - without x axis title",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $60x354WithoutYAxisLabels = () =>
    groupedStory(getScenariosGroupByIndexes(4, 19), {
        width: 60,
        height: 354,
    })();
$60x354WithoutYAxisLabels.parameters = {
    kind: "60x354 - without y axis labels",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $120x354WithoutYAxisTitle = () =>
    groupedStory(getScenariosGroupByIndexes(4, 20), {
        width: 120,
        height: 354,
    })();
$120x354WithoutYAxisTitle.parameters = {
    kind: "120x354 - without y axis title",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $60x354WithoutYAxisLabelsWithYAxisTitle = () =>
    groupedStory(getScenariosGroupByIndexes(4, 21), {
        width: 60,
        height: 354,
    })();
$60x354WithoutYAxisLabelsWithYAxisTitle.parameters = {
    kind: "60x354 - without y axis labels, with y axis title",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;
