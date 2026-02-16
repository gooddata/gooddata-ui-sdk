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
    title: "04 Stories For Pluggable Vis/ComboChart/stacking",
};

export const DiscardStackingWhenPrimaryMeasuresAreOnLineChartSecondaryIsColumn = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Min Amount",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "min",
                                            item: {
                                                identifier: "f_opportunitysnapshot.f_amount",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_e9c321cf_f_opportunitysnapshot.f_amount_min",
                                },
                            },
                            {
                                measure: {
                                    alias: "Median Amount",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "median",
                                            item: {
                                                identifier: "f_opportunitysnapshot.f_amount",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_899a31be_f_opportunitysnapshot.f_amount_median",
                                },
                            },
                            {
                                measure: {
                                    alias: "Max Amount",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "max",
                                            item: {
                                                identifier: "f_opportunitysnapshot.f_amount",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_5c640258_f_opportunitysnapshot.f_amount_max",
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
                identifier: "ComboChart.982eb7956cfdc5760da09f0709c77ec7",
                properties: {
                    controls: {
                        primaryChartType: "line",
                        secondaryChartType: "column",
                        stackMeasures: true,
                    },
                },
                sorts: [],
                title: "ComboChart - discard stacking when primary measures are on line chart - secondary is column",
                uri: "ComboChart.982eb7956cfdc5760da09f0709c77ec7",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 27, 0),
    )();
DiscardStackingWhenPrimaryMeasuresAreOnLineChartSecondaryIsColumn.parameters = {
    kind: "discard stacking when primary measures are on line chart - secondary is column",
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

export const DiscardStackingWhenPrimaryMeasuresAreOnLineChartSecondaryIsArea = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Min Amount",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "min",
                                            item: {
                                                identifier: "f_opportunitysnapshot.f_amount",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_e9c321cf_f_opportunitysnapshot.f_amount_min",
                                },
                            },
                            {
                                measure: {
                                    alias: "Median Amount",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "median",
                                            item: {
                                                identifier: "f_opportunitysnapshot.f_amount",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_899a31be_f_opportunitysnapshot.f_amount_median",
                                },
                            },
                            {
                                measure: {
                                    alias: "Max Amount",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "max",
                                            item: {
                                                identifier: "f_opportunitysnapshot.f_amount",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_5c640258_f_opportunitysnapshot.f_amount_max",
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
                identifier: "ComboChart.317ab508998a3916331be0c40206e2c2",
                properties: {
                    controls: {
                        primaryChartType: "line",
                        secondaryChartType: "area",
                        stackMeasures: true,
                    },
                },
                sorts: [],
                title: "ComboChart - discard stacking when primary measures are on line chart - secondary is area",
                uri: "ComboChart.317ab508998a3916331be0c40206e2c2",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 27, 1),
    )();
DiscardStackingWhenPrimaryMeasuresAreOnLineChartSecondaryIsArea.parameters = {
    kind: "discard stacking when primary measures are on line chart - secondary is area",
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
