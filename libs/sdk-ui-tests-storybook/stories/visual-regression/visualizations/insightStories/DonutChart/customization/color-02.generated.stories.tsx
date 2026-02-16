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
    title: "04 Stories For Pluggable Vis/DonutChart/customization/color",
};

export const AssignColorToMeasures = () =>
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
                        localIdentifier: "view",
                    },
                ],
                filters: [],
                identifier: "DonutChart.9b97aa4f7ae007493489b6e34cde5aac",
                properties: {
                    controls: {
                        colorMapping: [
                            {
                                color: {
                                    type: "rgb",
                                    value: {
                                        b: 0,
                                        g: 0,
                                        r: 0,
                                    },
                                },
                                id: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                            },
                            {
                                color: {
                                    type: "guid",
                                    value: "05",
                                },
                                id: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                            },
                        ],
                    },
                },
                sorts: [],
                title: "DonutChart - assign color to measures",
                uri: "DonutChart.9b97aa4f7ae007493489b6e34cde5aac",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 5, 0),
    )();
AssignColorToMeasures.parameters = {
    kind: "assign color to measures",
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

export const AssignColorToAttributes = () =>
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
                identifier: "DonutChart.bfe3b94202490a926f469b00317f747e",
                properties: {
                    controls: {
                        colorMapping: [
                            {
                                color: {
                                    type: "rgb",
                                    value: {
                                        b: 0,
                                        g: 0,
                                        r: 0,
                                    },
                                },
                                id: "WonderKid",
                            },
                            {
                                color: {
                                    type: "rgb",
                                    value: {
                                        b: 0,
                                        g: 0,
                                        r: 255,
                                    },
                                },
                                id: "Explorer",
                            },
                        ],
                    },
                },
                sorts: [],
                title: "DonutChart - assign color to attributes",
                uri: "DonutChart.bfe3b94202490a926f469b00317f747e",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 5, 1),
    )();
AssignColorToAttributes.parameters = {
    kind: "assign color to attributes",
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
