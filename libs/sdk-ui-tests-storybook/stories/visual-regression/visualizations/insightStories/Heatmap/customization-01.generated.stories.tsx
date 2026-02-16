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
    title: "04 Stories For Pluggable Vis/Heatmap/customization",
};

export const AxisNameConfigurationLow = () =>
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
                identifier: "Heatmap.796c5a43d0842ef52a14deda5b505836",
                properties: {
                    controls: {
                        secondary_xaxis: {
                            name: {
                                position: "left",
                            },
                        },
                        secondary_yaxis: {
                            name: {
                                position: "bottom",
                            },
                        },
                        xaxis: {
                            name: {
                                position: "left",
                            },
                        },
                        yaxis: {
                            name: {
                                position: "bottom",
                            },
                        },
                    },
                },
                sorts: [
                    {
                        attributeSortItem: {
                            attributeIdentifier: "a_label.f_product.product.name",
                            direction: "desc",
                        },
                    },
                ],
                title: "Heatmap - axis name configuration - low",
                uri: "Heatmap.796c5a43d0842ef52a14deda5b505836",
                visualizationUrl: "local:heatmap",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 1, 0),
    )();
AxisNameConfigurationLow.parameters = {
    kind: "axis name configuration - low",
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

export const AxisNameConfigurationMiddle = () =>
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
                identifier: "Heatmap.7654db596ed899eb5729c112b8c8f9b2",
                properties: {
                    controls: {
                        secondary_xaxis: {
                            name: {
                                position: "center",
                            },
                        },
                        secondary_yaxis: {
                            name: {
                                position: "center",
                            },
                        },
                        xaxis: {
                            name: {
                                position: "center",
                            },
                        },
                        yaxis: {
                            name: {
                                position: "center",
                            },
                        },
                    },
                },
                sorts: [
                    {
                        attributeSortItem: {
                            attributeIdentifier: "a_label.f_product.product.name",
                            direction: "desc",
                        },
                    },
                ],
                title: "Heatmap - axis name configuration - middle",
                uri: "Heatmap.7654db596ed899eb5729c112b8c8f9b2",
                visualizationUrl: "local:heatmap",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 1, 1),
    )();
AxisNameConfigurationMiddle.parameters = {
    kind: "axis name configuration - middle",
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

export const AxisNameConfigurationHigh = () =>
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
                identifier: "Heatmap.9824ef5804cfab871ba9215ae8884eb9",
                properties: {
                    controls: {
                        secondary_xaxis: {
                            name: {
                                position: "right",
                            },
                        },
                        secondary_yaxis: {
                            name: {
                                position: "top",
                            },
                        },
                        xaxis: {
                            name: {
                                position: "right",
                            },
                        },
                        yaxis: {
                            name: {
                                position: "top",
                            },
                        },
                    },
                },
                sorts: [
                    {
                        attributeSortItem: {
                            attributeIdentifier: "a_label.f_product.product.name",
                            direction: "desc",
                        },
                    },
                ],
                title: "Heatmap - axis name configuration - high",
                uri: "Heatmap.9824ef5804cfab871ba9215ae8884eb9",
                visualizationUrl: "local:heatmap",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 1, 2),
    )();
AxisNameConfigurationHigh.parameters = {
    kind: "axis name configuration - high",
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

export const AxisNameConfigurationInvisible = () =>
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
                identifier: "Heatmap.40e3c62f627ed32f7cad2a66b1cc230a",
                properties: {
                    controls: {
                        secondary_xaxis: {
                            name: {
                                position: "center",
                            },
                        },
                        secondary_yaxis: {
                            name: {
                                position: "center",
                            },
                        },
                        xaxis: {
                            name: {
                                position: "center",
                            },
                        },
                        yaxis: {
                            name: {
                                position: "center",
                            },
                        },
                    },
                },
                sorts: [
                    {
                        attributeSortItem: {
                            attributeIdentifier: "a_label.f_product.product.name",
                            direction: "desc",
                        },
                    },
                ],
                title: "Heatmap - axis name configuration - invisible",
                uri: "Heatmap.40e3c62f627ed32f7cad2a66b1cc230a",
                visualizationUrl: "local:heatmap",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 1, 3),
    )();
AxisNameConfigurationInvisible.parameters = {
    kind: "axis name configuration - invisible",
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
