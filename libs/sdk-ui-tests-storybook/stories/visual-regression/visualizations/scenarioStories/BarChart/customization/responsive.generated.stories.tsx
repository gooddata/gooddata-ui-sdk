// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    getScenariosGroupByIndexes,
    groupedStory,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/BarChart/customization/responsive",
};

export const $100x70WithoutXAxisWithoutYAxisVerySmallContainer = () =>
    groupedStory(getScenariosGroupByIndexes(1, 17), {
        width: 100,
        height: 70,
    })();
$100x70WithoutXAxisWithoutYAxisVerySmallContainer.parameters = {
    kind: "100x70 - without x axis, without y axis (very small container)",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $650x90WithoutXAxisLabels = () =>
    groupedStory(getScenariosGroupByIndexes(1, 18), {
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
    groupedStory(getScenariosGroupByIndexes(1, 19), {
        width: 650,
        height: 120,
    })();
$650x120WithoutXAxisTitle.parameters = {
    kind: "650x120 - without x axis title",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $120x354WithoutYAxisLabels = () =>
    groupedStory(getScenariosGroupByIndexes(1, 20), {
        width: 120,
        height: 354,
    })();
$120x354WithoutYAxisLabels.parameters = {
    kind: "120x354 - without y axis labels",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $165x354WithoutYAxisTitle = () =>
    groupedStory(getScenariosGroupByIndexes(1, 21), {
        width: 165,
        height: 354,
    })();
$165x354WithoutYAxisTitle.parameters = {
    kind: "165x354 - without y axis title",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;
