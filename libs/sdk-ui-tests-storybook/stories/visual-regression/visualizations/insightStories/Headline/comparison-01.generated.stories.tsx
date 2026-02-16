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
    title: "04 Stories For Pluggable Vis/Headline/comparison",
};

export const ComparisonWithDefaultConfig = () =>
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
                        items: [],
                        localIdentifier: "comparison_virtual_arithmetic_bucket",
                    },
                ],
                filters: [],
                identifier: "Headline.07812c19181ddb13069cad9383766cde",
                properties: {
                    controls: {
                        comparison: {
                            enabled: true,
                        },
                    },
                },
                sorts: [],
                title: "Headline - comparison with default config",
                uri: "Headline.07812c19181ddb13069cad9383766cde",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 0),
    )();
ComparisonWithDefaultConfig.parameters = {
    kind: "comparison with default config",
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
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithDefaultConfigWithSecondaryMeasureIsPop = () =>
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
                                measure: {
                                    alias: "Won Last Year",
                                    definition: {
                                        popMeasureDefinition: {
                                            measureIdentifier: "m_e519fa2a_86c3_4e32_8313_0c03062348j3",
                                            popAttribute: {
                                                identifier: "dt_closedate_timestamp.year",
                                                type: "attribute",
                                            },
                                        },
                                    },
                                    localIdentifier:
                                        "m_e40a8329_m_e519fa2a_86c3_4e32_8313_0c03062348j3_dt_closedate_timestamp.year",
                                },
                            },
                        ],
                        localIdentifier: "secondary_measures",
                    },
                    {
                        items: [],
                        localIdentifier: "comparison_virtual_arithmetic_bucket",
                    },
                ],
                filters: [],
                identifier: "Headline.277492aa430856258a8794b54cfbc491",
                properties: {
                    controls: {
                        comparison: {
                            enabled: true,
                        },
                    },
                },
                sorts: [],
                title: "Headline - comparison with default config with secondary measure is PoP",
                uri: "Headline.277492aa430856258a8794b54cfbc491",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 1),
    )();
ComparisonWithDefaultConfigWithSecondaryMeasureIsPop.parameters = {
    kind: "comparison with default config with secondary measure is PoP",
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
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithCalculateAsDifferentAndDefaultFormat = () =>
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
                        items: [],
                        localIdentifier: "comparison_virtual_arithmetic_bucket",
                    },
                ],
                filters: [],
                identifier: "Headline.6785d8782cd6d73e898229a9288ed030",
                properties: {
                    controls: {
                        comparison: {
                            calculationType: "difference",
                            enabled: true,
                        },
                    },
                },
                sorts: [],
                title: "Headline - comparison with calculate as different and default format",
                uri: "Headline.6785d8782cd6d73e898229a9288ed030",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 2),
    )();
ComparisonWithCalculateAsDifferentAndDefaultFormat.parameters = {
    kind: "comparison with calculate as different and default format",
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
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithCalculateAsChangeDifferenceAndDefaultSubFormat = () =>
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
                        items: [],
                        localIdentifier: "comparison_virtual_arithmetic_bucket",
                    },
                ],
                filters: [],
                identifier: "Headline.46b65c0a984c50faa7af9759267296d5",
                properties: {
                    controls: {
                        comparison: {
                            calculationType: "change_difference",
                            enabled: true,
                        },
                    },
                },
                sorts: [],
                title: "Headline - comparison with calculate as change (difference) and default sub format",
                uri: "Headline.46b65c0a984c50faa7af9759267296d5",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 3),
    )();
ComparisonWithCalculateAsChangeDifferenceAndDefaultSubFormat.parameters = {
    kind: "comparison with calculate as change (difference) and default sub format",
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
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithCalculateAsChangeDifferenceAndCustomFormat = () =>
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
                        items: [],
                        localIdentifier: "comparison_virtual_arithmetic_bucket",
                    },
                ],
                filters: [],
                identifier: "Headline.2684d22379d29955bdda6db62e97468c",
                properties: {
                    controls: {
                        comparison: {
                            calculationType: "change_difference",
                            colorConfig: {
                                disabled: true,
                            },
                            enabled: true,
                            format: "[color=d2ccde]#,##0.0",
                            subFormat: "[color=9c46b5]#,##0.00",
                        },
                    },
                },
                sorts: [],
                title: "Headline - comparison with calculate as change (difference) and custom format",
                uri: "Headline.2684d22379d29955bdda6db62e97468c",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 4),
    )();
ComparisonWithCalculateAsChangeDifferenceAndCustomFormat.parameters = {
    kind: "comparison with calculate as change (difference) and custom format",
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
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithDecimal1Format = () =>
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
                        items: [],
                        localIdentifier: "comparison_virtual_arithmetic_bucket",
                    },
                ],
                filters: [],
                identifier: "Headline.7435cc39b3c420f1520203588890c3fa",
                properties: {
                    controls: {
                        comparison: {
                            enabled: true,
                            format: "#,##0.0",
                        },
                    },
                },
                sorts: [],
                title: "Headline - comparison with decimal-1 format",
                uri: "Headline.7435cc39b3c420f1520203588890c3fa",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 5),
    )();
