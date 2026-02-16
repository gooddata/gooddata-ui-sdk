// (C) 2026 GoodData Corporation

import { type IInsight } from "@gooddata/sdk-model";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/dropdown_icons.css";

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    getScenariosGroupByIndexes,
    plugVizStory,
} from "../../../../../../stories/visual-regression/visualizations/insightStories.js";
import "../../../../../..//stories/visual-regression/visualizations/insightStories.css";

export default {
    title: "04 Stories For Pluggable Vis/LineChart/customization/axes",
};

export const YAxisMinMaxConfiguration = () =>
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
                                        identifier: "dt_oppcreated_timestamp.quarter",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_oppcreated_timestamp.quarter",
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
                identifier: "LineChart.dd2fbeaac58234eadce0f1bed9542acf",
                properties: {
                    controls: {
                        yaxis: {
                            max: "25000000",
                            min: "5000000",
                        },
                    },
                },
                sorts: [],
                title: "LineChart - Y axis min/max configuration",
                uri: "LineChart.dd2fbeaac58234eadce0f1bed9542acf",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 7, 0),
    )();
YAxisMinMaxConfiguration.parameters = {
    kind: "Y axis min/max configuration",
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

export const YAxisOnTheRight = () =>
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
                                        identifier: "dt_oppcreated_timestamp.quarter",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_oppcreated_timestamp.quarter",
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
                identifier: "LineChart.1e340938f43d76525ed6235a33c8ab4c",
                properties: {
                    controls: {
                        secondary_yaxis: {
                            measures: [
                                "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                            ],
                        },
                    },
                },
                sorts: [],
                title: "LineChart - Y axis on the right",
                uri: "LineChart.1e340938f43d76525ed6235a33c8ab4c",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 7, 1),
    )();
YAxisOnTheRight.parameters = {
    kind: "Y axis on the right",
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

export const DualAxesWithOneRightMeasure = () =>
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
                            {
                                measure: {
                                    alias: "Calculated 'Lost' measure",
                                    definition: {
                                        arithmeticMeasure: {
                                            measureIdentifiers: [
                                                "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                                "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                            ],
                                            operator: "difference",
                                        },
                                    },
                                    localIdentifier: "m_358184a8_9fa7cb9ce4d2947059b490e24a925317",
                                },
                            },
                            {
                                measure: {
                                    alias: "Ratio of Won and Lost",
                                    definition: {
                                        arithmeticMeasure: {
                                            measureIdentifiers: [
                                                "m_358184a8_9fa7cb9ce4d2947059b490e24a925317",
                                                "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                            ],
                                            operator: "ratio",
                                        },
                                    },
                                    localIdentifier: "m_7ff816a7_82e019308ff681db5738ce5040bc533d",
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
                                        identifier: "dt_oppcreated_timestamp.quarter",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_oppcreated_timestamp.quarter",
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
                identifier: "LineChart.b387a237e94c58750537dd59d16bbc8d",
                properties: {
                    controls: {
                        secondary_yaxis: {
                            measures: ["m_7ff816a7_82e019308ff681db5738ce5040bc533d"],
                        },
                    },
                },
                sorts: [],
                title: "LineChart - dual axes with one right measure",
                uri: "LineChart.b387a237e94c58750537dd59d16bbc8d",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 7, 2),
    )();
DualAxesWithOneRightMeasure.parameters = {
    kind: "dual axes with one right measure",
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
