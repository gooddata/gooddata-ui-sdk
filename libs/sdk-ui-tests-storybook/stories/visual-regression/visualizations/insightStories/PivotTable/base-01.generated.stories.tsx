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
    title: "04 Stories For Pluggable Vis/PivotTable/base",
};

export const SingleAttribute = () =>
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
                                attribute: {
                                    displayForm: {
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                    },
                    {
                        items: [],
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.e3a00f8e310439639b8e0963742c6f32",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - single attribute",
                uri: "PivotTable.e3a00f8e310439639b8e0963742c6f32",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 0),
    )();
SingleAttribute.parameters = {
    kind: "single attribute",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleColumn = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [],
                        localIdentifier: "measures",
                    },
                    {
                        items: [],
                        localIdentifier: "attribute",
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
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.1892e5c001ce80d560a10d6ec5ef748d",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - single column",
                uri: "PivotTable.1892e5c001ce80d560a10d6ec5ef748d",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 1),
    )();
SingleColumn.parameters = {
    kind: "single column",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

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
                        localIdentifier: "attribute",
                    },
                    {
                        items: [],
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.9c5d01875f0c02bb196e96139c5e084d",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - single measure",
                uri: "PivotTable.9c5d01875f0c02bb196e96139c5e084d",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 2),
    )();
SingleMeasure.parameters = {
    kind: "single measure",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasureWithRowAttribute = () =>
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
                        localIdentifier: "attribute",
                    },
                    {
                        items: [],
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.a64c658913fd686f8026853d6d45b194",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - single measure with row attribute",
                uri: "PivotTable.a64c658913fd686f8026853d6d45b194",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 3),
    )();
SingleMeasureWithRowAttribute.parameters = {
    kind: "single measure with row attribute",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasureWithColumnAttribute = () =>
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
                        localIdentifier: "attribute",
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
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.44bc6f17d36eba6a67953586fccd4953",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - single measure with column attribute",
                uri: "PivotTable.44bc6f17d36eba6a67953586fccd4953",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 4),
    )();
SingleMeasureWithColumnAttribute.parameters = {
    kind: "single measure with column attribute",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasureWithRowAndColumnAttributes = () =>
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
                        localIdentifier: "attribute",
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
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.ebc191f36bf2361b778edfc57dcffe4a",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - single measure with row and column attributes",
                uri: "PivotTable.ebc191f36bf2361b778edfc57dcffe4a",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 5),
    )();
SingleMeasureWithRowAndColumnAttributes.parameters = {
    kind: "single measure with row and column attributes",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasureWithTwoRowAndOneColumnAttributes = () =>
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
                                        identifier: "f_owner.department_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.department_id",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
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
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.c1295dbbd9bb108c9c64730b6cd02f41",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - single measure with two row and one column attributes",
                uri: "PivotTable.c1295dbbd9bb108c9c64730b6cd02f41",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 6),
    )();
SingleMeasureWithTwoRowAndOneColumnAttributes.parameters = {
    kind: "single measure with two row and one column attributes",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const SingleMeasureWithTwoRowAndTwoColumnAttributes = () =>
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
                                        identifier: "f_owner.department_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.department_id",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                    },
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "attr.f_stage.stagename",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_attr.f_stage.stagename",
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
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.c53b6de862dfd0262382d0e788862fc6",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - single measure with two row and two column attributes",
                uri: "PivotTable.c53b6de862dfd0262382d0e788862fc6",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 7),
    )();
SingleMeasureWithTwoRowAndTwoColumnAttributes.parameters = {
    kind: "single measure with two row and two column attributes",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasures = () =>
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
                        items: [],
                        localIdentifier: "attribute",
                    },
                    {
                        items: [],
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.3905d6f8121f44f1fdaf981d5993db0c",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - two measures",
                uri: "PivotTable.3905d6f8121f44f1fdaf981d5993db0c",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 8),
    )();
TwoMeasures.parameters = {
    kind: "two measures",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithRowAttribute = () =>
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
                        localIdentifier: "attribute",
                    },
                    {
                        items: [],
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.3f406fb3aa7ac75c4339f154e4be48a0",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - two measures with row attribute",
                uri: "PivotTable.3f406fb3aa7ac75c4339f154e4be48a0",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 9),
    )();
TwoMeasuresWithRowAttribute.parameters = {
    kind: "two measures with row attribute",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithColumnAttribute = () =>
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
                        items: [],
                        localIdentifier: "attribute",
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
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.2c25ddc558d7a4224ea30954c37feb25",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - two measures with column attribute",
                uri: "PivotTable.2c25ddc558d7a4224ea30954c37feb25",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 10),
    )();
