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
    title: "04 Stories For Pluggable Vis/Repeater/customization/theme",
};

export const Themed = () =>
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
                identifier: "Repeater.85a283be3d4d3ad21263155a16700543",
                properties: {
                    controls: {
                        inlineVisualizations: {
                            "m_of_lost_opps.": {
                                type: "column",
                            },
                        },
                    },
                },
                sorts: [],
                title: "Repeater - themed",
                uri: "Repeater.85a283be3d4d3ad21263155a16700543",
                visualizationUrl: "local:repeater",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(17, 3, 0),
    )();
Themed.parameters = {
    kind: "themed",
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

export const Font = () =>
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
                identifier: "Repeater.bdfa144f7f2918445ac731bea382285b",
                properties: {
                    controls: {
                        inlineVisualizations: {
                            "m_of_lost_opps.": {
                                type: "column",
                            },
                        },
                    },
                },
                sorts: [],
                title: "Repeater - font",
                uri: "Repeater.bdfa144f7f2918445ac731bea382285b",
                visualizationUrl: "local:repeater",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(17, 3, 1),
    )();
Font.parameters = {
    kind: "font",
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
