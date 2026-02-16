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
    title: "04 Stories For Pluggable Vis/ComboChart/customization/theme",
};

export const Themed = () =>
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
                            {
                                measure: {
                                    alias: "Calculated 'Lost' measure",
                                    definition: {
                                        arithmeticMeasure: {
                                            measureIdentifiers: [
                                                "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                                "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                            ],
                                            operator: "difference",
                                        },
                                    },
                                    localIdentifier: "m_358184a8_9fa7cb9ce4d2947059b490e24a925317",
                                },
                            },
                        ],
                        localIdentifier: "measures",
                    },
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Ratio of Won and Lost",
                                    definition: {
                                        arithmeticMeasure: {
                                            measureIdentifiers: [
                                                "m_358184a8_9fa7cb9ce4d2947059b490e24a925317",
                                                "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                            ],
                                            operator: "ratio",
                                        },
                                    },
                                    localIdentifier: "m_7ff816a7_82e019308ff681db5738ce5040bc533d",
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
                identifier: "ComboChart.71fd05988f1418549928ffe9a2ce06b6",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "ComboChart - themed",
                uri: "ComboChart.71fd05988f1418549928ffe9a2ce06b6",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 23, 0),
    )();
Themed.parameters = {
    kind: "themed",
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

export const Font = () =>
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
                            {
                                measure: {
                                    alias: "Calculated 'Lost' measure",
                                    definition: {
                                        arithmeticMeasure: {
                                            measureIdentifiers: [
                                                "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                                "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                            ],
                                            operator: "difference",
                                        },
                                    },
                                    localIdentifier: "m_358184a8_9fa7cb9ce4d2947059b490e24a925317",
                                },
                            },
                        ],
                        localIdentifier: "measures",
                    },
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Ratio of Won and Lost",
                                    definition: {
                                        arithmeticMeasure: {
                                            measureIdentifiers: [
                                                "m_358184a8_9fa7cb9ce4d2947059b490e24a925317",
                                                "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                            ],
                                            operator: "ratio",
                                        },
                                    },
                                    localIdentifier: "m_7ff816a7_82e019308ff681db5738ce5040bc533d",
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
                identifier: "ComboChart.64aed64a39a77e9ec82be8b9a4da607b",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "ComboChart - font",
                uri: "ComboChart.64aed64a39a77e9ec82be8b9a4da607b",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 23, 1),
    )();
Font.parameters = {
    kind: "font",
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
