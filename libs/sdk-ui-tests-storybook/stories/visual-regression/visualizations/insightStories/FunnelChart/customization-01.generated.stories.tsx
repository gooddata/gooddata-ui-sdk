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
    title: "04 Stories For Pluggable Vis/FunnelChart/customization",
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
                identifier: "FunnelChart.883492d88fb6f94a3b60295e36fa2c1b",
                properties: {
                    controls: {
                        legend: {
                            position: "auto",
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - legend position - two measures - auto legend",
                uri: "FunnelChart.883492d88fb6f94a3b60295e36fa2c1b",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 1, 0),
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
                identifier: "FunnelChart.6acca095f48c503a2bd8d1e8ee887346",
                properties: {
                    controls: {
                        legend: {
                            position: "left",
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - legend position - two measures - legend on left",
                uri: "FunnelChart.6acca095f48c503a2bd8d1e8ee887346",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 1, 1),
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
                identifier: "FunnelChart.b009bfade0e4ab9505bed65a0e331f41",
                properties: {
                    controls: {
                        legend: {
                            position: "right",
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - legend position - two measures - legend on right",
                uri: "FunnelChart.b009bfade0e4ab9505bed65a0e331f41",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 1, 2),
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
                identifier: "FunnelChart.b7f528cbb6fe987ffaa1de305f87300a",
                properties: {
                    controls: {
                        legend: {
                            position: "top",
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - legend position - two measures - legend on top",
                uri: "FunnelChart.b7f528cbb6fe987ffaa1de305f87300a",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 1, 3),
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
                identifier: "FunnelChart.caf26194d886f7ce32396d85b8f78dc4",
                properties: {
                    controls: {
                        legend: {
                            position: "bottom",
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - legend position - two measures - legend at bottom",
                uri: "FunnelChart.caf26194d886f7ce32396d85b8f78dc4",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 1, 4),
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
                identifier: "FunnelChart.6aa93bf70312bfa425c1606621692be0",
                properties: {
                    controls: {
                        legend: {
                            enabled: false,
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - legend position - two measures - disabled",
                uri: "FunnelChart.6aa93bf70312bfa425c1606621692be0",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 1, 5),
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
                identifier: "FunnelChart.f7181c58469d3fb723e62e92d315e8cf",
                properties: {
                    controls: {
                        legend: {
                            position: "auto",
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - legend position - single measure and viewBy - auto legend",
                uri: "FunnelChart.f7181c58469d3fb723e62e92d315e8cf",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 1, 6),
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
                identifier: "FunnelChart.85524049b2ea9ae7ff110cec2c71c5b6",
                properties: {
                    controls: {
                        legend: {
                            position: "left",
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - legend position - single measure and viewBy - legend on left",
                uri: "FunnelChart.85524049b2ea9ae7ff110cec2c71c5b6",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 1, 7),
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
                identifier: "FunnelChart.75054dab6f7946a2b38b33a27c09fbbc",
                properties: {
                    controls: {
                        legend: {
                            position: "right",
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - legend position - single measure and viewBy - legend on right",
                uri: "FunnelChart.75054dab6f7946a2b38b33a27c09fbbc",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 1, 8),
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
                identifier: "FunnelChart.06147c87d19b9e491aa511d59f6e270b",
                properties: {
                    controls: {
                        legend: {
                            position: "top",
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - legend position - single measure and viewBy - legend on top",
                uri: "FunnelChart.06147c87d19b9e491aa511d59f6e270b",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 1, 9),
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
                identifier: "FunnelChart.8cd9977761d23561288726b04105491b",
                properties: {
                    controls: {
                        legend: {
                            position: "bottom",
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - legend position - single measure and viewBy - legend at bottom",
                uri: "FunnelChart.8cd9977761d23561288726b04105491b",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 1, 10),
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
                identifier: "FunnelChart.0686f741b2c997bccf40567b5c98b042",
                properties: {
                    controls: {
                        legend: {
                            enabled: false,
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - legend position - single measure and viewBy - disabled",
                uri: "FunnelChart.0686f741b2c997bccf40567b5c98b042",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 1, 11),
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
