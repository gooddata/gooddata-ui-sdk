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
    title: "04 Stories For Pluggable Vis/Repeater/customization",
};

export const CanvasLargeRowHeight = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_city.id.cityname",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_city.id.cityname",
                                },
                            },
                        ],
                        localIdentifier: "attribute",
                    },
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_city.id.cityname",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_city.id.cityname_cloned",
                                },
                            },
                            {
                                measure: {
                                    definition: {
                                        inlineDefinition: {
                                            maql: "SELECT {metric/of_lost_opps.} BY ALL OTHER EXCEPT {label/f_city.id.cityname}",
                                        },
                                    },
                                    localIdentifier: "m_of_lost_opps._cloned",
                                    title: "# of Lost Opps.",
                                },
                            },
                            {
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                identifier: "of_lost_opps.",
                                                type: "measure",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_of_lost_opps.",
                                },
                            },
                        ],
                        localIdentifier: "columns",
                    },
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "attr.f_product.product",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_attr.f_product.product",
                                },
                            },
                        ],
                        localIdentifier: "view",
                    },
                ],
                filters: [],
                identifier: "Repeater.625b2a599c13b5a7c1ed64260616f59d",
                properties: {
                    controls: {
                        inlineVisualizations: {
                            "m_of_lost_opps.": {
                                type: "column",
                            },
                        },
                        rowHeight: "large",
                    },
                },
                sorts: [],
                title: "Repeater - canvas - large row height",
                uri: "Repeater.625b2a599c13b5a7c1ed64260616f59d",
                visualizationUrl: "local:repeater",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(17, 1, 0),
    )();
CanvasLargeRowHeight.parameters = {
    kind: "canvas - large row height",
    screenshot: {
        readySelector: {
            selector: ".screenshot-ready-wrapper-done",
            state: State.Attached,
        },
        postInteractionWait: {
            delay: 5000,
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
