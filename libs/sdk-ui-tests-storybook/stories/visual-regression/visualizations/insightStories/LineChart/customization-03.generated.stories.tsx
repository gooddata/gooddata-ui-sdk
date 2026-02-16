// (C) 2026 GoodData Corporation

import { type IInsight } from "@gooddata/sdk-model";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/dropdown_icons.css";

import { type IStoryParameters, State } from "../../../../../stories/_infra/backstopScenario.js";
import {
    getScenariosGroupByIndexes,
    plugVizStory,
} from "../../../../../stories/visual-regression/visualizations/insightStories.js";
import "../../../../..//stories/visual-regression/visualizations/insightStories.css";

export default {
    title: "04 Stories For Pluggable Vis/LineChart/customization",
};

export const DataPointsSparseChartDefault = () =>
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
                identifier: "LineChart.e42047517322f7adc149f3b16bfbede5",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "LineChart - data points - sparse chart - default",
                uri: "LineChart.e42047517322f7adc149f3b16bfbede5",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 3, 0),
    )();
DataPointsSparseChartDefault.parameters = {
    kind: "data points - sparse chart - default",
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

export const DataPointsSparseChartAutoVisibility = () =>
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
                identifier: "LineChart.d1d5671fbe4843b307d8d1cfcdd3eb7e",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: "auto",
                        },
                    },
                },
                sorts: [],
                title: "LineChart - data points - sparse chart - auto visibility",
                uri: "LineChart.d1d5671fbe4843b307d8d1cfcdd3eb7e",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 3, 1),
    )();
DataPointsSparseChartAutoVisibility.parameters = {
    kind: "data points - sparse chart - auto visibility",
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

export const DataPointsSparseChartForcedVisible = () =>
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
                identifier: "LineChart.34043572c98eac3dc8887f3cac95c479",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: true,
                        },
                    },
                },
                sorts: [],
                title: "LineChart - data points - sparse chart - forced visible",
                uri: "LineChart.34043572c98eac3dc8887f3cac95c479",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 3, 2),
    )();
DataPointsSparseChartForcedVisible.parameters = {
    kind: "data points - sparse chart - forced visible",
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

export const DataPointsSparseChartForcedHidden = () =>
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
                identifier: "LineChart.0c3cfda1ddce21d70dd3835cb1225d49",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: false,
                        },
                    },
                },
                sorts: [],
                title: "LineChart - data points - sparse chart - forced hidden",
                uri: "LineChart.0c3cfda1ddce21d70dd3835cb1225d49",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 3, 3),
    )();
DataPointsSparseChartForcedHidden.parameters = {
    kind: "data points - sparse chart - forced hidden",
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

export const DataPointsDenseChartDefault = () =>
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
                        ],
                        localIdentifier: "measures",
                    },
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "label.f_opportunity.opportunity.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_opportunity.opportunity.name",
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
                filters: [
                    {
                        measureValueFilter: {
                            condition: {
                                comparison: {
                                    operator: "GREATER_THAN",
                                    value: 100000,
                                },
                            },
                            measure: {
                                localIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                            },
                        },
                    },
                ],
                identifier: "LineChart.8b6aa8716535cffcbc957ebb58a47127",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "LineChart - data points - dense chart - default",
                uri: "LineChart.8b6aa8716535cffcbc957ebb58a47127",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 3, 4),
    )();
DataPointsDenseChartDefault.parameters = {
    kind: "data points - dense chart - default",
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

export const DataPointsDenseChartAutoVisibility = () =>
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
                        ],
                        localIdentifier: "measures",
                    },
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "label.f_opportunity.opportunity.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_opportunity.opportunity.name",
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
                filters: [
                    {
                        measureValueFilter: {
                            condition: {
                                comparison: {
                                    operator: "GREATER_THAN",
                                    value: 100000,
                                },
                            },
                            measure: {
                                localIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                            },
                        },
                    },
                ],
                identifier: "LineChart.4b9123d4da99344e4873ac9dde1d2347",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: "auto",
                        },
                    },
                },
                sorts: [],
                title: "LineChart - data points - dense chart - auto visibility",
                uri: "LineChart.4b9123d4da99344e4873ac9dde1d2347",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 3, 5),
    )();
DataPointsDenseChartAutoVisibility.parameters = {
    kind: "data points - dense chart - auto visibility",
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

export const DataPointsDenseChartForcedVisible = () =>
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
                        ],
                        localIdentifier: "measures",
                    },
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "label.f_opportunity.opportunity.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_opportunity.opportunity.name",
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
                filters: [
                    {
                        measureValueFilter: {
                            condition: {
                                comparison: {
                                    operator: "GREATER_THAN",
                                    value: 100000,
                                },
                            },
                            measure: {
                                localIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                            },
                        },
                    },
                ],
                identifier: "LineChart.a3da043f2b31dac48b4dd0a2bd96a594",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: true,
                        },
                    },
                },
                sorts: [],
                title: "LineChart - data points - dense chart - forced visible",
                uri: "LineChart.a3da043f2b31dac48b4dd0a2bd96a594",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 3, 6),
    )();
DataPointsDenseChartForcedVisible.parameters = {
    kind: "data points - dense chart - forced visible",
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

export const DataPointsDenseChartForcedHidden = () =>
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
                        ],
                        localIdentifier: "measures",
                    },
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "label.f_opportunity.opportunity.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_opportunity.opportunity.name",
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
                filters: [
                    {
                        measureValueFilter: {
                            condition: {
                                comparison: {
                                    operator: "GREATER_THAN",
                                    value: 100000,
                                },
                            },
                            measure: {
                                localIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                            },
                        },
                    },
                ],
                identifier: "LineChart.458c9384ce6e0a0f8e4e7dc55812a6ce",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: false,
                        },
                    },
                },
                sorts: [],
                title: "LineChart - data points - dense chart - forced hidden",
                uri: "LineChart.458c9384ce6e0a0f8e4e7dc55812a6ce",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 3, 7),
    )();
DataPointsDenseChartForcedHidden.parameters = {
    kind: "data points - dense chart - forced hidden",
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
