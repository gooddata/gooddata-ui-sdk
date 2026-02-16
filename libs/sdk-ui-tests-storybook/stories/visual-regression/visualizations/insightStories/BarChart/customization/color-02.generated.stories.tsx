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
    title: "04 Stories For Pluggable Vis/BarChart/customization/color",
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
                identifier: "BarChart.2b46da54f9b7adb3edceb4e6fd04daf9",
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
                title: "BarChart - assign color to measures",
                uri: "BarChart.2b46da54f9b7adb3edceb4e6fd04daf9",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 8, 0),
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

export const AssignColorToMasterMeasureImpactsDerivedPop = () =>
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
                                    alias: "Won Last Year",
                                    definition: {
                                        popMeasureDefinition: {
                                            measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                            popAttribute: {
                                                identifier: "dt_closedate_timestamp.year",
                                                type: "attribute",
                                            },
                                        },
                                    },
                                    localIdentifier:
                                        "m_e40a8329_m_e519fa2a_86c3_4e32_8313_0c03062348j3_dt_closedate_timestamp.year",
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
                                        identifier: "dt_closedate_timestamp.year",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_closedate_timestamp.year",
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
                identifier: "BarChart.4e0ac95066705bb9e90e2f931c68bdc3",
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
                                id: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                            },
                        ],
                    },
                },
                sorts: [],
                title: "BarChart - assign color to master measure impacts derived PoP",
                uri: "BarChart.4e0ac95066705bb9e90e2f931c68bdc3",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 8, 1),
    )();
AssignColorToMasterMeasureImpactsDerivedPop.parameters = {
    kind: "assign color to master measure impacts derived PoP",
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

export const AssignColorToAttributeElementStack = () =>
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
                identifier: "BarChart.c6bd498beca0eae141f07b5cd9684d93",
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
                                id: "East Coast",
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
                                id: "West Coast",
                            },
                        ],
                    },
                },
                sorts: [],
                title: "BarChart - assign color to attribute element stack",
                uri: "BarChart.c6bd498beca0eae141f07b5cd9684d93",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 8, 2),
    )();
AssignColorToAttributeElementStack.parameters = {
    kind: "assign color to attribute element stack",
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
