// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    getScenariosGroupByIndexes,
    groupedStory,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/Heatmap/customization/legend responsive",
};

export const $180x400ForcePositionTopMinimisedVariant = () =>
    groupedStory(getScenariosGroupByIndexes(10, 6), {
        width: 180,
        height: 400,
    })();
$180x400ForcePositionTopMinimisedVariant.parameters = {
    kind: "180x400 - Force position TOP, minimised variant",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;

export const $620x400PositionRespectsConfigurationStandardVariant = () =>
    groupedStory(getScenariosGroupByIndexes(10, 7), {
        width: 620,
        height: 400,
    })();
$620x400PositionRespectsConfigurationStandardVariant.parameters = {
    kind: "620x400 - Position respects configuration, standard variant",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
    },
} satisfies IStoryParameters;
