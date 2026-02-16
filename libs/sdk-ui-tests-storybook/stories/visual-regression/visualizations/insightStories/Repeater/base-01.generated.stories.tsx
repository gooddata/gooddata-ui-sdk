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
    title: "04 Stories For Pluggable Vis/Repeater/base",
};

export const OneAttribute = () =>
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
                        ],
                        localIdentifier: "columns",
                    },
                ],
                filters: [],
                identifier: "Repeater.7913aa1d19190897ce5cf885f9bf798f",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "Repeater - one attribute",
                uri: "Repeater.7913aa1d19190897ce5cf885f9bf798f",
                visualizationUrl: "local:repeater",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(17, 0, 0),
    )();
OneAttribute.parameters = {
    kind: "one attribute",
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

export const OneAttributeAndOneMeasure = () =>
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
                ],
                filters: [],
                identifier: "Repeater.ffd4d1e9f768baa1ca7c367880453191",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "Repeater - one attribute and one measure",
                uri: "Repeater.ffd4d1e9f768baa1ca7c367880453191",
                visualizationUrl: "local:repeater",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(17, 0, 1),
    )();
OneAttributeAndOneMeasure.parameters = {
    kind: "one attribute and one measure",
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

export const OneAttributeAndOneVisualisation = () =>
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
                identifier: "Repeater.a2395468f97d492674ca8ef91ff46e46",
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
                title: "Repeater - one attribute and one visualisation",
                uri: "Repeater.a2395468f97d492674ca8ef91ff46e46",
                visualizationUrl: "local:repeater",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(17, 0, 2),
    )();
OneAttributeAndOneVisualisation.parameters = {
    kind: "one attribute and one visualisation",
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
