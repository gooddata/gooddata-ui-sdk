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
    title: "04 Stories For Pluggable Vis/Treemap/customization/color",
};

export const AssignColorToAttributes = () =>
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
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
                                },
                            },
                        ],
                        localIdentifier: "segment",
                    },
                ],
                filters: [],
                identifier: "Treemap.3a9842f85bdccd25ac36ec80cfecfae7",
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
                                id: "WonderKid",
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
                                id: "Explorer",
                            },
                        ],
                    },
                },
                sorts: [
                    {
                        attributeSortItem: {
                            attributeIdentifier: "a_label.f_product.product.name",
                            direction: "asc",
                        },
                    },
                    {
                        measureSortItem: {
                            direction: "desc",
                            locators: [
                                {
                                    measureLocatorItem: {
                                        measureIdentifier: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                                    },
                                },
                            ],
                        },
                    },
                ],
                title: "Treemap - assign color to attributes",
                uri: "Treemap.3a9842f85bdccd25ac36ec80cfecfae7",
                visualizationUrl: "local:treemap",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(20, 4, 0),
    )();
AssignColorToAttributes.parameters = {
    kind: "assign color to attributes",
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
