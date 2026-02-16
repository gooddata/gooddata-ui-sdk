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
    title: "04 Stories For Pluggable Vis/PivotTableNext/transposition",
};

export const SingleMeasurePivotWithBothAttributesAndMetricsInRows = () =>
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
                identifier: "PivotTableNext.0588879e1871016b4e890ab2c234ad87",
                properties: {
                    controls: {
                        measureGroupDimension: "rows",
                    },
                },
                sorts: [],
                title: "PivotTableNext - single measure pivot with both attributes and metrics in rows",
                uri: "PivotTableNext.0588879e1871016b4e890ab2c234ad87",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 14, 0),
    )();
SingleMeasurePivotWithBothAttributesAndMetricsInRows.parameters = {
    kind: "single measure pivot with both attributes and metrics in rows",
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

export const TwoMeasuresWithSingleRowAttrWithMetricsInRows = () =>
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
                identifier: "PivotTableNext.bd8de61c4c2180f924e6861d46271ce5",
                properties: {
                    controls: {
                        measureGroupDimension: "rows",
                    },
                },
                sorts: [],
                title: "PivotTableNext - two measures with single row attr with metrics in rows",
                uri: "PivotTableNext.bd8de61c4c2180f924e6861d46271ce5",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 14, 1),
    )();
TwoMeasuresWithSingleRowAttrWithMetricsInRows.parameters = {
    kind: "two measures with single row attr with metrics in rows",
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

export const TwoMeasuresAndMultipleColumnRowSubtotalsWithMetricsInRows = () =>
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
                                attributeIdentifier: "a_f_owner.department_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_label.f_product.product.name",
                                measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
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
                        totals: [
                            {
                                attributeIdentifier: "a_f_owner.region_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_f_owner.region_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "med",
                            },
                            {
                                attributeIdentifier: "a_f_owner.region_id",
                                measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                type: "med",
                            },
                        ],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.10f3cd4c4e145f4d951a1d26d8b36f8b",
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
                        measureGroupDimension: "rows",
                    },
                },
                sorts: [],
                title: "PivotTableNext - two measures and multiple column/row subtotals with metrics in rows",
                uri: "PivotTableNext.10f3cd4c4e145f4d951a1d26d8b36f8b",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 14, 2),
    )();
TwoMeasuresAndMultipleColumnRowSubtotalsWithMetricsInRows.parameters = {
    kind: "two measures and multiple column/row subtotals with metrics in rows",
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

export const MultipleMeasuresAndNoColumnsWithTotals = () =>
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
                                        identifier: "f_owner.department_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.department_id",
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
                        totals: [
                            {
                                attributeIdentifier: "a_f_owner.department_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_f_owner.region_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_f_owner.department_id",
                                measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                type: "min",
                            },
                            {
                                attributeIdentifier: "a_f_owner.region_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "med",
                            },
                            {
                                attributeIdentifier: "a_f_owner.region_id",
                                measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                type: "med",
                            },
                        ],
                    },
                    {
                        items: [],
                        localIdentifier: "columns",
                        totals: [],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.56cec4491a707a7e6e547e548be163b1",
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
                                    attributeIdentifier: "a_f_owner.region_id",
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
                        measureGroupDimension: "rows",
                    },
                },
                sorts: [],
                title: "PivotTableNext - multiple measures and no columns, with totals",
                uri: "PivotTableNext.56cec4491a707a7e6e547e548be163b1",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 14, 3),
    )();
MultipleMeasuresAndNoColumnsWithTotals.parameters = {
    kind: "multiple measures and no columns, with totals",
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

export const MultipleMeasuresAndNoRowsWithTotals = () =>
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
                        totals: [],
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
                        totals: [
                            {
                                attributeIdentifier: "a_f_owner.region_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_f_owner.region_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "med",
                            },
                            {
                                attributeIdentifier: "a_f_owner.region_id",
                                measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                type: "med",
                            },
                        ],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.e12bd90b45dd2e2a36c632b811114510",
                properties: {
                    controls: {
                        measureGroupDimension: "rows",
                    },
                },
                sorts: [],
                title: "PivotTableNext - multiple measures and no rows, with totals",
                uri: "PivotTableNext.e12bd90b45dd2e2a36c632b811114510",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 14, 4),
    )();
MultipleMeasuresAndNoRowsWithTotals.parameters = {
    kind: "multiple measures and no rows, with totals",
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

export const MultipleMeasuresAndRowAttributesWithMetricsInRowsWithDrilling = () =>
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
                identifier: "PivotTableNext.a8c1009c4d04d865e652a83f79e8d457",
                properties: {
                    controls: {
                        measureGroupDimension: "rows",
                    },
                },
                sorts: [],
                title: "PivotTableNext - multiple measures and row attributes with metrics in rows, with drilling",
                uri: "PivotTableNext.a8c1009c4d04d865e652a83f79e8d457",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 14, 5),
    )();
