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
    title: "04 Stories For Pluggable Vis/ColumnChart/stacking",
};

export const TwoMeasuresAndTwoViewbyWithStackmeasures = () =>
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
                                },
                            },
                        ],
                        localIdentifier: "view",
                    },
                    {
                        items: [],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "ColumnChart.2d409c3fb03a652a74b99638a669b8f4",
                properties: {
                    controls: {
                        stackMeasures: true,
                    },
                },
                sorts: [],
                title: "ColumnChart - two measures and two viewBy with stackMeasures",
                uri: "ColumnChart.2d409c3fb03a652a74b99638a669b8f4",
                visualizationUrl: "local:column",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(4, 24, 0),
    )();
TwoMeasuresAndTwoViewbyWithStackmeasures.parameters = {
    kind: "two measures and two viewBy with stackMeasures",
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

export const TwoMeasuresAndTwoViewbyWithStackmeasurestopercent = () =>
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
                                },
                            },
                        ],
                        localIdentifier: "view",
                    },
                    {
                        items: [],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "ColumnChart.2fd3062807f240a5bb89d671ee22d0e7",
                properties: {
                    controls: {
                        stackMeasuresToPercent: true,
                    },
                },
                sorts: [],
                title: "ColumnChart - two measures and two viewBy with stackMeasuresToPercent",
                uri: "ColumnChart.2fd3062807f240a5bb89d671ee22d0e7",
                visualizationUrl: "local:column",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(4, 24, 1),
    )();
TwoMeasuresAndTwoViewbyWithStackmeasurestopercent.parameters = {
    kind: "two measures and two viewBy with stackMeasuresToPercent",
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

export const TwoMeasuresAndTwoViewbyWithRightAxisAndStackmeasurestopercent = () =>
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
                                },
                            },
                        ],
                        localIdentifier: "view",
                    },
                    {
                        items: [],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "ColumnChart.d21d7ef7e9ed02fbd0987e704fd96f68",
                properties: {
                    controls: {
                        secondary_yaxis: {
                            measures: [
                                "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                            ],
                        },
                        stackMeasuresToPercent: true,
                    },
                },
                sorts: [],
                title: "ColumnChart - two measures and two viewBy with right axis and stackMeasuresToPercent",
                uri: "ColumnChart.d21d7ef7e9ed02fbd0987e704fd96f68",
                visualizationUrl: "local:column",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(4, 24, 2),
    )();
TwoMeasuresAndTwoViewbyWithRightAxisAndStackmeasurestopercent.parameters = {
    kind: "two measures and two viewBy with right axis and stackMeasuresToPercent",
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

export const StackMeasuresTo100WithAndAxisMinMax = () =>
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
                                },
                            },
                        ],
                        localIdentifier: "view",
                    },
                    {
                        items: [],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "ColumnChart.9734f5d20a842690a4ad77294a025f1a",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                        stackMeasuresToPercent: true,
                        yaxis: {
                            max: "0.9",
                            min: "0.1",
                        },
                    },
                },
                sorts: [],
                title: "ColumnChart - Stack measures to 100% with and axis min/max",
                uri: "ColumnChart.9734f5d20a842690a4ad77294a025f1a",
                visualizationUrl: "local:column",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(4, 24, 3),
    )();
StackMeasuresTo100WithAndAxisMinMax.parameters = {
    kind: "Stack measures to 100% with and axis min/max",
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

export const TwoMeasuresWithDualAxisIgnoresStackMeasures = () =>
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
                                },
                            },
                        ],
                        localIdentifier: "view",
                    },
                    {
                        items: [],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "ColumnChart.ae5fb577ced044b2ee37d1e39b3de8e6",
                properties: {
                    controls: {
                        secondary_yaxis: {
                            measures: ["m_87a053b0_3947_49f3_b0c5_de53fd01f050"],
                        },
                        stackMeasures: true,
                    },
                },
                sorts: [],
                title: "ColumnChart - two measures with dual axis ignores stack measures",
                uri: "ColumnChart.ae5fb577ced044b2ee37d1e39b3de8e6",
                visualizationUrl: "local:column",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(4, 24, 4),
    )();
