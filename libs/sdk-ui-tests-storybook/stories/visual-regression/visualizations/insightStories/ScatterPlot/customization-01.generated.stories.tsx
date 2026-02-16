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
    title: "04 Stories For Pluggable Vis/ScatterPlot/customization",
};

export const DataLabelsDefault = () =>
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
                identifier: "ScatterPlot.384e6595215e2e9ffbcf2f0ce6a12185",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "ScatterPlot - data labels - default",
                uri: "ScatterPlot.384e6595215e2e9ffbcf2f0ce6a12185",
                visualizationUrl: "local:scatter",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(19, 1, 0),
    )();
DataLabelsDefault.parameters = {
    kind: "data labels - default",
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

export const DataLabelsAutoVisibility = () =>
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
                identifier: "ScatterPlot.eecb6fdfe08cb6ddb3050d4199969aef",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: "auto",
                        },
                    },
                },
                sorts: [],
                title: "ScatterPlot - data labels - auto visibility",
                uri: "ScatterPlot.eecb6fdfe08cb6ddb3050d4199969aef",
                visualizationUrl: "local:scatter",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(19, 1, 1),
    )();
DataLabelsAutoVisibility.parameters = {
    kind: "data labels - auto visibility",
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

export const DataLabelsForcedVisible = () =>
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
                identifier: "ScatterPlot.526a6f4fc5b272a9f68da8006bf52e5f",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                    },
                },
                sorts: [],
                title: "ScatterPlot - data labels - forced visible",
                uri: "ScatterPlot.526a6f4fc5b272a9f68da8006bf52e5f",
                visualizationUrl: "local:scatter",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(19, 1, 2),
    )();
DataLabelsForcedVisible.parameters = {
    kind: "data labels - forced visible",
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

export const DataLabelsForcedVisibleAndGermanSeparators = () =>
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
                identifier: "ScatterPlot.6c85e73b81350adc73eba8d71d5887cc",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                    },
                },
                sorts: [],
                title: "ScatterPlot - data labels - forced visible and german separators",
                uri: "ScatterPlot.6c85e73b81350adc73eba8d71d5887cc",
                visualizationUrl: "local:scatter",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(19, 1, 3),
    )();
DataLabelsForcedVisibleAndGermanSeparators.parameters = {
    kind: "data labels - forced visible and german separators",
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

export const DataLabelsForcedHidden = () =>
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
                identifier: "ScatterPlot.fd3b32cb5297d8e04be0350abb89e709",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: false,
                        },
                    },
                },
                sorts: [],
                title: "ScatterPlot - data labels - forced hidden",
                uri: "ScatterPlot.fd3b32cb5297d8e04be0350abb89e709",
                visualizationUrl: "local:scatter",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(19, 1, 4),
    )();
DataLabelsForcedHidden.parameters = {
    kind: "data labels - forced hidden",
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
