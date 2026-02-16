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
    title: "04 Stories For Pluggable Vis/Xirr/base",
};

export const OnlyMeasure = () =>
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
                                                identifier: "sample_xirr",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_sample_xirr",
                                },
                            },
                        ],
                        localIdentifier: "measures",
                    },
                    {
                        items: [],
                        localIdentifier: "attribute",
                    },
                ],
                filters: [],
                identifier: "Xirr.74456ce90909b92d28a01949e02ac574",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "Xirr - only measure",
                uri: "Xirr.74456ce90909b92d28a01949e02ac574",
                visualizationUrl: "local:xirr",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(22, 0, 0),
    )();
OnlyMeasure.parameters = {
    kind: "only measure",
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

export const CorrectConfig = () =>
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
                                                identifier: "sample_xirr",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_sample_xirr",
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
                                        identifier: "dt_timeline_timestamp.year",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_timeline_timestamp.year",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                    },
                ],
                filters: [],
                identifier: "Xirr.2dd4cca9665e247c85d40e207b212db7",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "Xirr - correct config",
                uri: "Xirr.2dd4cca9665e247c85d40e207b212db7",
                visualizationUrl: "local:xirr",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(22, 0, 1),
    )();
CorrectConfig.parameters = {
    kind: "correct config",
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

export const SemanticallyWrongMeasure = () =>
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
                                                identifier: "6b1411d5-e253-418e-8fd3-137a9f56ea92",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_6b1411d5_e253_418e_8fd3_137a9f56ea92",
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
                                        identifier: "dt_timeline_timestamp.year",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_timeline_timestamp.year",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                    },
                ],
                filters: [],
                identifier: "Xirr.e5deb6dfe7ff06cdc5210a56fc84c841",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "Xirr - semantically wrong measure",
                uri: "Xirr.e5deb6dfe7ff06cdc5210a56fc84c841",
                visualizationUrl: "local:xirr",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(22, 0, 2),
    )();
SemanticallyWrongMeasure.parameters = {
    kind: "semantically wrong measure",
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
