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
    title: "04 Stories For Pluggable Vis/WaterfallChart/customization",
};

export const DefaultState = () =>
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
                identifier: "WaterfallChart.ccd75bba89907df176f81dd2f61193d8",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "WaterfallChart - default state",
                uri: "WaterfallChart.ccd75bba89907df176f81dd2f61193d8",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 4, 0),
    )();
DefaultState.parameters = {
    kind: "default state",
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

export const ChangeTheOrientationConfiguration = () =>
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
                identifier: "WaterfallChart.d26e1b3c1ac8728969b9444f69aba82a",
                properties: {
                    controls: {
                        orientation: {
                            position: "vertical",
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - change the orientation configuration",
                uri: "WaterfallChart.d26e1b3c1ac8728969b9444f69aba82a",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 4, 1),
    )();
ChangeTheOrientationConfiguration.parameters = {
    kind: "change the orientation configuration",
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

export const VerticalOrientationWithCustomAxesConfiguration = () =>
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
                identifier: "WaterfallChart.c9b7a5abbc8764d68fe4f599535af117",
                properties: {
                    controls: {
                        orientation: {
                            position: "vertical",
                        },
                        xaxis: {
                            max: "130000000",
                            min: "0",
                            name: {
                                position: "right",
                            },
                        },
                        yaxis: {
                            name: {
                                position: "bottom",
                            },
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - vertical orientation with custom axes configuration",
                uri: "WaterfallChart.c9b7a5abbc8764d68fe4f599535af117",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 4, 2),
    )();
VerticalOrientationWithCustomAxesConfiguration.parameters = {
    kind: "vertical orientation with custom axes configuration",
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

export const HorizontalOrientationWithCustomAxesConfiguration = () =>
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
                identifier: "WaterfallChart.51f357fb8e0217f2725d9c11350a739d",
                properties: {
                    controls: {
                        xaxis: {
                            name: {
                                position: "right",
                            },
                        },
                        yaxis: {
                            max: "130000000",
                            min: "0",
                            name: {
                                position: "bottom",
                            },
                        },
                    },
                },
                sorts: [],
                title: "WaterfallChart - horizontal orientation with custom axes configuration",
                uri: "WaterfallChart.51f357fb8e0217f2725d9c11350a739d",
                visualizationUrl: "local:waterfall",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(21, 4, 3),
    )();
HorizontalOrientationWithCustomAxesConfiguration.parameters = {
    kind: "horizontal orientation with custom axes configuration",
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
