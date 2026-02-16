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
    title: "04 Stories For Pluggable Vis/LineChart/customization/axes",
};

export const DualAxisNameConfigurationLow = () =>
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
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "dt_oppcreated_timestamp.quarter",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_oppcreated_timestamp.quarter",
                                },
                            },
                        ],
                        localIdentifier: "trend",
                    },
                    {
                        items: [],
                        localIdentifier: "segment",
                    },
                ],
                filters: [],
                identifier: "LineChart.a9ff4679c84738f2d9ddaae67b88aac6",
                properties: {
                    controls: {
                        secondary_xaxis: {
                            name: {
                                position: "left",
                            },
                        },
                        secondary_yaxis: {
                            measures: ["m_e519fa2a_86c3_4e32_8313_0c03062348j3"],
                            name: {
                                position: "bottom",
                            },
                        },
                        xaxis: {
                            name: {
                                position: "left",
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
                title: "LineChart - dual axis name configuration - low",
                uri: "LineChart.a9ff4679c84738f2d9ddaae67b88aac6",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 9, 0),
    )();
DualAxisNameConfigurationLow.parameters = {
    kind: "dual axis name configuration - low",
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

export const DualAxisNameConfigurationMiddle = () =>
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
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "dt_oppcreated_timestamp.quarter",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_oppcreated_timestamp.quarter",
                                },
                            },
                        ],
                        localIdentifier: "trend",
                    },
                    {
                        items: [],
                        localIdentifier: "segment",
                    },
                ],
                filters: [],
                identifier: "LineChart.3a3c66b7979613ef10d1cd4f54c3eebb",
                properties: {
                    controls: {
                        secondary_xaxis: {
                            name: {
                                position: "center",
                            },
                        },
                        secondary_yaxis: {
                            measures: ["m_e519fa2a_86c3_4e32_8313_0c03062348j3"],
                            name: {
                                position: "center",
                            },
                        },
                        xaxis: {
                            name: {
                                position: "center",
                            },
                        },
                        yaxis: {
                            name: {
                                position: "center",
                            },
                        },
                    },
                },
                sorts: [],
                title: "LineChart - dual axis name configuration - middle",
                uri: "LineChart.3a3c66b7979613ef10d1cd4f54c3eebb",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 9, 1),
    )();
DualAxisNameConfigurationMiddle.parameters = {
    kind: "dual axis name configuration - middle",
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

export const DualAxisNameConfigurationHigh = () =>
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
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "dt_oppcreated_timestamp.quarter",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_oppcreated_timestamp.quarter",
                                },
                            },
                        ],
                        localIdentifier: "trend",
                    },
                    {
                        items: [],
                        localIdentifier: "segment",
                    },
                ],
                filters: [],
                identifier: "LineChart.6f6687d93afdd73fd2e903b2e7e3fa21",
                properties: {
                    controls: {
                        secondary_xaxis: {
                            name: {
                                position: "right",
                            },
                        },
                        secondary_yaxis: {
                            measures: ["m_e519fa2a_86c3_4e32_8313_0c03062348j3"],
                            name: {
                                position: "top",
                            },
                        },
                        xaxis: {
                            name: {
                                position: "right",
                            },
                        },
                        yaxis: {
                            name: {
                                position: "top",
                            },
                        },
                    },
                },
                sorts: [],
                title: "LineChart - dual axis name configuration - high",
                uri: "LineChart.6f6687d93afdd73fd2e903b2e7e3fa21",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 9, 2),
    )();
DualAxisNameConfigurationHigh.parameters = {
    kind: "dual axis name configuration - high",
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

export const DualAxisNameConfigurationInvisible = () =>
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
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "dt_oppcreated_timestamp.quarter",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_dt_oppcreated_timestamp.quarter",
                                },
                            },
                        ],
                        localIdentifier: "trend",
                    },
                    {
                        items: [],
                        localIdentifier: "segment",
                    },
                ],
                filters: [],
                identifier: "LineChart.0f8f689a3a7d175276fb9a8089eab3bb",
                properties: {
                    controls: {
                        secondary_xaxis: {
                            name: {
                                position: "center",
                            },
                        },
                        secondary_yaxis: {
                            measures: ["m_e519fa2a_86c3_4e32_8313_0c03062348j3"],
                            name: {
                                position: "center",
                            },
                        },
                        xaxis: {
                            name: {
                                position: "center",
                            },
                        },
                        yaxis: {
                            name: {
                                position: "center",
                            },
                        },
                    },
                },
                sorts: [],
                title: "LineChart - dual axis name configuration - invisible",
                uri: "LineChart.0f8f689a3a7d175276fb9a8089eab3bb",
                visualizationUrl: "local:line",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 9, 3),
    )();
DualAxisNameConfigurationInvisible.parameters = {
    kind: "dual axis name configuration - invisible",
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
