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
    title: "04 Stories For Pluggable Vis/PivotTable/totals/rows",
};

export const SingleMeasureAndSingleGrandTotal = () =>
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
                        totals: [
                            {
                                attributeIdentifier: "a_label.f_product.product.name",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                        ],
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
                identifier: "PivotTable.5498f09d475a6befec416b306dbad6df",
                properties: {
                    controls: {
                        columnWidths: [
                            {
                                measureColumnWidthItem: {
                                    locator: {
                                        measureLocatorItem: {
                                            measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                        },
                                    },
                                    width: {
                                        value: 100,
                                    },
                                },
                            },
                            {
                                measureColumnWidthItem: {
                                    locator: {
                                        measureLocatorItem: {
                                            measureIdentifier: "m_b4e3e3c7_ead3_4d69_8be4_23bcfe5ff7aa",
                                        },
                                    },
                                    width: {
                                        value: 100,
                                    },
                                },
                            },
                            {
                                measureColumnWidthItem: {
                                    locator: {
                                        measureLocatorItem: {
                                            measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                        },
                                    },
                                    width: {
                                        value: 100,
                                    },
                                },
                            },
                        ],
                    },
                },
                sorts: [],
                title: "PivotTable - single measure and single grand total",
                uri: "PivotTable.5498f09d475a6befec416b306dbad6df",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 12, 0),
    )();
SingleMeasureAndSingleGrandTotal.parameters = {
    kind: "single measure and single grand total",
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

export const SingleMeasureAndMultipleGrandTotals = () =>
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
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "max",
                            },
                        ],
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
                identifier: "PivotTable.dcc22e90b38904c5e4228f3e01245451",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - single measure and multiple grand totals",
                uri: "PivotTable.dcc22e90b38904c5e4228f3e01245451",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 12, 1),
    )();
SingleMeasureAndMultipleGrandTotals.parameters = {
    kind: "single measure and multiple grand totals",
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

export const TwoMeasuresAndSingleGrandTotalForOne = () =>
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
                identifier: "PivotTable.bdcc7f7d29d754d3c8dc9174513c0b0c",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - two measures and single grand total for one",
                uri: "PivotTable.bdcc7f7d29d754d3c8dc9174513c0b0c",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 12, 2),
    )();
TwoMeasuresAndSingleGrandTotalForOne.parameters = {
    kind: "two measures and single grand total for one",
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

export const TwoMeasuresAndSingleGrandTotalForEach = () =>
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
                                measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                type: "sum",
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
                identifier: "PivotTable.2d6b1aaa118412552cf5b13cdcbe272c",
                properties: {
                    controls: {
                        columnWidths: [
                            {
                                measureColumnWidthItem: {
                                    locator: {
                                        measureLocatorItem: {
                                            measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                        },
                                    },
                                    width: {
                                        value: 100,
                                    },
                                },
                            },
                            {
                                measureColumnWidthItem: {
                                    locator: {
                                        measureLocatorItem: {
                                            measureIdentifier: "m_b4e3e3c7_ead3_4d69_8be4_23bcfe5ff7aa",
                                        },
                                    },
                                    width: {
                                        value: 100,
                                    },
                                },
                            },
                            {
                                measureColumnWidthItem: {
                                    locator: {
                                        measureLocatorItem: {
                                            measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                        },
                                    },
                                    width: {
                                        value: 100,
                                    },
                                },
                            },
                            {
                                attributeColumnWidthItem: {
                                    attributeIdentifier: "a_label.f_product.product.name",
                                    width: {
                                        value: 120,
                                    },
                                },
                            },
                        ],
                    },
                },
                sorts: [],
                title: "PivotTable - two measures and single grand total for each",
                uri: "PivotTable.2d6b1aaa118412552cf5b13cdcbe272c",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 12, 3),
    )();
TwoMeasuresAndSingleGrandTotalForEach.parameters = {
    kind: "two measures and single grand total for each",
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

export const TwoMeasuresAndMultipleGrandTotalsForEach = () =>
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
                identifier: "PivotTable.4ab855bb1f8821c7be1e0cfeb53fcd78",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - two measures and multiple grand totals for each",
                uri: "PivotTable.4ab855bb1f8821c7be1e0cfeb53fcd78",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 12, 4),
    )();
TwoMeasuresAndMultipleGrandTotalsForEach.parameters = {
    kind: "two measures and multiple grand totals for each",
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

export const TwoMeasuresAndOneSubtotal = () =>
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
                                attributeIdentifier: "a_f_owner.department_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
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
                identifier: "PivotTable.51f14b5c54ca0618d9c559bc1e8fec62",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - two measures and one subtotal",
                uri: "PivotTable.51f14b5c54ca0618d9c559bc1e8fec62",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 12, 5),
    )();
TwoMeasuresAndOneSubtotal.parameters = {
    kind: "two measures and one subtotal",
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

export const TwoMeasuresAndMultipleSubtotals = () =>
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
                identifier: "PivotTable.0341d9291279103f06e379eb680e405c",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - two measures and multiple subtotals",
                uri: "PivotTable.0341d9291279103f06e379eb680e405c",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 12, 6),
    )();
TwoMeasuresAndMultipleSubtotals.parameters = {
    kind: "two measures and multiple subtotals",
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

export const TwoMeasuresAndGrandTotalsAndMultipleSubtotals = () =>
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
                identifier: "PivotTable.32b6b7eddd62674b4d7683676edd3057",
                properties: {
                    controls: {
                        columnWidths: [
                            {
                                measureColumnWidthItem: {
                                    locator: {
                                        measureLocatorItem: {
                                            measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                        },
                                    },
                                    width: {
                                        value: 100,
                                    },
                                },
                            },
                            {
                                measureColumnWidthItem: {
                                    locator: {
                                        measureLocatorItem: {
                                            measureIdentifier: "m_b4e3e3c7_ead3_4d69_8be4_23bcfe5ff7aa",
                                        },
                                    },
                                    width: {
                                        value: 100,
                                    },
                                },
                            },
                            {
                                measureColumnWidthItem: {
                                    locator: {
                                        measureLocatorItem: {
                                            measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                        },
                                    },
                                    width: {
                                        value: 100,
                                    },
                                },
                            },
                            {
                                attributeColumnWidthItem: {
                                    attributeIdentifier: "a_label.f_product.product.name",
                                    width: {
                                        value: 120,
                                    },
                                },
                            },
                            {
                                attributeColumnWidthItem: {
                                    attributeIdentifier: "a_f_owner.department_id",
                                    width: {
                                        value: 120,
                                    },
                                },
                            },
                        ],
                    },
                },
                sorts: [],
                title: "PivotTable - two measures and grand totals and multiple subtotals",
                uri: "PivotTable.32b6b7eddd62674b4d7683676edd3057",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 12, 7),
    )();
TwoMeasuresAndGrandTotalsAndMultipleSubtotals.parameters = {
    kind: "two measures and grand totals and multiple subtotals",
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

export const TwoMeasuresAndSingleGrandTotalSortedBySecondAttribute = () =>
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
                identifier: "PivotTable.424685feee156605d014ba846fe099d0",
                properties: {
                    controls: {},
                },
                sorts: [
                    {
                        attributeSortItem: {
                            attributeIdentifier: "a_f_owner.department_id",
                            direction: "desc",
                        },
                    },
                ],
                title: "PivotTable - two measures and single grand total sorted by second attribute",
                uri: "PivotTable.424685feee156605d014ba846fe099d0",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 12, 8),
    )();
TwoMeasuresAndSingleGrandTotalSortedBySecondAttribute.parameters = {
    kind: "two measures and single grand total sorted by second attribute",
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
