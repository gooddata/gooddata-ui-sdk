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
    title: "04 Stories For Pluggable Vis/ComboChart/customization/axes",
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
                        localIdentifier: "secondary_measures",
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
                identifier: "ComboChart.c808a4aa52d33bbbcb7e59477b9b3886",
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
                sorts: [],
                title: "ComboChart - axis name configuration - low",
                uri: "ComboChart.c808a4aa52d33bbbcb7e59477b9b3886",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 11, 0),
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
                        localIdentifier: "secondary_measures",
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
                identifier: "ComboChart.f9d178e2fbf1be89bbb261edca97a5ea",
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
                sorts: [],
                title: "ComboChart - axis name configuration - middle",
                uri: "ComboChart.f9d178e2fbf1be89bbb261edca97a5ea",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 11, 1),
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
                        localIdentifier: "secondary_measures",
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
                identifier: "ComboChart.50f00a1d0178d4f2ee7aa70ec57b4fc9",
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
                sorts: [],
                title: "ComboChart - axis name configuration - high",
                uri: "ComboChart.50f00a1d0178d4f2ee7aa70ec57b4fc9",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 11, 2),
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
                        localIdentifier: "secondary_measures",
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
                identifier: "ComboChart.6641bb6c43ebcb9c5aa871f61ea2efbe",
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
                sorts: [],
                title: "ComboChart - axis name configuration - invisible",
                uri: "ComboChart.6641bb6c43ebcb9c5aa871f61ea2efbe",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 11, 3),
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
