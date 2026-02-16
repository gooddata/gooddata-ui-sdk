// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    getScenariosGroupByIndexes,
    groupedStory,
} from "../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/BulletChart/customization",
};

export const LegendPosition = () =>
    groupedStory(getScenariosGroupByIndexes(3, 1), {
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
    groupedStory(getScenariosGroupByIndexes(3, 2), {
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