ComparisonWithDecimal1Format.parameters = {
    kind: "comparison with decimal-1 format",
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
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithCustomFormat = () =>
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
                        items: [],
                        localIdentifier: "comparison_virtual_arithmetic_bucket",
                    },
                ],
                filters: [],
                identifier: "Headline.516de9bcf869125bfe4ce739c07ac3c7",
                properties: {
                    controls: {
                        comparison: {
                            enabled: true,
                            format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                        },
                    },
                },
                sorts: [],
                title: "Headline - comparison with custom format",
                uri: "Headline.516de9bcf869125bfe4ce739c07ac3c7",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 6),
    )();
ComparisonWithCustomFormat.parameters = {
    kind: "comparison with custom format",
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
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithPositiveArrow = () =>
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
                        items: [],
                        localIdentifier: "comparison_virtual_arithmetic_bucket",
                    },
                ],
                filters: [],
                identifier: "Headline.8de0c6fec8eff0092724e85a0ff49cce",
                properties: {
                    controls: {
                        comparison: {
                            enabled: true,
                            format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                            isArrowEnabled: true,
                        },
                    },
                },
                sorts: [],
                title: "Headline - comparison with positive arrow",
                uri: "Headline.8de0c6fec8eff0092724e85a0ff49cce",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 7),
    )();
ComparisonWithPositiveArrow.parameters = {
    kind: "comparison with positive arrow",
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
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithPositiveArrowAndColor = () =>
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
                        items: [],
                        localIdentifier: "comparison_virtual_arithmetic_bucket",
                    },
                ],
                filters: [],
                identifier: "Headline.d8d4d65095b13543eddc9a64b10e308f",
                properties: {
                    controls: {
                        comparison: {
                            colorConfig: {
                                equals: {
                                    type: "guid",
                                    value: "any-value",
                                },
                                negative: {
                                    type: "guid",
                                    value: "positive",
                                },
                                positive: {
                                    type: "rgb",
                                    value: {
                                        b: 191,
                                        g: 64,
                                        r: 191,
                                    },
                                },
                            },
                            enabled: true,
                            format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                            isArrowEnabled: true,
                        },
                    },
                },
                sorts: [],
                title: "Headline - comparison with positive arrow and color",
                uri: "Headline.d8d4d65095b13543eddc9a64b10e308f",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 8),
    )();
ComparisonWithPositiveArrowAndColor.parameters = {
    kind: "comparison with positive arrow and color",
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
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithNegativeArrow = () =>
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
                        localIdentifier: "secondary_measures",
                    },
                    {
                        items: [],
                        localIdentifier: "comparison_virtual_arithmetic_bucket",
                    },
                ],
                filters: [],
                identifier: "Headline.0ae91ea68160e9bcfd8fb88354a0aeca",
                properties: {
                    controls: {
                        comparison: {
                            colorConfig: {
                                disabled: true,
                                equals: {
                                    type: "guid",
                                    value: "any-value",
                                },
                                negative: {
                                    type: "guid",
                                    value: "positive",
                                },
                                positive: {
                                    type: "rgb",
                                    value: {
                                        b: 191,
                                        g: 64,
                                        r: 191,
                                    },
                                },
                            },
                            enabled: true,
                            format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                            isArrowEnabled: true,
                        },
                    },
                },
                sorts: [],
                title: "Headline - comparison with negative arrow",
                uri: "Headline.0ae91ea68160e9bcfd8fb88354a0aeca",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 9),
    )();
ComparisonWithNegativeArrow.parameters = {
    kind: "comparison with negative arrow",
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
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithNegativeArrowAndColor = () =>
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
                        localIdentifier: "secondary_measures",
                    },
                    {
                        items: [],
                        localIdentifier: "comparison_virtual_arithmetic_bucket",
                    },
                ],
                filters: [],
                identifier: "Headline.f8596cd01e9bd7fcb1478441a026ab35",
                properties: {
                    controls: {
                        comparison: {
                            colorConfig: {
                                equals: {
                                    type: "guid",
                                    value: "any-value",
                                },
                                negative: {
                                    type: "guid",
                                    value: "positive",
                                },
                                positive: {
                                    type: "rgb",
                                    value: {
                                        b: 191,
                                        g: 64,
                                        r: 191,
                                    },
                                },
                            },
                            enabled: true,
                            format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                            isArrowEnabled: true,
                        },
                    },
                },
                sorts: [],
                title: "Headline - comparison with negative arrow and color",
                uri: "Headline.f8596cd01e9bd7fcb1478441a026ab35",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 10),
    )();