TwoMeasuresWithColumnAttribute.parameters = {
    kind: "two measures with column attribute",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithRowAndColumnAttributes = () =>
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
                        localIdentifier: "attribute",
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
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.1147638731b2a28c243be751f0ab59fa",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - two measures with row and column attributes",
                uri: "PivotTable.1147638731b2a28c243be751f0ab59fa",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 11),
    )();
TwoMeasuresWithRowAndColumnAttributes.parameters = {
    kind: "two measures with row and column attributes",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithTwoRowAndOneColumnAttributes = () =>
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
                                        identifier: "f_owner.department_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.department_id",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
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
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.93eeaa75bbc82826b65d9e41973c4d6d",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - two measures with two row and one column attributes",
                uri: "PivotTable.93eeaa75bbc82826b65d9e41973c4d6d",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 12),
    )();
TwoMeasuresWithTwoRowAndOneColumnAttributes.parameters = {
    kind: "two measures with two row and one column attributes",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithTwoRowAndTwoColumnAttributes = () =>
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
                                        identifier: "f_owner.department_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.department_id",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                    },
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_opportunitysnapshot.forecastcategory_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_opportunitysnapshot.forecastcategory_id",
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
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.9a68316496fc540eb9f22355b8698804",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - two measures with two row and two column attributes",
                uri: "PivotTable.9a68316496fc540eb9f22355b8698804",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 13),
    )();
TwoMeasuresWithTwoRowAndTwoColumnAttributes.parameters = {
    kind: "two measures with two row and two column attributes",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const TwoMeasuresWithThreeRowsAndTwoColumnAttributes = () =>
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
                                        identifier: "f_owner.department_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.department_id",
                                },
                            },
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "attr.f_owner.salesrep",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_attr.f_owner.salesrep",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                    },
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_opportunitysnapshot.forecastcategory_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_opportunitysnapshot.forecastcategory_id",
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
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.03d6b3d66f30e0595bc109a891877850",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - two measures with three rows and two column attributes",
                uri: "PivotTable.03d6b3d66f30e0595bc109a891877850",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 14),
    )();
TwoMeasuresWithThreeRowsAndTwoColumnAttributes.parameters = {
    kind: "two measures with three rows and two column attributes",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const EmptyValues = () =>
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
                                        identifier: "f_owner.department_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.department_id",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                    },
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "attr.f_stage.stagename",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_attr.f_stage.stagename",
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
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.5834c04b2832e3ff98aeaf6328c40d9d",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - empty values",
                uri: "PivotTable.5834c04b2832e3ff98aeaf6328c40d9d",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 15),
    )();
EmptyValues.parameters = {
    kind: "empty values",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
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
                        localIdentifier: "attribute",
                    },
                    {
                        items: [],
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.a2bf2906e75de15e1389bb770a0e84af",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - arithmetic measures",
                uri: "PivotTable.a2bf2906e75de15e1389bb770a0e84af",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 16),
    )();
ArithmeticMeasures.parameters = {
    kind: "arithmetic measures",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const WithAttributesWithoutMeasures = () =>
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
                                attribute: {
                                    displayForm: {
                                        identifier: "attr.f_stage.stagename",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_attr.f_stage.stagename",
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
                        localIdentifier: "attribute",
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
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.71f688d207f32bba1f14f6979254eab5",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - with attributes without measures",
                uri: "PivotTable.71f688d207f32bba1f14f6979254eab5",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 17),
    )();
WithAttributesWithoutMeasures.parameters = {
    kind: "with attributes without measures",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const WithTwoSameDates = () =>
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
                                        identifier: "dt_oppcreated_timestamp.year",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_oppcreated_timestamp.year",
                                },
                            },
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "dt_oppcreated_timestamp.year",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "created.test",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                    },
                    {
                        items: [],
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.d7f0911c29d085fc14f4bc34c8a1931f",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - with two same dates",
                uri: "PivotTable.d7f0911c29d085fc14f4bc34c8a1931f",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 18),
    )();
WithTwoSameDates.parameters = {
    kind: "with two same dates",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;

export const OneMeasureAndRepeatingRowAttributesOnDifferentPositions = () =>
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
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "product.name.test",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                    },
                    {
                        items: [],
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "PivotTable.2eceab3f50f6adcc0e88cc95427aa633",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - one measure and repeating row attributes on different positions",
                uri: "PivotTable.2eceab3f50f6adcc0e88cc95427aa633",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 1, 19),
    )();
OneMeasureAndRepeatingRowAttributesOnDifferentPositions.parameters = {
    kind: "one measure and repeating row attributes on different positions",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 1000,
        },
        viewports: [
            {
                label: "desktop",
                width: 1464,
                height: 768,
            },
        ],
        misMatchThreshold: 0.01,
    },
} satisfies IStoryParameters;
