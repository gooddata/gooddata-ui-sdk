// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    getScenariosGroupByIndexes,
    groupedStory,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/BulletChart/customization/responsive",
};

export const $80x50WithoutXAxisWithoutYAxisVerySmallContainer = () =>
    groupedStory(getScenariosGroupByIndexes(3, 15), {
        width: 80,
        height: 50,
    })();
$80x50WithoutXAxisWithoutYAxisVerySmallContainer.parameters = {
    kind: "80x50 - without x axis, without y axis (very small container)",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $650x50WithoutXAxisLabels = () =>
    groupedStory(getScenariosGroupByIndexes(3, 16), {
        width: 650,
        height: 50,
    })();
$650x50WithoutXAxisLabels.parameters = {
    kind: "650x50 - without x axis labels",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $140x354WithoutYAxisLabels = () =>
    groupedStory(getScenariosGroupByIndexes(3, 17), {
        width: 140,
        height: 354,
    })();
$140x354WithoutYAxisLabels.parameters = {
    kind: "140x354 - without y axis labels",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $165x354WithoutYAxisTitle = () =>
    groupedStory(getScenariosGroupByIndexes(3, 18), {
        width: 165,
        height: 354,
    })();
$165x354WithoutYAxisTitle.parameters = {
    kind: "165x354 - without y axis title",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $650x120WithoutXAxisTitle = () =>
    groupedStory(getScenariosGroupByIndexes(3, 19), {
        width: 650,
        height: 120,
    })();
$650x120WithoutXAxisTitle.parameters = {
    kind: "650x120 - without x axis title",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $650x80WithoutXAxisLabelsWithXAxisTitle = () =>
    groupedStory(getScenariosGroupByIndexes(3, 20), {
        width: 650,
        height: 80,
    })();
$650x80WithoutXAxisLabelsWithXAxisTitle.parameters = {
    kind: "650x80 - without x axis labels, with x axis title",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;
