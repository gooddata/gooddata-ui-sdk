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
    title: "04 Stories For Pluggable Vis/ScatterPlot/customization/axes",
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
                                                identifier: "973a14c4-acb1-45fb-ba52-5d96fa02f7ba",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_973a14c4_acb1_45fb_ba52_5d96fa02f7ba",
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
                        localIdentifier: "attribute",
                    },
                    {
                        items: [],
                        localIdentifier: "segment",
                    },
                ],
                filters: [],
                identifier: "ScatterPlot.1f76e8e82586bdebd707271a42784586",
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
                title: "ScatterPlot - axis name configuration - low",
                uri: "ScatterPlot.1f76e8e82586bdebd707271a42784586",
                visualizationUrl: "local:scatter",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(19, 3, 0),
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
                                                identifier: "973a14c4-acb1-45fb-ba52-5d96fa02f7ba",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_973a14c4_acb1_45fb_ba52_5d96fa02f7ba",
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
                        localIdentifier: "attribute",
                    },
                    {
                        items: [],
                        localIdentifier: "segment",
                    },
                ],
                filters: [],
                identifier: "ScatterPlot.ec8ae1e345e59e6252a158353406724a",
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
                title: "ScatterPlot - axis name configuration - middle",
                uri: "ScatterPlot.ec8ae1e345e59e6252a158353406724a",
                visualizationUrl: "local:scatter",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(19, 3, 1),
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
                                                identifier: "973a14c4-acb1-45fb-ba52-5d96fa02f7ba",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_973a14c4_acb1_45fb_ba52_5d96fa02f7ba",
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
                        localIdentifier: "attribute",
                    },
                    {
                        items: [],
                        localIdentifier: "segment",
                    },
                ],
                filters: [],
                identifier: "ScatterPlot.a24f8f6bcb185e156029e82594f2adbe",
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
                title: "ScatterPlot - axis name configuration - high",
                uri: "ScatterPlot.a24f8f6bcb185e156029e82594f2adbe",
                visualizationUrl: "local:scatter",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(19, 3, 2),
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
                                                identifier: "973a14c4-acb1-45fb-ba52-5d96fa02f7ba",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_973a14c4_acb1_45fb_ba52_5d96fa02f7ba",
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
                        localIdentifier: "attribute",
                    },
                    {
                        items: [],
                        localIdentifier: "segment",
                    },
                ],
                filters: [],
                identifier: "ScatterPlot.811b83d58ae74fd578be9b33762e85bd",
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
                title: "ScatterPlot - axis name configuration - invisible",
                uri: "ScatterPlot.811b83d58ae74fd578be9b33762e85bd",
                visualizationUrl: "local:scatter",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(19, 3, 3),
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
