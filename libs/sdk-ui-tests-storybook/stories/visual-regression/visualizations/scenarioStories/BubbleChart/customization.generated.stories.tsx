// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    getScenariosGroupByIndexes,
    groupedStory,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/BubbleChart/customization",
};

export const LegendPosition = () =>
    groupedStory(getScenariosGroupByIndexes(2, 1), {
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
    groupedStory(getScenariosGroupByIndexes(2, 2), {
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

export const SingleSeriesMode = () =>
    groupedStory(getScenariosGroupByIndexes(2, 3), {
        width: 800,
        height: 400,
    })();
SingleSeriesMode.parameters = {
    kind: "single series mode",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;
