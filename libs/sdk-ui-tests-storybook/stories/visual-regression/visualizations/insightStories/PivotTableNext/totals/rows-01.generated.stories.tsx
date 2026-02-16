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
    title: "04 Stories For Pluggable Vis/PivotTableNext/totals/rows",
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
                        totals: [],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.0f04fafcdccd14117c03d1ea667bdb07",
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
                title: "PivotTableNext - single measure and single grand total",
                uri: "PivotTableNext.0f04fafcdccd14117c03d1ea667bdb07",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 12, 0),
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
                                type: "max",
                            },
                            {
                                attributeIdentifier: "a_label.f_product.product.name",
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
                        totals: [],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.a9c392d0bff2c87efe934d708de96e16",
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
                title: "PivotTableNext - single measure and multiple grand totals",
                uri: "PivotTableNext.a9c392d0bff2c87efe934d708de96e16",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 12, 1),
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
                        totals: [],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.d046d6ce6f4e610533e297d53fee57a2",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTableNext - two measures and single grand total for one",
                uri: "PivotTableNext.d046d6ce6f4e610533e297d53fee57a2",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 12, 2),
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
                        totals: [],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.9ea726d4eaa0ed17421b93c478da6005",
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
                title: "PivotTableNext - two measures and single grand total for each",
                uri: "PivotTableNext.9ea726d4eaa0ed17421b93c478da6005",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 12, 3),
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
                                measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                type: "max",
                            },
                            {
                                attributeIdentifier: "a_label.f_product.product.name",
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
                        totals: [],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.237307ab4326ca12ccebd4725f0dce14",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTableNext - two measures and multiple grand totals for each",
                uri: "PivotTableNext.237307ab4326ca12ccebd4725f0dce14",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 12, 4),
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
                        totals: [],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.ae0c8604ff1a171706d217e93378f41b",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTableNext - two measures and one subtotal",
                uri: "PivotTableNext.ae0c8604ff1a171706d217e93378f41b",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 12, 5),
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
                        totals: [],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.7c2369cee8cb4d2e16e2f11ff014953f",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTableNext - two measures and multiple subtotals",
                uri: "PivotTableNext.7c2369cee8cb4d2e16e2f11ff014953f",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 12, 6),
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
                            {
                                attributeIdentifier: "a_label.f_product.product.name",
                                measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                type: "nat",
                            },
                            {
                                attributeIdentifier: "a_f_owner.department_id",
                                measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                type: "nat",
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
                        totals: [],
                    },
                ],
                filters: [],
                identifier: "PivotTableNext.80f6060fe0b4437d8efa3d714ee8e4ef",
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
                title: "PivotTableNext - two measures and grand totals and multiple subtotals",
                uri: "PivotTableNext.80f6060fe0b4437d8efa3d714ee8e4ef",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(15, 12, 7),
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
