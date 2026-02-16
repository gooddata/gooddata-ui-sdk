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
    title: "04 Stories For Pluggable Vis/ComboChart/base",
};

export const OnePrimaryMeasure = () =>
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
                        items: [],
                        localIdentifier: "secondary_measures",
                    },
                    {
                        items: [],
                        localIdentifier: "view",
                    },
                ],
                filters: [],
                identifier: "ComboChart.25021c550c2449812b428b2252cf75fb",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "ComboChart - one primary measure",
                uri: "ComboChart.25021c550c2449812b428b2252cf75fb",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 0, 0),
    )();
OnePrimaryMeasure.parameters = {
    kind: "one primary measure",
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

export const OnePrimaryMeasureWithViewby = () =>
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
                        items: [],
                        localIdentifier: "secondary_measures",
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
                ],
                filters: [],
                identifier: "ComboChart.df878e754e2f98b69abf19357625af21",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "ComboChart - one primary measure with viewBy",
                uri: "ComboChart.df878e754e2f98b69abf19357625af21",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 0, 1),
    )();
OnePrimaryMeasureWithViewby.parameters = {
    kind: "one primary measure with viewBy",
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

export const TwoSecondaryMeasureWithViewby = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [],
                        localIdentifier: "measures",
                    },
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
                        localIdentifier: "secondary_measures",
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
                ],
                filters: [],
                identifier: "ComboChart.e3e36d99546cb5cc0e2ac5c6c9a50c33",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "ComboChart - two secondary measure with viewBy",
                uri: "ComboChart.e3e36d99546cb5cc0e2ac5c6c9a50c33",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 0, 2),
    )();
TwoSecondaryMeasureWithViewby.parameters = {
    kind: "two secondary measure with viewBy",
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

export const OneSecondaryMeasureWithViewby = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [],
                        localIdentifier: "measures",
                    },
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
                        localIdentifier: "secondary_measures",
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
                ],
                filters: [],
                identifier: "ComboChart.bc30b55ed39b8205ddcae4098b594f69",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "ComboChart - one secondary measure with viewBy",
                uri: "ComboChart.bc30b55ed39b8205ddcae4098b594f69",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 0, 3),
    )();
OneSecondaryMeasureWithViewby.parameters = {
    kind: "one secondary measure with viewBy",
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

export const OnePrimaryAndSecondaryMeasureNoViewby = () =>
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
                        localIdentifier: "secondary_measures",
                    },
                    {
                        items: [],
                        localIdentifier: "view",
                    },
                ],
                filters: [],
                identifier: "ComboChart.51a519c3617b3daec03eabbba948b3d3",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "ComboChart - one primary and secondary measure no viewBy",
                uri: "ComboChart.51a519c3617b3daec03eabbba948b3d3",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 0, 4),
    )();
OnePrimaryAndSecondaryMeasureNoViewby.parameters = {
    kind: "one primary and secondary measure no viewBy",
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

export const OnePrimaryAndSecondaryMeasureWithViewbySortedByAttr = () =>
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
                        localIdentifier: "secondary_measures",
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
                ],
                filters: [],
                identifier: "ComboChart.64135239f9f66d250e14579ef50513f4",
                properties: {
                    controls: {},
                },
                sorts: [
                    {
                        attributeSortItem: {
                            attributeIdentifier: "a_label.f_product.product.name",
                            direction: "desc",
                        },
                    },
                ],
                title: "ComboChart - one primary and secondary measure with viewBy sorted by attr",
                uri: "ComboChart.64135239f9f66d250e14579ef50513f4",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 0, 5),
    )();
OnePrimaryAndSecondaryMeasureWithViewbySortedByAttr.parameters = {
    kind: "one primary and secondary measure with viewBy sorted by attr",
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

export const OnePrimaryAndSecondaryMeasureWithViewbySortedByPrimaryMeasure = () =>
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
                        localIdentifier: "secondary_measures",
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
                ],
                filters: [],
                identifier: "ComboChart.eeaf82dd751072f09dc8f7236c805f68",
                properties: {
                    controls: {},
                },
                sorts: [
                    {
                        measureSortItem: {
                            direction: "desc",
                            locators: [
                                {
                                    measureLocatorItem: {
                                        measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                    },
                                },
                            ],
                        },
                    },
                ],
                title: "ComboChart - one primary and secondary measure with viewBy sorted by primary measure",
                uri: "ComboChart.eeaf82dd751072f09dc8f7236c805f68",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 0, 6),
    )();
