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
    title: "04 Stories For Pluggable Vis/Headline/base",
};

export const MultiMeasuresWithOnlyPrimaryMeasure = () =>
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
                        items: [],
                        localIdentifier: "secondary_measures",
                    },
                ],
                filters: [],
                identifier: "Headline.25f8ead2829912864230dd6f4bcb9a1f",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "Headline - multi measures with only primary measure",
                uri: "Headline.25f8ead2829912864230dd6f4bcb9a1f",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 0, 0),
    )();
MultiMeasuresWithOnlyPrimaryMeasure.parameters = {
    kind: "multi measures with only primary measure",
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

export const MultiMeasuresWithTwoMeasures = () =>
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
                ],
                filters: [],
                identifier: "Headline.5f4222f180bcdbb5f90342ffef32bfb3",
                properties: {
                    controls: {
                        comparison: {
                            enabled: false,
                        },
                    },
                },
                sorts: [],
                title: "Headline - multi measures with two measures",
                uri: "Headline.5f4222f180bcdbb5f90342ffef32bfb3",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 0, 1),
    )();
MultiMeasuresWithTwoMeasures.parameters = {
    kind: "multi measures with two measures",
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

export const MultiMeasuresWithThreeMeasures = () =>
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
                                                identifier: "b4e3e3c7-ead3-4d69-8be4-23bcfe5ff7aa",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_b4e3e3c7_ead3_4d69_8be4_23bcfe5ff7aa",
                                },
                            },
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
                ],
                filters: [],
                identifier: "Headline.0c397a87524b15d4156d4902c93b32f8",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "Headline - multi measures with three measures",
                uri: "Headline.0c397a87524b15d4156d4902c93b32f8",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 0, 2),
    )();
MultiMeasuresWithThreeMeasures.parameters = {
    kind: "multi measures with three measures",
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

export const MultiMeasuresWithTwoMeasuresOnePop = () =>
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
                ],
                filters: [],
                identifier: "Headline.b97b4ab7af6223fd9aa8e57ec7192c1c",
                properties: {
                    controls: {
                        comparison: {
                            enabled: false,
                        },
                    },
                },
                sorts: [],
                title: "Headline - multi measures with two measures one PoP",
                uri: "Headline.b97b4ab7af6223fd9aa8e57ec7192c1c",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 0, 3),
    )();
MultiMeasuresWithTwoMeasuresOnePop.parameters = {
    kind: "multi measures with two measures one PoP",
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

export const MultiMeasuresWithTwoMeasuresWithGermanSeparators = () =>
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
                ],
                filters: [],
                identifier: "Headline.ec44537832680c571aee801b49a8d829",
                properties: {
                    controls: {
                        comparison: {
                            enabled: false,
                        },
                    },
                },
                sorts: [],
                title: "Headline - multi measures with two measures with german separators",
                uri: "Headline.ec44537832680c571aee801b49a8d829",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 0, 4),
    )();
MultiMeasuresWithTwoMeasuresWithGermanSeparators.parameters = {
    kind: "multi measures with two measures with german separators",
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

export const TwoMeasuresWithComparison = () =>
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
                identifier: "Headline.1751ae10589de44b7a6a686b5290ef8d",
                properties: {
                    controls: {
                        comparison: {
                            enabled: true,
                        },
                    },
                },
                sorts: [],
                title: "Headline - two measures with comparison",
                uri: "Headline.1751ae10589de44b7a6a686b5290ef8d",
                visualizationUrl: "local:headline",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 0, 5),
    )();
TwoMeasuresWithComparison.parameters = {
    kind: "two measures with comparison",
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
