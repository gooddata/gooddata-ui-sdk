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
    title: "04 Stories For Pluggable Vis/WaterfallChart/base",
};

export const SingleMeasure = () =>
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
                        items: [],
                        localIdentifier: "view",
                    },
                ],
                filters: [],
                identifier: "WaterfallChart.917b7a14a68849c9f98511b705dcdfd1",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "WaterfallChart - single measure",
                uri: "WaterfallChart.917b7a14a68849c9f98511b705dcdfd1",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 0, 0),
    )();
SingleMeasure.parameters = {
    kind: "single measure",
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

export const SingleMeasureWithViewby = () =>
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
                identifier: "WaterfallChart.2a797bfd967c0ddf55985ff0123392e5",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "WaterfallChart - single measure with viewBy",
                uri: "WaterfallChart.2a797bfd967c0ddf55985ff0123392e5",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 0, 1),
    )();
SingleMeasureWithViewby.parameters = {
    kind: "single measure with viewBy",
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

export const MultiMeasures = () =>
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
                identifier: "WaterfallChart.c33d1b9464b049310aebe038257c2b04",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "WaterfallChart - multi measures",
                uri: "WaterfallChart.c33d1b9464b049310aebe038257c2b04",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 0, 2),
    )();
MultiMeasures.parameters = {
    kind: "multi measures",
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

export const MultiMeasuresWithATotalMeasure = () =>
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
                identifier: "WaterfallChart.c08e3835b21aa55adfa17f2c4fa49ed4",
                properties: {
                    controls: {
                        total: {
                            measures: ["m_f_density_sum"],
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - multi measures with a total measure",
                uri: "WaterfallChart.c08e3835b21aa55adfa17f2c4fa49ed4",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 0, 3),
    )();
MultiMeasuresWithATotalMeasure.parameters = {
    kind: "multi measures with a total measure",
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
