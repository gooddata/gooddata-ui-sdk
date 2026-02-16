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
    title: "04 Stories For Pluggable Vis/PivotTableNext/totals/rows & columns",
};

export const SingleMeasureAndSingleColumnRowGrandTotal = () =>
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
                                        identifier: "attr.f_owner.salesrep",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_attr.f_owner.salesrep",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                        totals: [
                            {
                                attributeIdentifier: "a_attr.f_owner.salesrep",
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
                        ],
                        localIdentifier: "columns",
                        totals: [
                            {
                                attributeIdentifier: "a_f_opportunitysnapshot.forecastcategory_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                        ],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.df98d53c1649c7bba56762edd1ce8015",
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
                title: "PivotTableNext - single measure and single column/row grand total",
                uri: "PivotTableNext.df98d53c1649c7bba56762edd1ce8015",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 13, 0),
    )();
SingleMeasureAndSingleColumnRowGrandTotal.parameters = {
    kind: "single measure and single column/row grand total",
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

export const SingleMeasureAndMultipleColumnRowGrandTotals = () =>
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
                                        identifier: "attr.f_owner.salesrep",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_attr.f_owner.salesrep",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                        totals: [
                            {
                                attributeIdentifier: "a_attr.f_owner.salesrep",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_attr.f_owner.salesrep",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "min",
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
                        ],
                        localIdentifier: "columns",
                        totals: [
                            {
                                attributeIdentifier: "a_f_opportunitysnapshot.forecastcategory_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_f_opportunitysnapshot.forecastcategory_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "min",
                            },
                        ],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.15312b5cfb6071696fa331e3a9269388",
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
                title: "PivotTableNext - single measure and multiple column/row grand totals",
                uri: "PivotTableNext.15312b5cfb6071696fa331e3a9269388",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 13, 1),
    )();
SingleMeasureAndMultipleColumnRowGrandTotals.parameters = {
    kind: "single measure and multiple column/row grand totals",
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

export const TwoMeasuresAndSingleColumnRowGrandTotalForOne = () =>
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
                                                identifier: "b4e3e3c7-ead3-4d69-8be4-23bcfe5ff7aa",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_b4e3e3c7_ead3_4d69_8be4_23bcfe5ff7aa",
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
                                        identifier: "attr.f_owner.salesrep",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_attr.f_owner.salesrep",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                        totals: [
                            {
                                attributeIdentifier: "a_attr.f_owner.salesrep",
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
                        ],
                        localIdentifier: "columns",
                        totals: [
                            {
                                attributeIdentifier: "a_f_opportunitysnapshot.forecastcategory_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                        ],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.e754c0cb722d8cf0ae55759dce920361",
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
                title: "PivotTableNext - two measures and single column/row grand total for one",
                uri: "PivotTableNext.e754c0cb722d8cf0ae55759dce920361",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 13, 2),
    )();
TwoMeasuresAndSingleColumnRowGrandTotalForOne.parameters = {
    kind: "two measures and single column/row grand total for one",
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

export const TwoMeasuresAndSingleColumnRowGrandTotalForEach = () =>
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
                                                identifier: "b4e3e3c7-ead3-4d69-8be4-23bcfe5ff7aa",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_b4e3e3c7_ead3_4d69_8be4_23bcfe5ff7aa",
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
                                        identifier: "attr.f_owner.salesrep",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_attr.f_owner.salesrep",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                        totals: [
                            {
                                attributeIdentifier: "a_attr.f_owner.salesrep",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_attr.f_owner.salesrep",
                                measureIdentifier: "m_b4e3e3c7_ead3_4d69_8be4_23bcfe5ff7aa",
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
                        ],
                        localIdentifier: "columns",
                        totals: [
                            {
                                attributeIdentifier: "a_f_opportunitysnapshot.forecastcategory_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_f_opportunitysnapshot.forecastcategory_id",
                                measureIdentifier: "m_b4e3e3c7_ead3_4d69_8be4_23bcfe5ff7aa",
                                type: "max",
                            },
                        ],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.11f0d91e6c0335f95cc6c6e33ca8cedc",
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
                title: "PivotTableNext - two measures and single column/row grand total for each",
                uri: "PivotTableNext.11f0d91e6c0335f95cc6c6e33ca8cedc",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 13, 3),
    )();
