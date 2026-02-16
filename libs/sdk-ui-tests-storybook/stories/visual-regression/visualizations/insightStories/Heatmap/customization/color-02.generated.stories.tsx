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
    title: "04 Stories For Pluggable Vis/Heatmap/customization/color",
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
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "Heatmap.035c68e0082fa6ffe0d0e5a08920afad",
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
                                id: "m_87a053b0_3947_49f3_b0c5_de53fd01f050",
                            },
                        ],
                    },
                },
                sorts: [
                    {
                        attributeSortItem: {
                            attributeIdentifier: "a_label.f_product.product.name",
                            direction: "desc",
                        },
                    },
                ],
                title: "Heatmap - assign color to measures",
                uri: "Heatmap.035c68e0082fa6ffe0d0e5a08920afad",
                visualizationUrl: "local:heatmap",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 5, 0),
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
