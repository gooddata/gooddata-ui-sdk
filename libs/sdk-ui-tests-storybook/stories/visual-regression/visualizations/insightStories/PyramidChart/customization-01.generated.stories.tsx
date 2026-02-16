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
    title: "04 Stories For Pluggable Vis/PyramidChart/customization",
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
                identifier: "PyramidChart.e5f6d78d6556117a01c003a6a355b934",
                properties: {
                    controls: {
                        legend: {
                            position: "auto",
                        },
                    },
                },
                sorts: [],
                title: "PyramidChart - legend position - two measures - auto legend",
                uri: "PyramidChart.e5f6d78d6556117a01c003a6a355b934",
                visualizationUrl: "local:pyramid",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(16, 1, 0),
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
                identifier: "PyramidChart.effb3b549e4538ec21c7b27ed0f13eaa",
                properties: {
                    controls: {
                        legend: {
                            position: "left",
                        },
                    },
                },
                sorts: [],
                title: "PyramidChart - legend position - two measures - legend on left",
                uri: "PyramidChart.effb3b549e4538ec21c7b27ed0f13eaa",
                visualizationUrl: "local:pyramid",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(16, 1, 1),
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
                identifier: "PyramidChart.566ed9204ec9005fbd39aea3c0a84b0d",
                properties: {
                    controls: {
                        legend: {
                            position: "right",
                        },
                    },
                },
                sorts: [],
                title: "PyramidChart - legend position - two measures - legend on right",
                uri: "PyramidChart.566ed9204ec9005fbd39aea3c0a84b0d",
                visualizationUrl: "local:pyramid",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(16, 1, 2),
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
                identifier: "PyramidChart.62503683a356a2acc11e08e90ecfa889",
                properties: {
                    controls: {
                        legend: {
                            position: "top",
                        },
                    },
                },
                sorts: [],
                title: "PyramidChart - legend position - two measures - legend on top",
                uri: "PyramidChart.62503683a356a2acc11e08e90ecfa889",
                visualizationUrl: "local:pyramid",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(16, 1, 3),
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
                identifier: "PyramidChart.8e1eaa94919d52c2c84eaa57e1ef27ad",
                properties: {
                    controls: {
                        legend: {
                            position: "bottom",
                        },
                    },
                },
                sorts: [],
                title: "PyramidChart - legend position - two measures - legend at bottom",
                uri: "PyramidChart.8e1eaa94919d52c2c84eaa57e1ef27ad",
                visualizationUrl: "local:pyramid",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(16, 1, 4),
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
                identifier: "PyramidChart.3bf3c2cd04b0971f2ca3538ce6cdaed8",
                properties: {
                    controls: {
                        legend: {
                            enabled: false,
                        },
                    },
                },
                sorts: [],
                title: "PyramidChart - legend position - two measures - disabled",
                uri: "PyramidChart.3bf3c2cd04b0971f2ca3538ce6cdaed8",
                visualizationUrl: "local:pyramid",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(16, 1, 5),
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
                identifier: "PyramidChart.ec415270e8908a9f693de2acbd9b9fab",
                properties: {
                    controls: {
                        legend: {
                            position: "auto",
                        },
                    },
                },
                sorts: [],
                title: "PyramidChart - legend position - single measure and viewBy - auto legend",
                uri: "PyramidChart.ec415270e8908a9f693de2acbd9b9fab",
                visualizationUrl: "local:pyramid",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(16, 1, 6),
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
                identifier: "PyramidChart.a4751a74b33ad8a23313bb9d7464dd73",
                properties: {
                    controls: {
                        legend: {
                            position: "left",
                        },
                    },
                },
                sorts: [],
                title: "PyramidChart - legend position - single measure and viewBy - legend on left",
                uri: "PyramidChart.a4751a74b33ad8a23313bb9d7464dd73",
                visualizationUrl: "local:pyramid",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(16, 1, 7),
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
                identifier: "PyramidChart.732ccaf4e76f3f5f81ea8f688a0f876f",
                properties: {
                    controls: {
                        legend: {
                            position: "right",
                        },
                    },
                },
                sorts: [],
                title: "PyramidChart - legend position - single measure and viewBy - legend on right",
                uri: "PyramidChart.732ccaf4e76f3f5f81ea8f688a0f876f",
                visualizationUrl: "local:pyramid",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(16, 1, 8),
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
                identifier: "PyramidChart.c5307bc92b1bc74a939ebf120ac1b23e",
                properties: {
                    controls: {
                        legend: {
                            position: "top",
                        },
                    },
                },
                sorts: [],
                title: "PyramidChart - legend position - single measure and viewBy - legend on top",
                uri: "PyramidChart.c5307bc92b1bc74a939ebf120ac1b23e",
                visualizationUrl: "local:pyramid",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(16, 1, 9),
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
                identifier: "PyramidChart.6de6e6a15eb3ad4acd639b3f90ba5ab0",
                properties: {
                    controls: {
                        legend: {
                            position: "bottom",
                        },
                    },
                },
                sorts: [],
                title: "PyramidChart - legend position - single measure and viewBy - legend at bottom",
                uri: "PyramidChart.6de6e6a15eb3ad4acd639b3f90ba5ab0",
                visualizationUrl: "local:pyramid",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(16, 1, 10),
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
                identifier: "PyramidChart.e5a58f338d3e8b98c735210061d03643",
                properties: {
                    controls: {
                        legend: {
                            enabled: false,
                        },
                    },
                },
                sorts: [],
                title: "PyramidChart - legend position - single measure and viewBy - disabled",
                uri: "PyramidChart.e5a58f338d3e8b98c735210061d03643",
                visualizationUrl: "local:pyramid",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(16, 1, 11),
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
