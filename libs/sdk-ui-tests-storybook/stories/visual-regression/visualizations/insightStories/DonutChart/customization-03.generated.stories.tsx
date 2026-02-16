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
    title: "04 Stories For Pluggable Vis/DonutChart/customization",
};

export const VerticalAlignmentBottom = () =>
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
                ],
                filters: [],
                identifier: "DonutChart.1a66f2d774d53ab56e0b7f135d3d23a5",
                properties: {
                    controls: {
                        chart: {
                            verticalAlign: "bottom",
                        },
                    },
                },
                sorts: [],
                title: "DonutChart - vertical alignment - bottom",
                uri: "DonutChart.1a66f2d774d53ab56e0b7f135d3d23a5",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 3, 0),
    )();
VerticalAlignmentBottom.parameters = {
    kind: "vertical alignment - bottom",
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

export const VerticalAlignmentMiddle = () =>
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
                ],
                filters: [],
                identifier: "DonutChart.dbb34d43f1e9104be536a13959dc08a7",
                properties: {
                    controls: {
                        chart: {
                            verticalAlign: "middle",
                        },
                    },
                },
                sorts: [],
                title: "DonutChart - vertical alignment - middle",
                uri: "DonutChart.dbb34d43f1e9104be536a13959dc08a7",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 3, 1),
    )();
VerticalAlignmentMiddle.parameters = {
    kind: "vertical alignment - middle",
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

export const VerticalAlignmentTop = () =>
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
                ],
                filters: [],
                identifier: "DonutChart.b5ec25ed1e54c641ffefce22c9bba0be",
                properties: {
                    controls: {
                        chart: {
                            verticalAlign: "top",
                        },
                    },
                },
                sorts: [],
                title: "DonutChart - vertical alignment - top",
                uri: "DonutChart.b5ec25ed1e54c641ffefce22c9bba0be",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 3, 2),
    )();
VerticalAlignmentTop.parameters = {
    kind: "vertical alignment - top",
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

export const VerticalAlignmentDefault = () =>
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
                ],
                filters: [],
                identifier: "DonutChart.8d1538c79f39d7ddcbdce28f1e85c0ea",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "DonutChart - vertical alignment - default",
                uri: "DonutChart.8d1538c79f39d7ddcbdce28f1e85c0ea",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 3, 3),
    )();
VerticalAlignmentDefault.parameters = {
    kind: "vertical alignment - default",
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
