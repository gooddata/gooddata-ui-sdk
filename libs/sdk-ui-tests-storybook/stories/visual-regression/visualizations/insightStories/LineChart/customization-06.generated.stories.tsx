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
    title: "04 Stories For Pluggable Vis/LineChart/customization",
};

export const StackedThresholdZones = () =>
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
                                                identifier: "timeline_bop",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_timeline_bop",
                                },
                            },
                            {
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "metric_has_null_value",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_metric_has_null_value",
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
                                        identifier: "dt_closedate_timestamp.day",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_closedate_timestamp.day",
                                },
                            },
                        ],
                        localIdentifier: "trend",
                    },
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "dt_closedate_timestamp.month",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_closedate_timestamp.month",
                                },
                            },
                        ],
                        localIdentifier: "segment",
                    },
                ],
                filters: [
                    {
                        absoluteDateFilter: {
                            dataSet: {
                                identifier: "dt_closedate_timestamp",
                                type: "dataSet",
                            },
                            from: "2013-04-17",
                            to: "2013-05-31",
                        },
                    },
                ],
                identifier: "LineChart.f24dfe2eeb31cbd9c41e5a2d65afd020",
                properties: {
                    controls: {
                        thresholdMeasures: ["m_metric_has_null_value"],
                    },
                },
                sorts: [],
                title: "LineChart - stacked threshold zones",
                uri: "LineChart.f24dfe2eeb31cbd9c41e5a2d65afd020",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 6, 0),
    )();
StackedThresholdZones.parameters = {
    kind: "stacked threshold zones",
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
