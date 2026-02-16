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
    title: "04 Stories For Pluggable Vis/DonutChart/customization",
};

export const LegendPositionTwoMeasuresAutoLegend = () =>
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
                        items: [],
                        localIdentifier: "view",
                    },
                ],
                filters: [],
                identifier: "DonutChart.50954a90f95d6ddde1d3ce8e30b962e9",
                properties: {
                    controls: {
                        legend: {
                            position: "auto",
                        },
                    },
                },
                sorts: [],
                title: "DonutChart - legend position - two measures - auto legend",
                uri: "DonutChart.50954a90f95d6ddde1d3ce8e30b962e9",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 1, 0),
    )();
LegendPositionTwoMeasuresAutoLegend.parameters = {
    kind: "legend position - two measures - auto legend",
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

export const LegendPositionTwoMeasuresLegendOnLeft = () =>
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
                        items: [],
                        localIdentifier: "view",
                    },
                ],
                filters: [],
                identifier: "DonutChart.ac1d5d41b18b87c1f21972d49b082a9c",
                properties: {
                    controls: {
                        legend: {
                            position: "left",
                        },
                    },
                },
                sorts: [],
                title: "DonutChart - legend position - two measures - legend on left",
                uri: "DonutChart.ac1d5d41b18b87c1f21972d49b082a9c",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 1, 1),
    )();
LegendPositionTwoMeasuresLegendOnLeft.parameters = {
    kind: "legend position - two measures - legend on left",
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

export const LegendPositionTwoMeasuresLegendOnRight = () =>
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
                        items: [],
                        localIdentifier: "view",
                    },
                ],
                filters: [],
                identifier: "DonutChart.c436c9363d0b6220cd14b4d73d1ba374",
                properties: {
                    controls: {
                        legend: {
                            position: "right",
                        },
                    },
                },
                sorts: [],
                title: "DonutChart - legend position - two measures - legend on right",
                uri: "DonutChart.c436c9363d0b6220cd14b4d73d1ba374",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 1, 2),
    )();
LegendPositionTwoMeasuresLegendOnRight.parameters = {
    kind: "legend position - two measures - legend on right",
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

export const LegendPositionTwoMeasuresLegendOnTop = () =>
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
                        items: [],
                        localIdentifier: "view",
                    },
                ],
                filters: [],
                identifier: "DonutChart.18c5e53c80ae64e59e13fd667a9a691a",
                properties: {
                    controls: {
                        legend: {
                            position: "top",
                        },
                    },
                },
                sorts: [],
                title: "DonutChart - legend position - two measures - legend on top",
                uri: "DonutChart.18c5e53c80ae64e59e13fd667a9a691a",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 1, 3),
    )();
LegendPositionTwoMeasuresLegendOnTop.parameters = {
    kind: "legend position - two measures - legend on top",
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

export const LegendPositionTwoMeasuresLegendAtBottom = () =>
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
                        items: [],
                        localIdentifier: "view",
                    },
                ],
                filters: [],
                identifier: "DonutChart.ec22a82cf1d285839cd56258968ad25c",
                properties: {
                    controls: {
                        legend: {
                            position: "bottom",
                        },
                    },
                },
                sorts: [],
                title: "DonutChart - legend position - two measures - legend at bottom",
                uri: "DonutChart.ec22a82cf1d285839cd56258968ad25c",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 1, 4),
    )();
LegendPositionTwoMeasuresLegendAtBottom.parameters = {
    kind: "legend position - two measures - legend at bottom",
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

export const LegendPositionTwoMeasuresDisabled = () =>
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
                        items: [],
                        localIdentifier: "view",
                    },
                ],
                filters: [],
                identifier: "DonutChart.4b7733c14dbaf4daceaeeba467da9dd0",
                properties: {
                    controls: {
                        legend: {
                            enabled: false,
                        },
                    },
                },
                sorts: [],
                title: "DonutChart - legend position - two measures - disabled",
                uri: "DonutChart.4b7733c14dbaf4daceaeeba467da9dd0",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 1, 5),
    )();
