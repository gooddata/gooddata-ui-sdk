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
    title: "04 Stories For Pluggable Vis/PivotTable/customization",
};

export const GermanNumberFormat = () =>
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
                identifier: "PivotTable.6cfa2f092c46cab1b6e3f43ddf1b7fe2",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - german number format",
                uri: "PivotTable.6cfa2f092c46cab1b6e3f43ddf1b7fe2",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 2, 0),
    )();
GermanNumberFormat.parameters = {
    kind: "german number format",
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

export const NoTotalsAndMaxHeight200 = () =>
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
                identifier: "PivotTable.b9ebc3f963ff72688a7338d1bc8a4523",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - no totals and max height 200",
                uri: "PivotTable.b9ebc3f963ff72688a7338d1bc8a4523",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 2, 1),
    )();
NoTotalsAndMaxHeight200.parameters = {
    kind: "no totals and max height 200",
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

export const NoTotalsAndMaxHeight300 = () =>
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
                identifier: "PivotTable.e1b8ffae54a79f55d2e5940b2a5a8974",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - no totals and max height 300",
                uri: "PivotTable.e1b8ffae54a79f55d2e5940b2a5a8974",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 2, 2),
    )();
NoTotalsAndMaxHeight300.parameters = {
    kind: "no totals and max height 300",
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

export const NoTotalsAndNoGrouping = () =>
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
                identifier: "PivotTable.b84dde6976d9908532fda3b14c7a3cf8",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - no totals and no grouping",
                uri: "PivotTable.b84dde6976d9908532fda3b14c7a3cf8",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 2, 3),
    )();
NoTotalsAndNoGrouping.parameters = {
    kind: "no totals and no grouping",
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

export const MeasureFormatWithColors = () =>
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
                                    format: "[backgroundColor=ffff00][green]#,##0.00 €",
                                    localIdentifier: "m_76bde438_87a053b0_3947_49f3_b0c5_de53fd01f050",
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
                identifier: "PivotTable.8159de7b843c478cd0a1fda6037fbc0c",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - measure format with colors",
                uri: "PivotTable.8159de7b843c478cd0a1fda6037fbc0c",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 2, 4),
    )();
MeasureFormatWithColors.parameters = {
    kind: "measure format with colors",
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

export const TotalsAndMaxHeight200 = () =>
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
                identifier: "PivotTable.2a79a1ea6b86d115706b816b1790e672",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - totals and max height 200",
                uri: "PivotTable.2a79a1ea6b86d115706b816b1790e672",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 2, 5),
    )();
TotalsAndMaxHeight200.parameters = {
    kind: "totals and max height 200",
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

export const TotalsAndMaxHeight300 = () =>
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
                identifier: "PivotTable.cd4aab724f5663bc48f916890d856f4c",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - totals and max height 300",
                uri: "PivotTable.cd4aab724f5663bc48f916890d856f4c",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 2, 6),
    )();
TotalsAndMaxHeight300.parameters = {
    kind: "totals and max height 300",
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

export const TotalsAndMaxHeight800 = () =>
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
                identifier: "PivotTable.9ed7155f8e2ae217294cbc89eb8afdf1",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "PivotTable - totals and max height 800",
                uri: "PivotTable.9ed7155f8e2ae217294cbc89eb8afdf1",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 2, 7),
    )();
TotalsAndMaxHeight800.parameters = {
    kind: "totals and max height 800",
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
