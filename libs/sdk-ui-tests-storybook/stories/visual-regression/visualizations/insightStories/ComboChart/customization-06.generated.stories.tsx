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
    title: "04 Stories For Pluggable Vis/ComboChart/customization",
};

export const ThresholdComboZonesWithExcludedMeasures = () =>
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
                                                identifier: "snapshot_bop",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_snapshot_bop",
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
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "c5ee7836-126c-41aa-bd69-1873d379a065",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_c5ee7836_126c_41aa_bd69_1873d379a065",
                                },
                            },
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
                        ],
                        localIdentifier: "secondary_measures",
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
                        localIdentifier: "view",
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
                identifier: "ComboChart.4484a5256290fb780fa7a4be90bd5042",
                properties: {
                    controls: {
                        thresholdExcludedMeasures: ["m_snapshot_bop", "m_timeline_bop"],
                        thresholdMeasures: ["m_metric_has_null_value"],
                    },
                },
                sorts: [],
                title: "ComboChart - threshold combo zones with excluded measures",
                uri: "ComboChart.4484a5256290fb780fa7a4be90bd5042",
                visualizationUrl: "local:combo2",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(5, 6, 0),
    )();
ThresholdComboZonesWithExcludedMeasures.parameters = {
    kind: "threshold combo zones with excluded measures",
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