LegendPositionTwoMeasuresDisabled.parameters = {
    kind: "legend position - two measures - disabled",
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

export const LegendPositionSingleMeasureAndViewbyAutoLegend = () =>
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
                ],
                filters: [],
                identifier: "DonutChart.0dd23ca4a0c492213b5992f62edf894a",
                properties: {
                    controls: {
                        legend: {
                            position: "auto",
                        },
                    },
                },
                sorts: [],
                title: "DonutChart - legend position - single measure and viewBy - auto legend",
                uri: "DonutChart.0dd23ca4a0c492213b5992f62edf894a",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 1, 6),
    )();
LegendPositionSingleMeasureAndViewbyAutoLegend.parameters = {
    kind: "legend position - single measure and viewBy - auto legend",
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

export const LegendPositionSingleMeasureAndViewbyLegendOnLeft = () =>
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
                ],
                filters: [],
                identifier: "DonutChart.db48fbe7b669d54d9a3c1935ff209839",
                properties: {
                    controls: {
                        legend: {
                            position: "left",
                        },
                    },
                },
                sorts: [],
                title: "DonutChart - legend position - single measure and viewBy - legend on left",
                uri: "DonutChart.db48fbe7b669d54d9a3c1935ff209839",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 1, 7),
    )();
LegendPositionSingleMeasureAndViewbyLegendOnLeft.parameters = {
    kind: "legend position - single measure and viewBy - legend on left",
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

export const LegendPositionSingleMeasureAndViewbyLegendOnRight = () =>
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
                ],
                filters: [],
                identifier: "DonutChart.630aff6ec1fcdb0c8630c65be293a31e",
                properties: {
                    controls: {
                        legend: {
                            position: "right",
                        },
                    },
                },
                sorts: [],
                title: "DonutChart - legend position - single measure and viewBy - legend on right",
                uri: "DonutChart.630aff6ec1fcdb0c8630c65be293a31e",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 1, 8),
    )();
LegendPositionSingleMeasureAndViewbyLegendOnRight.parameters = {
    kind: "legend position - single measure and viewBy - legend on right",
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

export const LegendPositionSingleMeasureAndViewbyLegendOnTop = () =>
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
                ],
                filters: [],
                identifier: "DonutChart.1479899f20a895c7b5f2d66f6b07131c",
                properties: {
                    controls: {
                        legend: {
                            position: "top",
                        },
                    },
                },
                sorts: [],
                title: "DonutChart - legend position - single measure and viewBy - legend on top",
                uri: "DonutChart.1479899f20a895c7b5f2d66f6b07131c",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 1, 9),
    )();
LegendPositionSingleMeasureAndViewbyLegendOnTop.parameters = {
    kind: "legend position - single measure and viewBy - legend on top",
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

export const LegendPositionSingleMeasureAndViewbyLegendAtBottom = () =>
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
                ],
                filters: [],
                identifier: "DonutChart.1cf883eaa22fdec8757fa3bd753529cf",
                properties: {
                    controls: {
                        legend: {
                            position: "bottom",
                        },
                    },
                },
                sorts: [],
                title: "DonutChart - legend position - single measure and viewBy - legend at bottom",
                uri: "DonutChart.1cf883eaa22fdec8757fa3bd753529cf",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 1, 10),
    )();
LegendPositionSingleMeasureAndViewbyLegendAtBottom.parameters = {
    kind: "legend position - single measure and viewBy - legend at bottom",
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

export const LegendPositionSingleMeasureAndViewbyDisabled = () =>
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
                ],
                filters: [],
                identifier: "DonutChart.00a15865c54d1c42c7fd63cf140e0e7a",
                properties: {
                    controls: {
                        legend: {
                            enabled: false,
                        },
                    },
                },
                sorts: [],
                title: "DonutChart - legend position - single measure and viewBy - disabled",
                uri: "DonutChart.00a15865c54d1c42c7fd63cf140e0e7a",
                visualizationUrl: "local:donut",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(7, 1, 11),
    )();
LegendPositionSingleMeasureAndViewbyDisabled.parameters = {
    kind: "legend position - single measure and viewBy - disabled",
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