TwoMeasuresWithDualAxisIgnoresStackMeasures.parameters = {
    kind: "two measures with dual axis ignores stack measures",
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

export const TwoMeasuresWithDualAxisAndStackMeasuresTo100 = () =>
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
                                },
                            },
                        ],
                        localIdentifier: "view",
                    },
                    {
                        items: [],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "ColumnChart.9316349da207566f196a6e52a855e46b",
                properties: {
                    controls: {
                        secondary_yaxis: {
                            measures: ["m_87a053b0_3947_49f3_b0c5_de53fd01f050"],
                        },
                        stackMeasuresToPercent: true,
                    },
                },
                sorts: [],
                title: "ColumnChart - two measures with dual axis and stack measures to 100%",
                uri: "ColumnChart.9316349da207566f196a6e52a855e46b",
                visualizationUrl: "local:column",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(4, 24, 5),
    )();
TwoMeasuresWithDualAxisAndStackMeasuresTo100.parameters = {
    kind: "two measures with dual axis and stack measures to 100%",
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

export const StackMeasuresAndDualAxis = () =>
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "view",
                    },
                    {
                        items: [],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "ColumnChart.33344970efff62dab11f154a504fe2f1",
                properties: {
                    controls: {
                        secondary_yaxis: {
                            measures: ["m_7ff816a7_82e019308ff681db5738ce5040bc533d"],
                        },
                        stackMeasures: true,
                    },
                },
                sorts: [],
                title: "ColumnChart - stack measures and dual axis",
                uri: "ColumnChart.33344970efff62dab11f154a504fe2f1",
                visualizationUrl: "local:column",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(4, 24, 6),
    )();
StackMeasuresAndDualAxis.parameters = {
    kind: "stack measures and dual axis",
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

export const StackMeasuresTo100AndDualAxis = () =>
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "view",
                    },
                    {
                        items: [],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "ColumnChart.9b5eb36b8b1a70103433cdd071f5048c",
                properties: {
                    controls: {
                        secondary_yaxis: {
                            measures: ["m_7ff816a7_82e019308ff681db5738ce5040bc533d"],
                        },
                        stackMeasuresToPercent: true,
                    },
                },
                sorts: [],
                title: "ColumnChart - stack measures to 100% and dual axis",
                uri: "ColumnChart.9b5eb36b8b1a70103433cdd071f5048c",
                visualizationUrl: "local:column",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(4, 24, 7),
    )();
StackMeasuresTo100AndDualAxis.parameters = {
    kind: "stack measures to 100% and dual axis",
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

export const StackMeasuresTo100WithDualAxisAndAxisMinMax = () =>
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "view",
                    },
                    {
                        items: [],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "ColumnChart.eb08731e5397c48ad7e458d4f04eb6bb",
                properties: {
                    controls: {
                        secondary_yaxis: {
                            max: "2",
                            measures: ["m_7ff816a7_82e019308ff681db5738ce5040bc533d"],
                            min: "1",
                        },
                        stackMeasuresToPercent: true,
                        yaxis: {
                            max: "0.9",
                            min: "0.1",
                        },
                    },
                },
                sorts: [],
                title: "ColumnChart - stack measures to 100% with dual axis and axis min/max",
                uri: "ColumnChart.eb08731e5397c48ad7e458d4f04eb6bb",
                visualizationUrl: "local:column",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(4, 24, 8),
    )();
StackMeasuresTo100WithDualAxisAndAxisMinMax.parameters = {
    kind: "stack measures to 100% with dual axis and axis min/max",
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

export const SingleMeasureIgnoresStackMeasures = () =>
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "view",
                    },
                    {
                        items: [],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "ColumnChart.dd99a0f74cad15f75536c9e47e79fd1b",
                properties: {
                    controls: {
                        stackMeasures: true,
                    },
                },
                sorts: [],
                title: "ColumnChart - single measure ignores stack measures",
                uri: "ColumnChart.dd99a0f74cad15f75536c9e47e79fd1b",
                visualizationUrl: "local:column",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(4, 24, 9),
    )();
SingleMeasureIgnoresStackMeasures.parameters = {
    kind: "single measure ignores stack measures",
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

export const SingleMeasureWithStackTo100 = () =>
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "view",
                    },
                    {
                        items: [],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "ColumnChart.62f9bd47437b41467139e109d2485e1c",
                properties: {
                    controls: {
                        stackMeasuresToPercent: true,
                    },
                },
                sorts: [],
                title: "ColumnChart - single measure with stack to 100%",
                uri: "ColumnChart.62f9bd47437b41467139e109d2485e1c",
                visualizationUrl: "local:column",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(4, 24, 10),
    )();
SingleMeasureWithStackTo100.parameters = {
    kind: "single measure with stack to 100%",
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
