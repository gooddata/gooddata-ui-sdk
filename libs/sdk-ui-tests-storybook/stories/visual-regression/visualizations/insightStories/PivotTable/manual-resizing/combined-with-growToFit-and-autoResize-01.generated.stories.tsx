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
    title: "04 Stories For Pluggable Vis/PivotTable/manual-resizing/combined with growToFit and autoResize",
};

export const SimpleTableWithCustomAttributeColumnSize = () =>
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
                identifier: "PivotTable.4535f7207b8c52d7b74f8a4a776cc116",
                properties: {
                    controls: {
                        columnWidths: [
                            {
                                attributeColumnWidthItem: {
                                    attributeIdentifier: "a_label.f_product.product.name",
                                    width: {
                                        value: 400,
                                    },
                                },
                            },
                        ],
                    },
                },
                sorts: [],
                title: "PivotTable - simple table with custom attribute column size",
                uri: "PivotTable.4535f7207b8c52d7b74f8a4a776cc116",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 8, 0),
    )();
SimpleTableWithCustomAttributeColumnSize.parameters = {
    kind: "simple table with custom attribute column size",
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

export const SimpleTableWithCustomMetricColumnSize = () =>
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
                identifier: "PivotTable.858b41e93656429bf2ac89f87cece314",
                properties: {
                    controls: {
                        columnWidths: [
                            {
                                measureColumnWidthItem: {
                                    locators: [
                                        {
                                            measureLocatorItem: {
                                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                            },
                                        },
                                    ],
                                    width: {
                                        value: 60,
                                    },
                                },
                            },
                        ],
                    },
                },
                sorts: [],
                title: "PivotTable - simple table with custom metric column size",
                uri: "PivotTable.858b41e93656429bf2ac89f87cece314",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 8, 1),
    )();
SimpleTableWithCustomMetricColumnSize.parameters = {
    kind: "simple table with custom metric column size",
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

export const SimpleTableWithAttributeAndMetricColumnSize = () =>
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
                identifier: "PivotTable.5802924a21d96020f2ae35b2e57e0f96",
                properties: {
                    controls: {
                        columnWidths: [
                            {
                                attributeColumnWidthItem: {
                                    attributeIdentifier: "a_label.f_product.product.name",
                                    width: {
                                        value: 400,
                                    },
                                },
                            },
                            {
                                measureColumnWidthItem: {
                                    locators: [
                                        {
                                            measureLocatorItem: {
                                                measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                            },
                                        },
                                    ],
                                    width: {
                                        value: 60,
                                    },
                                },
                            },
                        ],
                    },
                },
                sorts: [],
                title: "PivotTable - simple table with attribute and metric column size",
                uri: "PivotTable.5802924a21d96020f2ae35b2e57e0f96",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 8, 2),
    )();
SimpleTableWithAttributeAndMetricColumnSize.parameters = {
    kind: "simple table with attribute and metric column size",
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

export const TableWithMultipleMeasureColumnsAndWeakMeasureSize = () =>
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
                identifier: "PivotTable.ab5a2b8d16bb33e0e507930b3ab4bde1",
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
                                        value: 60,
                                    },
                                },
                            },
                        ],
                    },
                },
                sorts: [],
                title: "PivotTable - table with multiple measure columns and weak measure size",
                uri: "PivotTable.ab5a2b8d16bb33e0e507930b3ab4bde1",
                visualizationUrl: "local:table",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(14, 8, 3),
    )();
TableWithMultipleMeasureColumnsAndWeakMeasureSize.parameters = {
    kind: "table with multiple measure columns and weak measure size",
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