MultipleMeasuresAndRowAttributesWithMetricsInRowsWithDrilling.parameters = {
    kind: "multiple measures and row attributes with metrics in rows, with drilling",
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

export const TwoMeasuresInRowsAndOnlyColumnAttrsOnLeft = () =>
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
                                        identifier: "f_owner.department_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.department_id",
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
                identifier: "PivotTableNext.3e6b95b783e541bfe9985592c9a105a2",
                properties: {
                    controls: {
                        columnHeadersPosition: "left",
                        measureGroupDimension: "rows",
                    },
                },
                sorts: [],
                title: "PivotTableNext - two measures in rows and only column attrs on left",
                uri: "PivotTableNext.3e6b95b783e541bfe9985592c9a105a2",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 14, 6),
    )();
TwoMeasuresInRowsAndOnlyColumnAttrsOnLeft.parameters = {
    kind: "two measures in rows and only column attrs on left",
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

export const TwoMeasuresInRowsAndOnlyColumnAttrsOnLeftWithDrilling = () =>
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
                                        identifier: "f_owner.department_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.department_id",
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
                identifier: "PivotTableNext.15aecb6ecdf61eebe7c1acc21c97329f",
                properties: {
                    controls: {
                        columnHeadersPosition: "left",
                        measureGroupDimension: "rows",
                    },
                },
                sorts: [],
                title: "PivotTableNext - two measures in rows and only column attrs on left, with drilling",
                uri: "PivotTableNext.15aecb6ecdf61eebe7c1acc21c97329f",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 14, 7),
    )();
TwoMeasuresInRowsAndOnlyColumnAttrsOnLeftWithDrilling.parameters = {
    kind: "two measures in rows and only column attrs on left, with drilling",
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

export const TwoMeasuresInRowsAndColumnAttrsOnTopWithInvalidDrillingOnAttributes = () =>
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
                                        identifier: "f_owner.department_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.department_id",
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
                identifier: "PivotTableNext.12802d644402ccc91d6af598d9205627",
                properties: {
                    controls: {
                        columnHeadersPosition: "top",
                        measureGroupDimension: "rows",
                    },
                },
                sorts: [],
                title: "PivotTableNext - two measures in rows and column attrs on top, with invalid drilling on attributes",
                uri: "PivotTableNext.12802d644402ccc91d6af598d9205627",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 14, 8),
    )();
TwoMeasuresInRowsAndColumnAttrsOnTopWithInvalidDrillingOnAttributes.parameters = {
    kind: "two measures in rows and column attrs on top, with invalid drilling on attributes",
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

export const TwoMeasuresInRowsAndColumnAttrsOnTopWithDrillingOnMetrics = () =>
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
                                        identifier: "f_owner.department_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.department_id",
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
                identifier: "PivotTableNext.ac898cdc21068a38ed4b3fa5b401f9c9",
                properties: {
                    controls: {
                        columnHeadersPosition: "top",
                        measureGroupDimension: "rows",
                    },
                },
                sorts: [],
                title: "PivotTableNext - two measures in rows and column attrs on top, with drilling on metrics",
                uri: "PivotTableNext.ac898cdc21068a38ed4b3fa5b401f9c9",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 14, 9),
    )();
TwoMeasuresInRowsAndColumnAttrsOnTopWithDrillingOnMetrics.parameters = {
    kind: "two measures in rows and column attrs on top, with drilling on metrics",
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

export const TwoMeasuresInRowsAndColumnAttrsOnLeftWithTotals = () =>
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
                        totals: [],
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
                        totals: [
                            {
                                attributeIdentifier: "a_f_owner.department_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_f_owner.region_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                        ],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.5474330193a9ae4d54971b79dd16f7f5",
                properties: {
                    controls: {
                        columnHeadersPosition: "left",
                        measureGroupDimension: "rows",
                    },
                },
                sorts: [],
                title: "PivotTableNext - two measures in rows and column attrs on left, with totals",
                uri: "PivotTableNext.5474330193a9ae4d54971b79dd16f7f5",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 14, 10),
    )();
TwoMeasuresInRowsAndColumnAttrsOnLeftWithTotals.parameters = {
    kind: "two measures in rows and column attrs on left, with totals",
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

export const TwoMeasuresInRowsAndOnlyColumnAttrsOnLeftWithTotals = () =>
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
                        totals: [],
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
                        totals: [
                            {
                                attributeIdentifier: "a_f_owner.region_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_f_owner.region_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "med",
                            },
                            {
                                attributeIdentifier: "a_f_owner.region_id",
                                measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                type: "med",
                            },
                        ],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.0d60b49d97bfd5bdd9e9d69038b4ae83",
                properties: {
                    controls: {
                        columnHeadersPosition: "left",
                        measureGroupDimension: "rows",
                    },
                },
                sorts: [],
                title: "PivotTableNext - two measures in rows and only column attrs on left, with totals",
                uri: "PivotTableNext.0d60b49d97bfd5bdd9e9d69038b4ae83",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 14, 11),
    )();
TwoMeasuresInRowsAndOnlyColumnAttrsOnLeftWithTotals.parameters = {
    kind: "two measures in rows and only column attrs on left, with totals",
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
