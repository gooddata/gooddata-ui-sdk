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
    title: "04 Stories For Pluggable Vis/SankeyChart/base",
};

export const MeasureOnly = () =>
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
                        localIdentifier: "attribute_from",
                    },
                    {
                        items: [],
                        localIdentifier: "attribute_to",
                    },
                ],
                filters: [],
                identifier: "SankeyChart.84a6723c4ba29369af0643189c08a7b1",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "SankeyChart - measure only",
                uri: "SankeyChart.84a6723c4ba29369af0643189c08a7b1",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 0, 0),
    )();
MeasureOnly.parameters = {
    kind: "measure only",
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

export const MeasureAndAttributefrom = () =>
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
                        localIdentifier: "attribute_from",
                    },
                    {
                        items: [],
                        localIdentifier: "attribute_to",
                    },
                ],
                filters: [],
                identifier: "SankeyChart.4d5f253d4d846ad70b1d945be616a9aa",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "SankeyChart - measure and attributeFrom",
                uri: "SankeyChart.4d5f253d4d846ad70b1d945be616a9aa",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 0, 1),
    )();
MeasureAndAttributefrom.parameters = {
    kind: "measure and attributeFrom",
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

export const MeasureAndAttributeto = () =>
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
                        localIdentifier: "attribute_from",
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
                        localIdentifier: "attribute_to",
                    },
                ],
                filters: [],
                identifier: "SankeyChart.e8ca4c0227e2eb78988211a009556cbd",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "SankeyChart - measure and attributeTo",
                uri: "SankeyChart.e8ca4c0227e2eb78988211a009556cbd",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 0, 2),
    )();
MeasureAndAttributeto.parameters = {
    kind: "measure and attributeTo",
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

export const MeasureAttributefromAndAttributeto = () =>
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
                        localIdentifier: "attribute_from",
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
                        localIdentifier: "attribute_to",
                    },
                ],
                filters: [],
                identifier: "SankeyChart.a21201173b4f055490a3c4ad06c65897",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "SankeyChart - measure, attributeFrom and attributeTo",
                uri: "SankeyChart.a21201173b4f055490a3c4ad06c65897",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 0, 3),
    )();
MeasureAttributefromAndAttributeto.parameters = {
    kind: "measure, attributeFrom and attributeTo",
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
