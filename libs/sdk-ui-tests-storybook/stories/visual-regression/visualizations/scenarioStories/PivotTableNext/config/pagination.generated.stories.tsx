// (C) 2026 GoodData Corporation

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    backend,
    buildStory,
    getScenariosGroupByIndexes,
    withCustomSetting,
} from "../../../../../../stories/visual-regression/visualizations/scenarioStories.js";

export default {
    title: "01 Stories From Test Scenarios/PivotTableNext/config/pagination",
};

export const PaginationWith5RowsPerPage = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "pagination with 5 rows per page",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'pagination with 5 rows per page'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'pagination with 5 rows per page' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
PaginationWith5RowsPerPage.parameters = {
    kind: "pagination with 5 rows per page",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const PaginationWith5RowsPerPageAndTotals = () =>
    (() => {
        const scenarios = getScenariosGroupByIndexes(21, 3).asScenarioDescAndScenario();
        const scenarioAndDescriptions = scenarios.filter(
            ([name]) => name === "pagination with 5 rows per page and totals",
        );
        if (scenarioAndDescriptions.length === 0)
            throw new Error("Failed to find scenario 'pagination with 5 rows per page and totals'");
        if (scenarioAndDescriptions.length > 1)
            throw new Error("Multiple 'pagination with 5 rows per page and totals' scenarios found");
        const scenarioAndDescription = scenarioAndDescriptions[0];

        const scenario = scenarioAndDescription[1];

        const { propsFactory, workspaceType, component: Component } = scenario;
        const props = propsFactory(withCustomSetting(backend, scenario.backendSettings), workspaceType);

        return buildStory(Component, props, { width: 1000, height: 600 }, scenario.tags)();
    })();
PaginationWith5RowsPerPageAndTotals.parameters = {
    kind: "pagination with 5 rows per page and totals",
    screenshot: {
        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;
