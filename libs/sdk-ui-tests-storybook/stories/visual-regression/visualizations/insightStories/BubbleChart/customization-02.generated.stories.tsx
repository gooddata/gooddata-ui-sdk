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
    title: "04 Stories For Pluggable Vis/BubbleChart/customization",
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
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "b4e3e3c7-ead3-4d69-8be4-23bcfe5ff7aa",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_b4e3e3c7_ead3_4d69_8be4_23bcfe5ff7aa",
                                },
                            },
                        ],
                        localIdentifier: "tertiary_measures",
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
                identifier: "BubbleChart.e522f68e8c9fb061dde36b737844cfbf",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "BubbleChart - data labels - default",
                uri: "BubbleChart.e522f68e8c9fb061dde36b737844cfbf",
                visualizationUrl: "local:bubble",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(2, 2, 0),
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
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "b4e3e3c7-ead3-4d69-8be4-23bcfe5ff7aa",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_b4e3e3c7_ead3_4d69_8be4_23bcfe5ff7aa",
                                },
                            },
                        ],
                        localIdentifier: "tertiary_measures",
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
                identifier: "BubbleChart.b1414e96acb0ef6e6857f2fa4dce259a",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: "auto",
                        },
                    },
                },
                sorts: [],
                title: "BubbleChart - data labels - auto visibility",
                uri: "BubbleChart.b1414e96acb0ef6e6857f2fa4dce259a",
                visualizationUrl: "local:bubble",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(2, 2, 1),
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
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "b4e3e3c7-ead3-4d69-8be4-23bcfe5ff7aa",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_b4e3e3c7_ead3_4d69_8be4_23bcfe5ff7aa",
                                },
                            },
                        ],
                        localIdentifier: "tertiary_measures",
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
                identifier: "BubbleChart.4275769d6ca57e43e8ae3fb29732c5b0",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                    },
                },
                sorts: [],
                title: "BubbleChart - data labels - forced visible",
                uri: "BubbleChart.4275769d6ca57e43e8ae3fb29732c5b0",
                visualizationUrl: "local:bubble",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(2, 2, 2),
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
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "b4e3e3c7-ead3-4d69-8be4-23bcfe5ff7aa",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_b4e3e3c7_ead3_4d69_8be4_23bcfe5ff7aa",
                                },
                            },
                        ],
                        localIdentifier: "tertiary_measures",
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
                identifier: "BubbleChart.72220bd60460303f63ae5460a8d9e387",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                    },
                },
                sorts: [],
                title: "BubbleChart - data labels - forced visible and german separators",
                uri: "BubbleChart.72220bd60460303f63ae5460a8d9e387",
                visualizationUrl: "local:bubble",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(2, 2, 3),
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
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "b4e3e3c7-ead3-4d69-8be4-23bcfe5ff7aa",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_b4e3e3c7_ead3_4d69_8be4_23bcfe5ff7aa",
                                },
                            },
                        ],
                        localIdentifier: "tertiary_measures",
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
                identifier: "BubbleChart.66bb2deb2faedba271e41f6f8f6eda9d",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: false,
                        },
                    },
                },
                sorts: [],
                title: "BubbleChart - data labels - forced hidden",
                uri: "BubbleChart.66bb2deb2faedba271e41f6f8f6eda9d",
                visualizationUrl: "local:bubble",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(2, 2, 4),
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