OnePrimaryAndSecondaryMeasureWithViewbySortedByPrimaryMeasure.parameters = {
    kind: "one primary and secondary measure with viewBy sorted by primary measure",
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

export const OnePrimaryAndSecondaryMeasureWithViewbySortedBySecondaryMeasure = () =>
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
                        localIdentifier: "secondary_measures",
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
                ],
                filters: [],
                identifier: "ComboChart.2d62dbd040a7baeb541a17abd294e25b",
                properties: {
                    controls: {},
                },
                sorts: [
                    {
                        measureSortItem: {
                            direction: "desc",
                            locators: [
                                {
                                    measureLocatorItem: {
                                        measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                    },
                                },
                            ],
                        },
                    },
                ],
                title: "ComboChart - one primary and secondary measure with viewBy sorted by secondary measure",
                uri: "ComboChart.2d62dbd040a7baeb541a17abd294e25b",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 0, 7),
    )();
OnePrimaryAndSecondaryMeasureWithViewbySortedBySecondaryMeasure.parameters = {
    kind: "one primary and secondary measure with viewBy sorted by secondary measure",
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

export const OnePrimaryAndSecondaryMeasureWithViewby = () =>
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
                        localIdentifier: "secondary_measures",
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
                ],
                filters: [],
                identifier: "ComboChart.fe937fb758bda8638fc31fbfd10ba5ed",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "ComboChart - one primary and secondary measure with viewBy",
                uri: "ComboChart.fe937fb758bda8638fc31fbfd10ba5ed",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 0, 8),
    )();
OnePrimaryAndSecondaryMeasureWithViewby.parameters = {
    kind: "one primary and secondary measure with viewBy",
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

export const MultiplePrimaryAndSecondaryMeasuresWithViewby = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Min Amount",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "min",
                                            item: {
                                                identifier: "f_opportunitysnapshot.f_amount",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_e9c321cf_f_opportunitysnapshot.f_amount_min",
                                },
                            },
                            {
                                measure: {
                                    alias: "Median Amount",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "median",
                                            item: {
                                                identifier: "f_opportunitysnapshot.f_amount",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_899a31be_f_opportunitysnapshot.f_amount_median",
                                },
                            },
                            {
                                measure: {
                                    alias: "Max Amount",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "max",
                                            item: {
                                                identifier: "f_opportunitysnapshot.f_amount",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_5c640258_f_opportunitysnapshot.f_amount_max",
                                },
                            },
                        ],
                        localIdentifier: "measures",
                    },
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
                        ],
                        localIdentifier: "secondary_measures",
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
                ],
                filters: [],
                identifier: "ComboChart.989ff2df3150deaf75e126b19d048100",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "ComboChart - multiple primary and secondary measures with viewBy",
                uri: "ComboChart.989ff2df3150deaf75e126b19d048100",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 0, 9),
    )();
MultiplePrimaryAndSecondaryMeasuresWithViewby.parameters = {
    kind: "multiple primary and secondary measures with viewBy",
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

export const MultipleMeasuresAndNoViewby = () =>
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
                        ],
                        localIdentifier: "measures",
                    },
                    {
                        items: [
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
                        localIdentifier: "secondary_measures",
                    },
                    {
                        items: [],
                        localIdentifier: "view",
                    },
                ],
                filters: [],
                identifier: "ComboChart.ce55fc5c7ffeb85429dec261cc16bb33",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "ComboChart - multiple measures and no viewBy",
                uri: "ComboChart.ce55fc5c7ffeb85429dec261cc16bb33",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 0, 10),
    )();
MultipleMeasuresAndNoViewby.parameters = {
    kind: "multiple measures and no viewBy",
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

export const ArithmeticMeasures = () =>
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
                        ],
                        localIdentifier: "measures",
                    },
                    {
                        items: [
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
                        localIdentifier: "secondary_measures",
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
                ],
                filters: [],
                identifier: "ComboChart.5f37ca2fb2ee5ce7db5cd0baa57a9e1b",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "ComboChart - arithmetic measures",
                uri: "ComboChart.5f37ca2fb2ee5ce7db5cd0baa57a9e1b",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 0, 11),
    )();
ArithmeticMeasures.parameters = {
    kind: "arithmetic measures",
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

export const TwoMeasuresWithNullValues = () =>
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
                        localIdentifier: "secondary_measures",
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
                        localIdentifier: "view",
                    },
                ],
                filters: [],
                identifier: "ComboChart.9c15797a3176f044ff23129abd7608ea",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "ComboChart - two measures with null values",
                uri: "ComboChart.9c15797a3176f044ff23129abd7608ea",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 0, 12),
    )();
TwoMeasuresWithNullValues.parameters = {
    kind: "two measures with null values",
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
