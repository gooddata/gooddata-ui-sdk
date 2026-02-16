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
    title: "04 Stories For Pluggable Vis/WaterfallChart/customization",
};

export const LegendPositionDefaultLegend = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Sum Velocity",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_stagehistory.f_velocity",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_stagehistory.f_velocity_sum",
                                },
                            },
                            {
                                measure: {
                                    alias: "Sum Duration",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_stagehistory.f_duration",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_stagehistory.f_duration_sum",
                                },
                            },
                            {
                                measure: {
                                    alias: "Sum Density",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_density",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_density_sum",
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
                identifier: "WaterfallChart.119b82deec4003c2077857f2aa59d60d",
                properties: {
                    controls: {
                        legend: {},
                    },
                },
                sorts: [],
                title: "WaterfallChart - legend position - default legend",
                uri: "WaterfallChart.119b82deec4003c2077857f2aa59d60d",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 1, 0),
    )();
LegendPositionDefaultLegend.parameters = {
    kind: "legend position - default legend",
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

export const LegendPositionAutoLegend = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Sum Velocity",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_stagehistory.f_velocity",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_stagehistory.f_velocity_sum",
                                },
                            },
                            {
                                measure: {
                                    alias: "Sum Duration",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_stagehistory.f_duration",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_stagehistory.f_duration_sum",
                                },
                            },
                            {
                                measure: {
                                    alias: "Sum Density",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_density",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_density_sum",
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
                identifier: "WaterfallChart.cb51a19006d4639caada16eb2ef0d0fd",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "auto",
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - legend position - auto legend",
                uri: "WaterfallChart.cb51a19006d4639caada16eb2ef0d0fd",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 1, 1),
    )();
LegendPositionAutoLegend.parameters = {
    kind: "legend position - auto legend",
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

export const LegendPositionLegendOnLeft = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Sum Velocity",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_stagehistory.f_velocity",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_stagehistory.f_velocity_sum",
                                },
                            },
                            {
                                measure: {
                                    alias: "Sum Duration",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_stagehistory.f_duration",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_stagehistory.f_duration_sum",
                                },
                            },
                            {
                                measure: {
                                    alias: "Sum Density",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_density",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_density_sum",
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
                identifier: "WaterfallChart.e265dad62a3587264d85179b5e4adc4d",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "left",
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - legend position - legend on left",
                uri: "WaterfallChart.e265dad62a3587264d85179b5e4adc4d",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 1, 2),
    )();
LegendPositionLegendOnLeft.parameters = {
    kind: "legend position - legend on left",
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

export const LegendPositionLegendOnRight = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Sum Velocity",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_stagehistory.f_velocity",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_stagehistory.f_velocity_sum",
                                },
                            },
                            {
                                measure: {
                                    alias: "Sum Duration",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_stagehistory.f_duration",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_stagehistory.f_duration_sum",
                                },
                            },
                            {
                                measure: {
                                    alias: "Sum Density",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_density",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_density_sum",
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
                identifier: "WaterfallChart.3dce281b7b1a552389fa105b6931ddb9",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "right",
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - legend position - legend on right",
                uri: "WaterfallChart.3dce281b7b1a552389fa105b6931ddb9",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 1, 3),
    )();
LegendPositionLegendOnRight.parameters = {
    kind: "legend position - legend on right",
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

export const LegendPositionLegendOnTop = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Sum Velocity",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_stagehistory.f_velocity",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_stagehistory.f_velocity_sum",
                                },
                            },
                            {
                                measure: {
                                    alias: "Sum Duration",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_stagehistory.f_duration",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_stagehistory.f_duration_sum",
                                },
                            },
                            {
                                measure: {
                                    alias: "Sum Density",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_density",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_density_sum",
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
                identifier: "WaterfallChart.6a9f1abe52e5ff2629813a01997245f0",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - legend position - legend on top",
                uri: "WaterfallChart.6a9f1abe52e5ff2629813a01997245f0",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 1, 4),
    )();
LegendPositionLegendOnTop.parameters = {
    kind: "legend position - legend on top",
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

export const LegendPositionLegendAtBottom = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Sum Velocity",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_stagehistory.f_velocity",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_stagehistory.f_velocity_sum",
                                },
                            },
                            {
                                measure: {
                                    alias: "Sum Duration",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_stagehistory.f_duration",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_stagehistory.f_duration_sum",
                                },
                            },
                            {
                                measure: {
                                    alias: "Sum Density",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_density",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_density_sum",
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
                identifier: "WaterfallChart.1cc8875071d54d47d048c30b22c0037f",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "bottom",
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - legend position - legend at bottom",
                uri: "WaterfallChart.1cc8875071d54d47d048c30b22c0037f",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 1, 5),
    )();
LegendPositionLegendAtBottom.parameters = {
    kind: "legend position - legend at bottom",
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

export const LegendPositionDisabled = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Sum Velocity",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_stagehistory.f_velocity",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_stagehistory.f_velocity_sum",
                                },
                            },
                            {
                                measure: {
                                    alias: "Sum Duration",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_stagehistory.f_duration",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_stagehistory.f_duration_sum",
                                },
                            },
                            {
                                measure: {
                                    alias: "Sum Density",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_density",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_density_sum",
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
                identifier: "WaterfallChart.79a47c01f5d673bf46cb9a559ac34a0a",
                properties: {
                    controls: {
                        legend: {
                            enabled: false,
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - legend position - disabled",
                uri: "WaterfallChart.79a47c01f5d673bf46cb9a559ac34a0a",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 1, 6),
    )();
LegendPositionDisabled.parameters = {
    kind: "legend position - disabled",
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
