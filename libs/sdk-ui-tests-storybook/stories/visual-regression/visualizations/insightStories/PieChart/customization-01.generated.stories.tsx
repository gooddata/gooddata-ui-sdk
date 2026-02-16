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
    title: "04 Stories For Pluggable Vis/PieChart/customization",
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
                identifier: "PieChart.56f1b87f784b2408d2b3b0cfea0c2974",
                properties: {
                    controls: {
                        legend: {
                            position: "auto",
                        },
                    },
                },
                sorts: [],
                title: "PieChart - legend position - two measures - auto legend",
                uri: "PieChart.56f1b87f784b2408d2b3b0cfea0c2974",
                visualizationUrl: "local:pie",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(13, 1, 0),
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
                identifier: "PieChart.63c6caa5ec48a312e9f154497271ac88",
                properties: {
                    controls: {
                        legend: {
                            position: "left",
                        },
                    },
                },
                sorts: [],
                title: "PieChart - legend position - two measures - legend on left",
                uri: "PieChart.63c6caa5ec48a312e9f154497271ac88",
                visualizationUrl: "local:pie",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(13, 1, 1),
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
                identifier: "PieChart.3da5d268d303a3efb55d1a8fb7921820",
                properties: {
                    controls: {
                        legend: {
                            position: "right",
                        },
                    },
                },
                sorts: [],
                title: "PieChart - legend position - two measures - legend on right",
                uri: "PieChart.3da5d268d303a3efb55d1a8fb7921820",
                visualizationUrl: "local:pie",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(13, 1, 2),
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
                identifier: "PieChart.e794d80acb72830f67ad6bf93f0c57e5",
                properties: {
                    controls: {
                        legend: {
                            position: "top",
                        },
                    },
                },
                sorts: [],
                title: "PieChart - legend position - two measures - legend on top",
                uri: "PieChart.e794d80acb72830f67ad6bf93f0c57e5",
                visualizationUrl: "local:pie",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(13, 1, 3),
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
                identifier: "PieChart.acc5453d369d45484be24e1e4d2304bc",
                properties: {
                    controls: {
                        legend: {
                            position: "bottom",
                        },
                    },
                },
                sorts: [],
                title: "PieChart - legend position - two measures - legend at bottom",
                uri: "PieChart.acc5453d369d45484be24e1e4d2304bc",
                visualizationUrl: "local:pie",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(13, 1, 4),
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
                identifier: "PieChart.6d5b1a9ea3c8220947f5bd68ca8038cf",
                properties: {
                    controls: {
                        legend: {
                            enabled: false,
                        },
                    },
                },
                sorts: [],
                title: "PieChart - legend position - two measures - disabled",
                uri: "PieChart.6d5b1a9ea3c8220947f5bd68ca8038cf",
                visualizationUrl: "local:pie",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(13, 1, 5),
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
                identifier: "PieChart.e76711dec7f0c103632dc74aa3e5e2c0",
                properties: {
                    controls: {
                        legend: {
                            position: "auto",
                        },
                    },
                },
                sorts: [],
                title: "PieChart - legend position - single measure and viewBy - auto legend",
                uri: "PieChart.e76711dec7f0c103632dc74aa3e5e2c0",
                visualizationUrl: "local:pie",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(13, 1, 6),
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
                identifier: "PieChart.29cb934cc2d64679623859facf49cdca",
                properties: {
                    controls: {
                        legend: {
                            position: "left",
                        },
                    },
                },
                sorts: [],
                title: "PieChart - legend position - single measure and viewBy - legend on left",
                uri: "PieChart.29cb934cc2d64679623859facf49cdca",
                visualizationUrl: "local:pie",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(13, 1, 7),
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
                identifier: "PieChart.c98766a8341c11485fc0a7d8774acb46",
                properties: {
                    controls: {
                        legend: {
                            position: "right",
                        },
                    },
                },
                sorts: [],
                title: "PieChart - legend position - single measure and viewBy - legend on right",
                uri: "PieChart.c98766a8341c11485fc0a7d8774acb46",
                visualizationUrl: "local:pie",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(13, 1, 8),
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
                identifier: "PieChart.aeb98117a8f35a2ac36c9d271e769f4a",
                properties: {
                    controls: {
                        legend: {
                            position: "top",
                        },
                    },
                },
                sorts: [],
                title: "PieChart - legend position - single measure and viewBy - legend on top",
                uri: "PieChart.aeb98117a8f35a2ac36c9d271e769f4a",
                visualizationUrl: "local:pie",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(13, 1, 9),
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
                identifier: "PieChart.020d8df3a62b27299a0c5acad12f4fd1",
                properties: {
                    controls: {
                        legend: {
                            position: "bottom",
                        },
                    },
                },
                sorts: [],
                title: "PieChart - legend position - single measure and viewBy - legend at bottom",
                uri: "PieChart.020d8df3a62b27299a0c5acad12f4fd1",
                visualizationUrl: "local:pie",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(13, 1, 10),
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
                identifier: "PieChart.33a7aaf1d1725ef2852054d595cc4dd3",
                properties: {
                    controls: {
                        legend: {
                            enabled: false,
                        },
                    },
                },
                sorts: [],
                title: "PieChart - legend position - single measure and viewBy - disabled",
                uri: "PieChart.33a7aaf1d1725ef2852054d595cc4dd3",
                visualizationUrl: "local:pie",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(13, 1, 11),
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
