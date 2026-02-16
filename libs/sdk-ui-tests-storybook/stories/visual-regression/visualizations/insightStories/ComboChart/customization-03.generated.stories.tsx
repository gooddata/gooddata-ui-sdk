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
    title: "04 Stories For Pluggable Vis/ComboChart/customization",
};

export const DataPointsSparseChartDefault = () =>
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
                identifier: "ComboChart.8a4e966b901b888f7cf5d0c0cdd7ae87",
                properties: {
                    controls: {
                        primaryChartType: "line",
                        secondaryChartType: "area",
                    },
                },
                sorts: [],
                title: "ComboChart - data points - sparse chart - default",
                uri: "ComboChart.8a4e966b901b888f7cf5d0c0cdd7ae87",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 3, 0),
    )();
DataPointsSparseChartDefault.parameters = {
    kind: "data points - sparse chart - default",
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

export const DataPointsSparseChartAutoVisibility = () =>
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
                identifier: "ComboChart.4efd29a0bf1dc1f5491906c84786af36",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: "auto",
                        },
                        primaryChartType: "line",
                        secondaryChartType: "area",
                    },
                },
                sorts: [],
                title: "ComboChart - data points - sparse chart - auto visibility",
                uri: "ComboChart.4efd29a0bf1dc1f5491906c84786af36",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 3, 1),
    )();
DataPointsSparseChartAutoVisibility.parameters = {
    kind: "data points - sparse chart - auto visibility",
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

export const DataPointsSparseChartForcedVisible = () =>
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
                identifier: "ComboChart.6c3b038ec6366c8b06e19cfc44732d3b",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: true,
                        },
                        primaryChartType: "line",
                        secondaryChartType: "area",
                    },
                },
                sorts: [],
                title: "ComboChart - data points - sparse chart - forced visible",
                uri: "ComboChart.6c3b038ec6366c8b06e19cfc44732d3b",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 3, 2),
    )();
DataPointsSparseChartForcedVisible.parameters = {
    kind: "data points - sparse chart - forced visible",
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

export const DataPointsSparseChartForcedHidden = () =>
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
                identifier: "ComboChart.d58ee5f24ef932fcaba6f6799d96ee91",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: false,
                        },
                        primaryChartType: "line",
                        secondaryChartType: "area",
                    },
                },
                sorts: [],
                title: "ComboChart - data points - sparse chart - forced hidden",
                uri: "ComboChart.d58ee5f24ef932fcaba6f6799d96ee91",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 3, 3),
    )();
DataPointsSparseChartForcedHidden.parameters = {
    kind: "data points - sparse chart - forced hidden",
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

export const DataPointsDenseChartDefault = () =>
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
                                        identifier: "label.f_opportunity.opportunity.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_opportunity.opportunity.name",
                                },
                            },
                        ],
                        localIdentifier: "view",
                    },
                ],
                filters: [
                    {
                        measureValueFilter: {
                            condition: {
                                comparison: {
                                    operator: "GREATER_THAN",
                                    value: 100000,
                                },
                            },
                            measure: {
                                localIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                            },
                        },
                    },
                ],
                identifier: "ComboChart.40e2f35d5a4acce8c96baa198557deac",
                properties: {
                    controls: {
                        primaryChartType: "line",
                        secondaryChartType: "area",
                    },
                },
                sorts: [],
                title: "ComboChart - data points - dense chart - default",
                uri: "ComboChart.40e2f35d5a4acce8c96baa198557deac",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 3, 4),
    )();
DataPointsDenseChartDefault.parameters = {
    kind: "data points - dense chart - default",
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

export const DataPointsDenseChartAutoVisibility = () =>
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
                                        identifier: "label.f_opportunity.opportunity.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_opportunity.opportunity.name",
                                },
                            },
                        ],
                        localIdentifier: "view",
                    },
                ],
                filters: [
                    {
                        measureValueFilter: {
                            condition: {
                                comparison: {
                                    operator: "GREATER_THAN",
                                    value: 100000,
                                },
                            },
                            measure: {
                                localIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                            },
                        },
                    },
                ],
                identifier: "ComboChart.56a95e3e11797c4aaaac441b1a441b2c",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: "auto",
                        },
                        primaryChartType: "line",
                        secondaryChartType: "area",
                    },
                },
                sorts: [],
                title: "ComboChart - data points - dense chart - auto visibility",
                uri: "ComboChart.56a95e3e11797c4aaaac441b1a441b2c",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 3, 5),
    )();
DataPointsDenseChartAutoVisibility.parameters = {
    kind: "data points - dense chart - auto visibility",
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

export const DataPointsDenseChartForcedVisible = () =>
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
                                        identifier: "label.f_opportunity.opportunity.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_opportunity.opportunity.name",
                                },
                            },
                        ],
                        localIdentifier: "view",
                    },
                ],
                filters: [
                    {
                        measureValueFilter: {
                            condition: {
                                comparison: {
                                    operator: "GREATER_THAN",
                                    value: 100000,
                                },
                            },
                            measure: {
                                localIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                            },
                        },
                    },
                ],
                identifier: "ComboChart.4117e0ea31a489ad8f503da9f61d8a0d",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: true,
                        },
                        primaryChartType: "line",
                        secondaryChartType: "area",
                    },
                },
                sorts: [],
                title: "ComboChart - data points - dense chart - forced visible",
                uri: "ComboChart.4117e0ea31a489ad8f503da9f61d8a0d",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 3, 6),
    )();
DataPointsDenseChartForcedVisible.parameters = {
    kind: "data points - dense chart - forced visible",
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

export const DataPointsDenseChartForcedHidden = () =>
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
                                        identifier: "label.f_opportunity.opportunity.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_opportunity.opportunity.name",
                                },
                            },
                        ],
                        localIdentifier: "view",
                    },
                ],
                filters: [
                    {
                        measureValueFilter: {
                            condition: {
                                comparison: {
                                    operator: "GREATER_THAN",
                                    value: 100000,
                                },
                            },
                            measure: {
                                localIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                            },
                        },
                    },
                ],
                identifier: "ComboChart.9664fb0c104bf3774eecf8847b5c6c01",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: false,
                        },
                        primaryChartType: "line",
                        secondaryChartType: "area",
                    },
                },
                sorts: [],
                title: "ComboChart - data points - dense chart - forced hidden",
                uri: "ComboChart.9664fb0c104bf3774eecf8847b5c6c01",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 3, 7),
    )();
DataPointsDenseChartForcedHidden.parameters = {
    kind: "data points - dense chart - forced hidden",
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
