// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    getScenariosGroupByIndexes,
    groupedStory,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/DonutChart/customization/responsive",
};

export const $300x250AutoDataLabels = () =>
    groupedStory(getScenariosGroupByIndexes(6, 14), {
        width: 300,
        height: 250,
    })();
$300x250AutoDataLabels.parameters = {
    kind: "300x250 - auto data labels",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $200x200WithoutDataLabels = () =>
    groupedStory(getScenariosGroupByIndexes(6, 15), {
        width: 200,
        height: 200,
    })();
$200x200WithoutDataLabels.parameters = {
    kind: "200x200 - without data labels",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;
