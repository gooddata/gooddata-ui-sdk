// (C) 2026 GoodData Corporation

import { type IInsight } from "@gooddata/sdk-model";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/dropdown_icons.css";

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    getScenariosGroupByIndexes,
    plugVizStory,
} from "../../../../../../stories/visual-regression/visualizations/insightStories.js";
import "../../../../../..//stories/visual-regression/visualizations/insightStories.css";

export default {
    title: "04 Stories For Pluggable Vis/LineChart/customization/line shape",
};

export const LineShapeDefault = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "87a053b0-3947-49f3-b0c5-de53fd01f050",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                },
                            },
                            {
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "e519fa2a-86c3-4e32-8313-0c03062348j3",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                },
                            },
                        ],
                        localIdentifier: "measures",
                    },
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "dt_closedate_timestamp.year",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_closedate_timestamp.year",
                                },
                            },
                        ],
                        localIdentifier: "trend",
                    },
                    {
                        items: [],
                        localIdentifier: "segment",
                    },
                ],
                filters: [],
                identifier: "LineChart.d77a71045611522a5b49d3e8049efdf8",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                    },
                },
                sorts: [],
                title: "LineChart - line shape - default",
                uri: "LineChart.d77a71045611522a5b49d3e8049efdf8",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 20, 0),
    )();
LineShapeDefault.parameters = {
    kind: "line shape - default",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 200,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
    },
} satisfies IStoryParameters;

export const LineShapeLinear = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "87a053b0-3947-49f3-b0c5-de53fd01f050",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                },
                            },
                            {
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "e519fa2a-86c3-4e32-8313-0c03062348j3",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                },
                            },
                        ],
                        localIdentifier: "measures",
                    },
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "dt_closedate_timestamp.year",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_closedate_timestamp.year",
                                },
                            },
                        ],
                        localIdentifier: "trend",
                    },
                    {
                        items: [],
                        localIdentifier: "segment",
                    },
                ],
                filters: [],
                identifier: "LineChart.e1292fc8eb8f9bd0f920be6bbcced0c1",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                        lineShape: "linear",
                    },
                },
                sorts: [],
                title: "LineChart - line shape - linear",
                uri: "LineChart.e1292fc8eb8f9bd0f920be6bbcced0c1",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 20, 1),
    )();
LineShapeLinear.parameters = {
    kind: "line shape - linear",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 200,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
    },
} satisfies IStoryParameters;

export const LineShapeSpline = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "87a053b0-3947-49f3-b0c5-de53fd01f050",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                },
                            },
                            {
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "e519fa2a-86c3-4e32-8313-0c03062348j3",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                },
                            },
                        ],
                        localIdentifier: "measures",
                    },
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "dt_closedate_timestamp.year",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_closedate_timestamp.year",
                                },
                            },
                        ],
                        localIdentifier: "trend",
                    },
                    {
                        items: [],
                        localIdentifier: "segment",
                    },
                ],
                filters: [],
                identifier: "LineChart.dd0d65df9080d65b45d87874ae9dc9a1",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                        lineShape: "spline",
                    },
                },
                sorts: [],
                title: "LineChart - line shape - spline",
                uri: "LineChart.dd0d65df9080d65b45d87874ae9dc9a1",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 20, 2),
    )();
LineShapeSpline.parameters = {
    kind: "line shape - spline",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 200,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
    },
} satisfies IStoryParameters;

export const LineShapeStepped = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "87a053b0-3947-49f3-b0c5-de53fd01f050",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                },
                            },
                            {
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "e519fa2a-86c3-4e32-8313-0c03062348j3",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                },
                            },
                        ],
                        localIdentifier: "measures",
                    },
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "dt_closedate_timestamp.year",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_closedate_timestamp.year",
                                },
                            },
                        ],
                        localIdentifier: "trend",
                    },
                    {
                        items: [],
                        localIdentifier: "segment",
                    },
                ],
                filters: [],
                identifier: "LineChart.89adca34748b96eb6ff0ac57d3043681",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                        lineShape: "stepped",
                    },
                },
                sorts: [],
                title: "LineChart - line shape - stepped",
                uri: "LineChart.89adca34748b96eb6ff0ac57d3043681",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 20, 3),
    )();
LineShapeStepped.parameters = {
    kind: "line shape - stepped",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 200,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
    },
} satisfies IStoryParameters;
