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
    title: "04 Stories For Pluggable Vis/Heatmap/base",
};

export const MeasureOnly = () =>
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
                identifier: "Heatmap.4627efb0aca983766004829c0f3af509",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "Heatmap - measure only",
                uri: "Heatmap.4627efb0aca983766004829c0f3af509",
                visualizationUrl: "local:heatmap",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 0, 0),
    )();
MeasureOnly.parameters = {
    kind: "measure only",
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

export const MeasureAndRows = () =>
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
                identifier: "Heatmap.86de8be2c848fa2a3197e293c4c6a60a",
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
                title: "Heatmap - measure and rows",
                uri: "Heatmap.86de8be2c848fa2a3197e293c4c6a60a",
                visualizationUrl: "local:heatmap",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 0, 1),
    )();
MeasureAndRows.parameters = {
    kind: "measure and rows",
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

export const MeasureAndColumns = () =>
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
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "Heatmap.0d92e621bf0cff8f0a0d7e941d01c2df",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "Heatmap - measure and columns",
                uri: "Heatmap.0d92e621bf0cff8f0a0d7e941d01c2df",
                visualizationUrl: "local:heatmap",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 0, 2),
    )();
MeasureAndColumns.parameters = {
    kind: "measure and columns",
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

export const MeasureRowsAndColumns = () =>
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
                identifier: "Heatmap.116ca7e07cce3dbbf95797ba78abb88d",
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
                title: "Heatmap - measure, rows and columns",
                uri: "Heatmap.116ca7e07cce3dbbf95797ba78abb88d",
                visualizationUrl: "local:heatmap",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 0, 3),
    )();
MeasureRowsAndColumns.parameters = {
    kind: "measure, rows and columns",
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

export const MeasureRowsAndColumnsWithNullDataPoints = () =>
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
                identifier: "Heatmap.6ac68ac043aad55e3db19d1689f602e7",
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
                title: "Heatmap - measure, rows and columns with null data points",
                uri: "Heatmap.6ac68ac043aad55e3db19d1689f602e7",
                visualizationUrl: "local:heatmap",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 0, 4),
    )();
MeasureRowsAndColumnsWithNullDataPoints.parameters = {
    kind: "measure, rows and columns with null data points",
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
