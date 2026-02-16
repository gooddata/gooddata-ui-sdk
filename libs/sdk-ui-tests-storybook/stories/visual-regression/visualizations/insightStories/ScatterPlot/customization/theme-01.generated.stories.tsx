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
    title: "04 Stories For Pluggable Vis/ScatterPlot/customization/theme",
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
                                                identifier: "973a14c4-acb1-45fb-ba52-5d96fa02f7ba",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_973a14c4_acb1_45fb_ba52_5d96fa02f7ba",
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                    },
                    {
                        items: [],
                        localIdentifier: "segment",
                    },
                ],
                filters: [],
                identifier: "ScatterPlot.0596d6b98f5e4ea7da9b7efd2acd2ee2",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "ScatterPlot - themed",
                uri: "ScatterPlot.0596d6b98f5e4ea7da9b7efd2acd2ee2",
                visualizationUrl: "local:scatter",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(19, 6, 0),
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
                                                identifier: "973a14c4-acb1-45fb-ba52-5d96fa02f7ba",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_973a14c4_acb1_45fb_ba52_5d96fa02f7ba",
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                    },
                    {
                        items: [],
                        localIdentifier: "segment",
                    },
                ],
                filters: [],
                identifier: "ScatterPlot.3c9babf74bfd6151e4b5e7c51dbd5a8e",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "ScatterPlot - font",
                uri: "ScatterPlot.3c9babf74bfd6151e4b5e7c51dbd5a8e",
                visualizationUrl: "local:scatter",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(19, 6, 1),
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
