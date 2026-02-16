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

export const DataLabelsDefault = () =>
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
                identifier: "WaterfallChart.313823760a49996ee159ff71cc338034",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "WaterfallChart - data labels - default",
                uri: "WaterfallChart.313823760a49996ee159ff71cc338034",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 2, 0),
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

export const DataLabelsDataLabelsAutoVisibility = () =>
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
                identifier: "WaterfallChart.1e44f4c88749093386a6f69ed046c6cd",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: "auto",
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - data labels - data labels auto visibility",
                uri: "WaterfallChart.1e44f4c88749093386a6f69ed046c6cd",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 2, 1),
    )();
DataLabelsDataLabelsAutoVisibility.parameters = {
    kind: "data labels - data labels auto visibility",
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

export const DataLabelsDataLabelsForcedVisible = () =>
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
                identifier: "WaterfallChart.38ebab04e2da7dc710e29e7c52d8a2dc",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - data labels - data labels forced visible",
                uri: "WaterfallChart.38ebab04e2da7dc710e29e7c52d8a2dc",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 2, 2),
    )();
DataLabelsDataLabelsForcedVisible.parameters = {
    kind: "data labels - data labels forced visible",
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

export const DataLabelsDataLabelsForcedHidden = () =>
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
                identifier: "WaterfallChart.a8462e1def3f8fc9ccf020ddcc92b8a2",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: false,
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - data labels - data labels forced hidden",
                uri: "WaterfallChart.a8462e1def3f8fc9ccf020ddcc92b8a2",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 2, 3),
    )();
DataLabelsDataLabelsForcedHidden.parameters = {
    kind: "data labels - data labels forced hidden",
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

export const DataLabelsForcedDatalabelsVisibleAndGermanSeparators = () =>
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
                identifier: "WaterfallChart.14d4b612826029f95ae90dc104850770",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - data labels - forced dataLabels visible and german separators",
                uri: "WaterfallChart.14d4b612826029f95ae90dc104850770",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 2, 4),
    )();
DataLabelsForcedDatalabelsVisibleAndGermanSeparators.parameters = {
    kind: "data labels - forced dataLabels visible and german separators",
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

export const DataLabelsDataLabelsAndTotalsWithAutoVisibility = () =>
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
                identifier: "WaterfallChart.f1cf6003ac5de776188ac5e406ebd6a1",
                properties: {
                    controls: {
                        dataLabels: {
                            totalsVisible: "auto",
                            visible: "auto",
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - data labels - data labels and totals with auto visibility",
                uri: "WaterfallChart.f1cf6003ac5de776188ac5e406ebd6a1",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 2, 5),
    )();
DataLabelsDataLabelsAndTotalsWithAutoVisibility.parameters = {
    kind: "data labels - data labels and totals with auto visibility",
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

export const DataLabelsDataLabelsForcedHiddenTotalsForcedVisible = () =>
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
                identifier: "WaterfallChart.8dc463ce3a2a381c3c2d9b562bfe6e0d",
                properties: {
                    controls: {
                        dataLabels: {
                            totalsVisible: true,
                            visible: false,
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - data labels - data labels forced hidden totals forced visible",
                uri: "WaterfallChart.8dc463ce3a2a381c3c2d9b562bfe6e0d",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 2, 6),
    )();
DataLabelsDataLabelsForcedHiddenTotalsForcedVisible.parameters = {
    kind: "data labels - data labels forced hidden totals forced visible",
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

export const DataLabelsDataLabelsForcedHiddenTotalsForcedHidden = () =>
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
                identifier: "WaterfallChart.f5e6c6094a518ed3887f751a87ed3c76",
                properties: {
                    controls: {
                        dataLabels: {
                            totalsVisible: false,
                            visible: false,
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - data labels - data labels forced hidden totals forced hidden",
                uri: "WaterfallChart.f5e6c6094a518ed3887f751a87ed3c76",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 2, 7),
    )();
DataLabelsDataLabelsForcedHiddenTotalsForcedHidden.parameters = {
    kind: "data labels - data labels forced hidden totals forced hidden",
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

export const DataLabelsLabelsForcedHiddenTotalsAutoVisibility = () =>
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
                identifier: "WaterfallChart.d09ba4ed8ec8916ed588aa2b01f83066",
                properties: {
                    controls: {
                        dataLabels: {
                            totalsVisible: "auto",
                            visible: false,
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - data labels - labels forced hidden totals auto visibility",
                uri: "WaterfallChart.d09ba4ed8ec8916ed588aa2b01f83066",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 2, 8),
    )();
DataLabelsLabelsForcedHiddenTotalsAutoVisibility.parameters = {
    kind: "data labels - labels forced hidden totals auto visibility",
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

export const DataLabelsDataLabelsWithBackplateStyle = () =>
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
                identifier: "WaterfallChart.dc506a9690304d9a536c386718a5c6d0",
                properties: {
                    controls: {
                        dataLabels: {
                            style: "backplate",
                            totalsVisible: true,
                            visible: true,
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - data labels - data labels with backplate style",
                uri: "WaterfallChart.dc506a9690304d9a536c386718a5c6d0",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 2, 9),
    )();
DataLabelsDataLabelsWithBackplateStyle.parameters = {
    kind: "data labels - data labels with backplate style",
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