ComparisonWithNegativeArrowAndColor.parameters = {
    kind: "comparison with negative arrow and color",
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
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithEqualsArrow = () =>
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
                                    alias: "Custom Amount",
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "87a053b0-3947-49f3-b0c5-de53fd01f050",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "custom_amount_local_id",
                                },
                            },
                        ],
                        localIdentifier: "secondary_measures",
                    },
                    {
                        items: [],
                        localIdentifier: "comparison_virtual_arithmetic_bucket",
                    },
                ],
                filters: [],
                identifier: "Headline.9e2b08d3f47d4630064417c2f1b42ba4",
                properties: {
                    controls: {
                        comparison: {
                            colorConfig: {
                                disabled: true,
                                equals: {
                                    type: "guid",
                                    value: "any-value",
                                },
                                negative: {
                                    type: "guid",
                                    value: "positive",
                                },
                                positive: {
                                    type: "rgb",
                                    value: {
                                        b: 191,
                                        g: 64,
                                        r: 191,
                                    },
                                },
                            },
                            enabled: true,
                            format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                            isArrowEnabled: true,
                        },
                    },
                },
                sorts: [],
                title: "Headline - comparison with equals arrow",
                uri: "Headline.9e2b08d3f47d4630064417c2f1b42ba4",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 11),
    )();
ComparisonWithEqualsArrow.parameters = {
    kind: "comparison with equals arrow",
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
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithEqualsArrowAndColor = () =>
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
                                    alias: "Custom Amount",
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "87a053b0-3947-49f3-b0c5-de53fd01f050",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "custom_amount_local_id",
                                },
                            },
                        ],
                        localIdentifier: "secondary_measures",
                    },
                    {
                        items: [],
                        localIdentifier: "comparison_virtual_arithmetic_bucket",
                    },
                ],
                filters: [],
                identifier: "Headline.d2169e777f119e456a82b116cc17693c",
                properties: {
                    controls: {
                        comparison: {
                            colorConfig: {
                                equals: {
                                    type: "guid",
                                    value: "any-value",
                                },
                                negative: {
                                    type: "guid",
                                    value: "positive",
                                },
                                positive: {
                                    type: "rgb",
                                    value: {
                                        b: 191,
                                        g: 64,
                                        r: 191,
                                    },
                                },
                            },
                            enabled: true,
                            format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                            isArrowEnabled: true,
                        },
                    },
                },
                sorts: [],
                title: "Headline - comparison with equals arrow and color",
                uri: "Headline.d2169e777f119e456a82b116cc17693c",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 12),
    )();
ComparisonWithEqualsArrowAndColor.parameters = {
    kind: "comparison with equals arrow and color",
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
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithCustomLabel = () =>
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
                        items: [],
                        localIdentifier: "comparison_virtual_arithmetic_bucket",
                    },
                ],
                filters: [],
                identifier: "Headline.dd278ab1110359f77ca456169542d74b",
                properties: {
                    controls: {
                        comparison: {
                            colorConfig: {
                                equals: {
                                    type: "guid",
                                    value: "any-value",
                                },
                                negative: {
                                    type: "guid",
                                    value: "positive",
                                },
                                positive: {
                                    type: "rgb",
                                    value: {
                                        b: 191,
                                        g: 64,
                                        r: 191,
                                    },
                                },
                            },
                            enabled: true,
                            format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                            isArrowEnabled: true,
                            labelConfig: {
                                unconditionalValue: "Custom label",
                            },
                        },
                    },
                },
                sorts: [],
                title: "Headline - comparison with custom label",
                uri: "Headline.dd278ab1110359f77ca456169542d74b",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 13),
    )();
ComparisonWithCustomLabel.parameters = {
    kind: "comparison with custom label",
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
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithPositionOnTop = () =>
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
                        items: [],
                        localIdentifier: "comparison_virtual_arithmetic_bucket",
                    },
                ],
                filters: [],
                identifier: "Headline.d12c12027dd0c6b31f0f21309d1b8947",
                properties: {
                    controls: {
                        comparison: {
                            enabled: true,
                            format: "$#,##0.00",
                            isArrowEnabled: true,
                            position: "top",
                        },
                    },
                },
                sorts: [],
                title: "Headline - comparison with position on top",
                uri: "Headline.d12c12027dd0c6b31f0f21309d1b8947",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 14),
    )();
ComparisonWithPositionOnTop.parameters = {
    kind: "comparison with position on top",
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
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;

export const ComparisonWithPositionOnRight = () =>
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
                        items: [],
                        localIdentifier: "comparison_virtual_arithmetic_bucket",
                    },
                ],
                filters: [],
                identifier: "Headline.8d42114ef836bf623dc40b51a45dab6e",
                properties: {
                    controls: {
                        comparison: {
                            enabled: true,
                            format: "$#,##0.00",
                            isArrowEnabled: true,
                            position: "right",
                        },
                    },
                },
                sorts: [],
                title: "Headline - comparison with position on right",
                uri: "Headline.8d42114ef836bf623dc40b51a45dab6e",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 15),
    )();
ComparisonWithPositionOnRight.parameters = {
    kind: "comparison with position on right",
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
        misMatchThreshold: 0.25,
    },
} satisfies IStoryParameters;
