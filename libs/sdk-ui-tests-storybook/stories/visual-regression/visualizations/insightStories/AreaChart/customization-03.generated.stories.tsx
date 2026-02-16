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
    title: "04 Stories For Pluggable Vis/AreaChart/customization",
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
                identifier: "AreaChart.c27c510bc3157164911125cc456798d0",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "AreaChart - data points - sparse chart - default",
                uri: "AreaChart.c27c510bc3157164911125cc456798d0",
                visualizationUrl: "local:area",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(0, 3, 0),
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
                identifier: "AreaChart.9d78d560b2c516ad90ee68faabfc2b5d",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: "auto",
                        },
                    },
                },
                sorts: [],
                title: "AreaChart - data points - sparse chart - auto visibility",
                uri: "AreaChart.9d78d560b2c516ad90ee68faabfc2b5d",
                visualizationUrl: "local:area",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(0, 3, 1),
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
                identifier: "AreaChart.8dbe31697789a4e464134ace891be7a1",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: true,
                        },
                    },
                },
                sorts: [],
                title: "AreaChart - data points - sparse chart - forced visible",
                uri: "AreaChart.8dbe31697789a4e464134ace891be7a1",
                visualizationUrl: "local:area",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(0, 3, 2),
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
                identifier: "AreaChart.141e496201b32738d0233842253651b4",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: false,
                        },
                    },
                },
                sorts: [],
                title: "AreaChart - data points - sparse chart - forced hidden",
                uri: "AreaChart.141e496201b32738d0233842253651b4",
                visualizationUrl: "local:area",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(0, 3, 3),
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
                    {
                        items: [],
                        localIdentifier: "stack",
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
                identifier: "AreaChart.a97be468994b89529a3efba0a264a799",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "AreaChart - data points - dense chart - default",
                uri: "AreaChart.a97be468994b89529a3efba0a264a799",
                visualizationUrl: "local:area",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(0, 3, 4),
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
                    {
                        items: [],
                        localIdentifier: "stack",
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
                identifier: "AreaChart.e4be9b3a2dc9a70ada8138be9365fa45",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: "auto",
                        },
                    },
                },
                sorts: [],
                title: "AreaChart - data points - dense chart - auto visibility",
                uri: "AreaChart.e4be9b3a2dc9a70ada8138be9365fa45",
                visualizationUrl: "local:area",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(0, 3, 5),
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
                    {
                        items: [],
                        localIdentifier: "stack",
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
                identifier: "AreaChart.7e6c24553abc866ceb685d635f258ff1",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: true,
                        },
                    },
                },
                sorts: [],
                title: "AreaChart - data points - dense chart - forced visible",
                uri: "AreaChart.7e6c24553abc866ceb685d635f258ff1",
                visualizationUrl: "local:area",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(0, 3, 6),
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
                    {
                        items: [],
                        localIdentifier: "stack",
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
                identifier: "AreaChart.ff657add1d4710e8859f761deb11ad04",
                properties: {
                    controls: {
                        dataPoints: {
                            visible: false,
                        },
                    },
                },
                sorts: [],
                title: "AreaChart - data points - dense chart - forced hidden",
                uri: "AreaChart.ff657add1d4710e8859f761deb11ad04",
                visualizationUrl: "local:area",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(0, 3, 7),
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