TwoMeasuresAndSingleColumnRowGrandTotalForEach.parameters = {
    kind: "two measures and single column/row grand total for each",
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

export const TwoMeasuresAndMultipleColumnRowGrandTotalsForEach = () =>
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
                                                identifier: "b4e3e3c7-ead3-4d69-8be4-23bcfe5ff7aa",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_b4e3e3c7_ead3_4d69_8be4_23bcfe5ff7aa",
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
                                        identifier: "attr.f_owner.salesrep",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_attr.f_owner.salesrep",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                        totals: [
                            {
                                attributeIdentifier: "a_attr.f_owner.salesrep",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_attr.f_owner.salesrep",
                                measureIdentifier: "m_b4e3e3c7_ead3_4d69_8be4_23bcfe5ff7aa",
                                type: "max",
                            },
                            {
                                attributeIdentifier: "a_attr.f_owner.salesrep",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "min",
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
                        ],
                        localIdentifier: "columns",
                        totals: [
                            {
                                attributeIdentifier: "a_f_opportunitysnapshot.forecastcategory_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_f_opportunitysnapshot.forecastcategory_id",
                                measureIdentifier: "m_b4e3e3c7_ead3_4d69_8be4_23bcfe5ff7aa",
                                type: "max",
                            },
                            {
                                attributeIdentifier: "a_f_opportunitysnapshot.forecastcategory_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "min",
                            },
                        ],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.f7426a38f1f2ffd6ccad7ead71390ac6",
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
                                    attributeIdentifier: "a_attr.f_owner.salesrep",
                                    width: {
                                        value: 120,
                                    },
                                },
                            },
                        ],
                    },
                },
                sorts: [],
                title: "PivotTableNext - two measures and multiple column/row grand totals for each",
                uri: "PivotTableNext.f7426a38f1f2ffd6ccad7ead71390ac6",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 13, 4),
    )();
TwoMeasuresAndMultipleColumnRowGrandTotalsForEach.parameters = {
    kind: "two measures and multiple column/row grand totals for each",
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

export const TwoMeasuresAndOneColumnRowSubtotal = () =>
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
                        totals: [
                            {
                                attributeIdentifier: "a_f_owner.region_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                        ],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.ad6fb668a230bf5771c75c273c1f3d20",
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
                title: "PivotTableNext - two measures and one column/row subtotal",
                uri: "PivotTableNext.ad6fb668a230bf5771c75c273c1f3d20",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 13, 5),
    )();
TwoMeasuresAndOneColumnRowSubtotal.parameters = {
    kind: "two measures and one column/row subtotal",
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

export const TwoMeasuresAndMultipleColumnRowSubtotals = () =>
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
                identifier: "PivotTableNext.7254fe8261b0116f4a1a659832763112",
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
                title: "PivotTableNext - two measures and multiple column/row subtotals",
                uri: "PivotTableNext.7254fe8261b0116f4a1a659832763112",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 13, 6),
    )();
TwoMeasuresAndMultipleColumnRowSubtotals.parameters = {
    kind: "two measures and multiple column/row subtotals",
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

export const TwoMeasuresAndColumnRowGrandTotalsAndMultipleSubtotals = () =>
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
                                type: "max",
                            },
                            {
                                attributeIdentifier: "a_label.f_product.product.name",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "min",
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
                                attributeIdentifier: "a_f_opportunitysnapshot.forecastcategory_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_f_owner.region_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                type: "sum",
                            },
                            {
                                attributeIdentifier: "a_f_opportunitysnapshot.forecastcategory_id",
                                measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                type: "max",
                            },
                            {
                                attributeIdentifier: "a_f_opportunitysnapshot.forecastcategory_id",
                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
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
                ],
                filters: [],
                identifier: "PivotTableNext.f5b0513a34d046a3297225b71d6f321d",
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
                title: "PivotTableNext - two measures and column/row grand totals and multiple subtotals",
                uri: "PivotTableNext.f5b0513a34d046a3297225b71d6f321d",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 13, 7),
    )();
TwoMeasuresAndColumnRowGrandTotalsAndMultipleSubtotals.parameters = {
    kind: "two measures and column/row grand totals and multiple subtotals",
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
