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
    title: "04 Stories For Pluggable Vis/BarChart/base",
};

export const SingleMeasure = () =>
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
                        localIdentifier: "view",
                    },
                    {
                        items: [],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.45beabdd49035f39271e8476d5b93b49",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "BarChart - single measure",
                uri: "BarChart.45beabdd49035f39271e8476d5b93b49",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 0, 0),
    )();
SingleMeasure.parameters = {
    kind: "single measure",
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

export const SingleMeasureWithViewby = () =>
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
                identifier: "BarChart.d0c22f6db4d7414e4b479f9d4b23a26b",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "BarChart - single measure with viewBy",
                uri: "BarChart.d0c22f6db4d7414e4b479f9d4b23a26b",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 0, 1),
    )();
SingleMeasureWithViewby.parameters = {
    kind: "single measure with viewBy",
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

export const SingleMeasureWithViewbyAndStackby = () =>
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
                        items: [
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
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.4f67e58629863f139c791769bb8df688",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "BarChart - single measure with viewBy and stackBy",
                uri: "BarChart.4f67e58629863f139c791769bb8df688",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 0, 2),
    )();
SingleMeasureWithViewbyAndStackby.parameters = {
    kind: "single measure with viewBy and stackBy",
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

export const SingleMeasureWithTwoViewbyAndStack = () =>
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
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_owner.department_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.department_id",
                                },
                            },
                        ],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.87dda7ca663eb21ab791608bbeec59d5",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "BarChart - single measure with two viewBy and stack",
                uri: "BarChart.87dda7ca663eb21ab791608bbeec59d5",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 0, 3),
    )();
SingleMeasureWithTwoViewbyAndStack.parameters = {
    kind: "single measure with two viewBy and stack",
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

export const TwoMeasuresWithViewby = () =>
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
                        ],
                        localIdentifier: "view",
                    },
                    {
                        items: [],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.07f578eb761f5b47360b308ef12684ca",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "BarChart - two measures with viewBy",
                uri: "BarChart.07f578eb761f5b47360b308ef12684ca",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 0, 4),
    )();
TwoMeasuresWithViewby.parameters = {
    kind: "two measures with viewBy",
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

export const TwoMeasuresWithTwoViewby = () =>
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
                identifier: "BarChart.05c951e8cdc2790825682b5efcd3d74d",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "BarChart - two measures with two viewBy",
                uri: "BarChart.05c951e8cdc2790825682b5efcd3d74d",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 0, 5),
    )();
TwoMeasuresWithTwoViewby.parameters = {
    kind: "two measures with two viewBy",
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

export const TwoMeasuresWithTwoViewbyFilteredToSingleValue = () =>
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
                filters: [
                    {
                        positiveAttributeFilter: {
                            displayForm: {
                                identifier: "label.f_product.product.name",
                                type: "displayForm",
                            },
                            in: {
                                values: ["WonderKid"],
                            },
                        },
                    },
                    {
                        positiveAttributeFilter: {
                            displayForm: {
                                identifier: "f_owner.region_id",
                                type: "displayForm",
                            },
                            in: {
                                values: ["East Coast"],
                            },
                        },
                    },
                ],
                identifier: "BarChart.e6118af247791b3520e54ec2881134fb",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "BarChart - two measures with two viewBy, filtered to single value",
                uri: "BarChart.e6118af247791b3520e54ec2881134fb",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 0, 6),
    )();
TwoMeasuresWithTwoViewbyFilteredToSingleValue.parameters = {
    kind: "two measures with two viewBy, filtered to single value",
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

export const TwoMeasuresWithViewbySortedByAttribute = () =>
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
                        ],
                        localIdentifier: "view",
                    },
                    {
                        items: [],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.860b8a056b59bddd0964d1ea48e797d6",
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
                title: "BarChart - two measures with viewBy sorted by attribute",
                uri: "BarChart.860b8a056b59bddd0964d1ea48e797d6",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 0, 7),
    )();
