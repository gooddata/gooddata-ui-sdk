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
    title: "04 Stories For Pluggable Vis/PivotTable/auto-resizing",
};

export const WithColumnAttributesOnlyAndAutoResizing = () =>
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
                identifier: "PivotTable.060b5dc818986e5aff74df76d42a9320",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - with column attributes only and auto-resizing",
                uri: "PivotTable.060b5dc818986e5aff74df76d42a9320",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 0, 0),
    )();
WithColumnAttributesOnlyAndAutoResizing.parameters = {
    kind: "with column attributes only and auto-resizing",
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

export const WithSmallPageAndAutoResizing = () =>
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
                identifier: "PivotTable.cc2cbda6c9fbb059be239e4cc3d971ca",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - with small page and auto-resizing",
                uri: "PivotTable.cc2cbda6c9fbb059be239e4cc3d971ca",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 0, 1),
    )();
WithSmallPageAndAutoResizing.parameters = {
    kind: "with small page and auto-resizing",
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

export const WithTwoMeasuresAndRowAttributeWithAutoResizing = () =>
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
                identifier: "PivotTable.d39918fa34783f48b73ec5a6dfafa927",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - with two measures and row attribute with auto-resizing",
                uri: "PivotTable.d39918fa34783f48b73ec5a6dfafa927",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 0, 2),
    )();
WithTwoMeasuresAndRowAttributeWithAutoResizing.parameters = {
    kind: "with two measures and row attribute with auto-resizing",
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

export const WithTwoMeasuresAndRowAttributeWithAutoResizingAndGrowToFit = () =>
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
                identifier: "PivotTable.d71c6c00211b4c0f5536a56e2cb6b5a3",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - with two measures and row attribute with auto-resizing and grow to fit",
                uri: "PivotTable.d71c6c00211b4c0f5536a56e2cb6b5a3",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 0, 3),
    )();
WithTwoMeasuresAndRowAttributeWithAutoResizingAndGrowToFit.parameters = {
    kind: "with two measures and row attribute with auto-resizing and grow to fit",
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

export const WithTwoMeasuresGrandTotalsAndSubtotalsWithAutoResizing = () =>
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
                        totals: [
                            {
                                attributeIdentifier: "a_label.f_product.product.name",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_label.f_product.product.name",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "min",
                            },
                            {
                                attributeIdentifier: "a_label.f_product.product.name",
                                measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                type: "max",
                            },
                            {
                                attributeIdentifier: "a_f_owner.department_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_f_owner.department_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "med",
                            },
                            {
                                attributeIdentifier: "a_f_owner.department_id",
                                measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                type: "med",
                            },
                        ],
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
                identifier: "PivotTable.5fcccd2691c4bfdb0dcdf3a7725b0866",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - with two measures, grand totals and subtotals with auto-resizing",
                uri: "PivotTable.5fcccd2691c4bfdb0dcdf3a7725b0866",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 0, 4),
    )();
WithTwoMeasuresGrandTotalsAndSubtotalsWithAutoResizing.parameters = {
    kind: "with two measures, grand totals and subtotals with auto-resizing",
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

export const WithTwoMeasuresGrandTotalsAndSubtotalsWithAutoResizingAndGrowToFit = () =>
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
                        totals: [
                            {
                                attributeIdentifier: "a_label.f_product.product.name",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_label.f_product.product.name",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "min",
                            },
                            {
                                attributeIdentifier: "a_label.f_product.product.name",
                                measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                type: "max",
                            },
                            {
                                attributeIdentifier: "a_f_owner.department_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_f_owner.department_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "med",
                            },
                            {
                                attributeIdentifier: "a_f_owner.department_id",
                                measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                type: "med",
                            },
                        ],
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
                identifier: "PivotTable.25c516d27d6969936bbe63e78c470ad7",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - with two measures, grand totals and subtotals with auto-resizing and grow to fit",
                uri: "PivotTable.25c516d27d6969936bbe63e78c470ad7",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 0, 5),
    )();
WithTwoMeasuresGrandTotalsAndSubtotalsWithAutoResizingAndGrowToFit.parameters = {
    kind: "with two measures, grand totals and subtotals with auto-resizing and grow to fit",
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
