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
    title: "04 Stories For Pluggable Vis/WaterfallChart/customization/color",
};

export const AssignColorToMeasures = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Sum Velocity",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_stagehistory.f_velocity",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_stagehistory.f_velocity_sum",
                                },
                            },
                            {
                                measure: {
                                    alias: "Sum Duration",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_stagehistory.f_duration",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_stagehistory.f_duration_sum",
                                },
                            },
                            {
                                measure: {
                                    alias: "Sum Density",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_density",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    format: "$#,##0",
                                    localIdentifier: "m_f_density_sum",
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
                identifier: "WaterfallChart.f3366b5284c61c116fcb952189f18d64",
                properties: {
                    controls: {
                        colorMapping: [
                            {
                                color: {
                                    type: "rgb",
                                    value: {
                                        b: 0,
                                        g: 0,
                                        r: 0,
                                    },
                                },
                            },
                            {
                                color: {
                                    type: "rgb",
                                    value: {
                                        b: 0,
                                        g: 0,
                                        r: 255,
                                    },
                                },
                            },
                            {
                                color: {
                                    type: "guid",
                                    value: "05",
                                },
                            },
                        ],
                        total: {
                            enabled: true,
                            name: "Total",
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - assign color to measures",
                uri: "WaterfallChart.f3366b5284c61c116fcb952189f18d64",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 6, 0),
    )();
AssignColorToMeasures.parameters = {
    kind: "assign color to measures",
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
