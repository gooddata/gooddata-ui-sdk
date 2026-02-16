// (C) 2026 GoodData Corporation

import { type IInsight } from "@gooddata/sdk-model";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/dropdown_icons.css";

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    getScenariosGroupByIndexes,
    plugVizStory,
} from "../../../../../../stories/visual-regression/visualizations/insightStories.js";
import "../../../../../..//stories/visual-regression/visualizations/insightStories.css";

export default {
    title: "04 Stories For Pluggable Vis/Xirr/customization/theme",
};

export const Themed = () =>
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
                identifier: "Xirr.feb8ea5ece361cf1c5681654f085f9a5",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "Xirr - themed",
                uri: "Xirr.feb8ea5ece361cf1c5681654f085f9a5",
                visualizationUrl: "local:xirr",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(22, 1, 0),
    )();
Themed.parameters = {
    kind: "themed",
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

export const Font = () =>
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
                identifier: "Xirr.f2812be4e4636cfdf0d8dda028b56bc3",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "Xirr - font",
                uri: "Xirr.f2812be4e4636cfdf0d8dda028b56bc3",
                visualizationUrl: "local:xirr",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(22, 1, 1),
    )();
Font.parameters = {
    kind: "font",
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