TwoMeasuresWithViewbySortedByAttribute.parameters = {
    kind: "two measures with viewBy sorted by attribute",
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

export const TwoMeasuresWithViewbySortedByMeasure = () =>
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
                        ],
                        localIdentifier: "view",
                    },
                    {
                        items: [],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.f4f634bd4229903b65279b296d646d5e",
                properties: {
                    controls: {},
                },
                sorts: [
                    {
                        measureSortItem: {
                            direction: "asc",
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
                title: "BarChart - two measures with viewBy sorted by measure",
                uri: "BarChart.f4f634bd4229903b65279b296d646d5e",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 0, 8),
    )();
TwoMeasuresWithViewbySortedByMeasure.parameters = {
    kind: "two measures with viewBy sorted by measure",
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

export const ViewbyDateAndPopMeasure = () =>
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
                                    alias: "Won Last Year",
                                    definition: {
                                        popMeasureDefinition: {
                                            measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                            popAttribute: {
                                                identifier: "dt_closedate_timestamp.year",
                                                type: "attribute",
                                            },
                                        },
                                    },
                                    localIdentifier:
                                        "m_e40a8329_m_e519fa2a_86c3_4e32_8313_0c03062348j3_dt_closedate_timestamp.year",
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
                        localIdentifier: "view",
                    },
                    {
                        items: [],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.b0d2e37948366d986748d8bbc9e6b270",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "BarChart - viewBy date and PoP measure",
                uri: "BarChart.b0d2e37948366d986748d8bbc9e6b270",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 0, 9),
    )();
ViewbyDateAndPopMeasure.parameters = {
    kind: "viewBy date and PoP measure",
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
                identifier: "BarChart.3eda94cbe0c9578c8cf7e5c6b227be4f",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "BarChart - arithmetic measures",
                uri: "BarChart.3eda94cbe0c9578c8cf7e5c6b227be4f",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 0, 10),
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

export const FourMeasuresAndPop = () =>
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
                                    alias: "Won Last Year",
                                    definition: {
                                        popMeasureDefinition: {
                                            measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                            popAttribute: {
                                                identifier: "dt_closedate_timestamp.year",
                                                type: "attribute",
                                            },
                                        },
                                    },
                                    localIdentifier:
                                        "m_e40a8329_m_e519fa2a_86c3_4e32_8313_0c03062348j3_dt_closedate_timestamp.year",
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
                                        identifier: "dt_closedate_timestamp.year",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_closedate_timestamp.year",
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
                identifier: "BarChart.e189b9db80a38a0d68059130702f6154",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "BarChart - four measures and PoP",
                uri: "BarChart.e189b9db80a38a0d68059130702f6154",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 0, 11),
    )();
FourMeasuresAndPop.parameters = {
    kind: "four measures and PoP",
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

export const ViewbyWithTwoDates = () =>
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
                                    alias: "Won Last Year",
                                    definition: {
                                        popMeasureDefinition: {
                                            measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                            popAttribute: {
                                                identifier: "dt_closedate_timestamp.year",
                                                type: "attribute",
                                            },
                                        },
                                    },
                                    localIdentifier:
                                        "m_e40a8329_m_e519fa2a_86c3_4e32_8313_0c03062348j3_dt_closedate_timestamp.year",
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
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "dt_closedate_timestamp.year",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "closed.second",
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
                identifier: "BarChart.814c2f71efef3eb850af9f0c1775c452",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "BarChart - viewBy with two dates",
                uri: "BarChart.814c2f71efef3eb850af9f0c1775c452",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 0, 12),
    )();
ViewbyWithTwoDates.parameters = {
    kind: "viewBy with two dates",
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

export const StackbyWithOneDate = () =>
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
                                    alias: "Won Last Year",
                                    definition: {
                                        popMeasureDefinition: {
                                            measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                            popAttribute: {
                                                identifier: "dt_closedate_timestamp.year",
                                                type: "attribute",
                                            },
                                        },
                                    },
                                    localIdentifier:
                                        "m_e40a8329_m_e519fa2a_86c3_4e32_8313_0c03062348j3_dt_closedate_timestamp.year",
                                },
                            },
                        ],
                        localIdentifier: "measures",
                    },
                    {
                        items: [],
                        localIdentifier: "view",
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
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.f3327518f0109d006f280c0aa9c4a9b6",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "BarChart - stackBy with one date",
                uri: "BarChart.f3327518f0109d006f280c0aa9c4a9b6",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 0, 13),
    )();
StackbyWithOneDate.parameters = {
    kind: "stackBy with one date",
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
