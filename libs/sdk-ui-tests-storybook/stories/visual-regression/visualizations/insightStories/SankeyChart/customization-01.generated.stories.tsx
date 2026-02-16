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
    title: "04 Stories For Pluggable Vis/SankeyChart/customization",
};

export const LegendPosition1MeasureAnd2AttributesDefaultLegend = () =>
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
                identifier: "SankeyChart.4a6e7e212cd5b745c5f024effa5e6fbc",
                properties: {
                    controls: {
                        legend: {},
                    },
                },
                sorts: [],
                title: "SankeyChart - legend position - 1 measure and 2 attributes - default legend",
                uri: "SankeyChart.4a6e7e212cd5b745c5f024effa5e6fbc",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 1, 0),
    )();
LegendPosition1MeasureAnd2AttributesDefaultLegend.parameters = {
    kind: "legend position - 1 measure and 2 attributes - default legend",
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
        reloadAfterReady: true,
    },
} satisfies IStoryParameters;

export const LegendPosition1MeasureAnd2AttributesAutoLegend = () =>
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
                identifier: "SankeyChart.1df61537b87db98c5ead502a26efa568",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "auto",
                        },
                    },
                },
                sorts: [],
                title: "SankeyChart - legend position - 1 measure and 2 attributes - auto legend",
                uri: "SankeyChart.1df61537b87db98c5ead502a26efa568",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 1, 1),
    )();
LegendPosition1MeasureAnd2AttributesAutoLegend.parameters = {
    kind: "legend position - 1 measure and 2 attributes - auto legend",
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
        reloadAfterReady: true,
    },
} satisfies IStoryParameters;

export const LegendPosition1MeasureAnd2AttributesLegendOnLeft = () =>
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
                identifier: "SankeyChart.76dc606afb1b0c7ea85db343e1dc20fb",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "left",
                        },
                    },
                },
                sorts: [],
                title: "SankeyChart - legend position - 1 measure and 2 attributes - legend on left",
                uri: "SankeyChart.76dc606afb1b0c7ea85db343e1dc20fb",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 1, 2),
    )();
LegendPosition1MeasureAnd2AttributesLegendOnLeft.parameters = {
    kind: "legend position - 1 measure and 2 attributes - legend on left",
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
        reloadAfterReady: true,
    },
} satisfies IStoryParameters;

export const LegendPosition1MeasureAnd2AttributesLegendOnRight = () =>
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
                identifier: "SankeyChart.e0a03b19a47af35b9f288d867888dccc",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "right",
                        },
                    },
                },
                sorts: [],
                title: "SankeyChart - legend position - 1 measure and 2 attributes - legend on right",
                uri: "SankeyChart.e0a03b19a47af35b9f288d867888dccc",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 1, 3),
    )();
LegendPosition1MeasureAnd2AttributesLegendOnRight.parameters = {
    kind: "legend position - 1 measure and 2 attributes - legend on right",
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
        reloadAfterReady: true,
    },
} satisfies IStoryParameters;

export const LegendPosition1MeasureAnd2AttributesLegendOnTop = () =>
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
                identifier: "SankeyChart.8d52f864e8d77a6a7077f13a46d18fea",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                    },
                },
                sorts: [],
                title: "SankeyChart - legend position - 1 measure and 2 attributes - legend on top",
                uri: "SankeyChart.8d52f864e8d77a6a7077f13a46d18fea",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 1, 4),
    )();
LegendPosition1MeasureAnd2AttributesLegendOnTop.parameters = {
    kind: "legend position - 1 measure and 2 attributes - legend on top",
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
        reloadAfterReady: true,
    },
} satisfies IStoryParameters;

export const LegendPosition1MeasureAnd2AttributesLegendAtBottom = () =>
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
                identifier: "SankeyChart.5cc814295c648e0b7103100615e54156",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "bottom",
                        },
                    },
                },
                sorts: [],
                title: "SankeyChart - legend position - 1 measure and 2 attributes - legend at bottom",
                uri: "SankeyChart.5cc814295c648e0b7103100615e54156",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 1, 5),
    )();
LegendPosition1MeasureAnd2AttributesLegendAtBottom.parameters = {
    kind: "legend position - 1 measure and 2 attributes - legend at bottom",
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
        reloadAfterReady: true,
    },
} satisfies IStoryParameters;

export const LegendPosition1MeasureAnd2AttributesDisabled = () =>
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
                identifier: "SankeyChart.4929c4c82b8a91c9afab8467e8b3dc55",
                properties: {
                    controls: {
                        legend: {
                            enabled: false,
                        },
                    },
                },
                sorts: [],
                title: "SankeyChart - legend position - 1 measure and 2 attributes - disabled",
                uri: "SankeyChart.4929c4c82b8a91c9afab8467e8b3dc55",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 1, 6),
    )();
LegendPosition1MeasureAnd2AttributesDisabled.parameters = {
    kind: "legend position - 1 measure and 2 attributes - disabled",
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
        reloadAfterReady: true,
    },
} satisfies IStoryParameters;

export const LegendPosition1MeasureAnd1AttributeDefaultLegend = () =>
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
                identifier: "SankeyChart.a42fe7cb8c8806fb485aa2b58c0c33ca",
                properties: {
                    controls: {
                        legend: {},
                    },
                },
                sorts: [],
                title: "SankeyChart - legend position - 1 measure and 1 attribute - default legend",
                uri: "SankeyChart.a42fe7cb8c8806fb485aa2b58c0c33ca",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 1, 7),
    )();
LegendPosition1MeasureAnd1AttributeDefaultLegend.parameters = {
    kind: "legend position - 1 measure and 1 attribute - default legend",
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
        reloadAfterReady: true,
    },
} satisfies IStoryParameters;

export const LegendPosition1MeasureAnd1AttributeAutoLegend = () =>
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
                identifier: "SankeyChart.61cad6fc5351b1ece82d50b00f527525",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "auto",
                        },
                    },
                },
                sorts: [],
                title: "SankeyChart - legend position - 1 measure and 1 attribute - auto legend",
                uri: "SankeyChart.61cad6fc5351b1ece82d50b00f527525",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 1, 8),
    )();
LegendPosition1MeasureAnd1AttributeAutoLegend.parameters = {
    kind: "legend position - 1 measure and 1 attribute - auto legend",
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
        reloadAfterReady: true,
    },
} satisfies IStoryParameters;

export const LegendPosition1MeasureAnd1AttributeLegendOnLeft = () =>
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
                identifier: "SankeyChart.e2358b2eb8272c27a72828149c7f5903",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "left",
                        },
                    },
                },
                sorts: [],
                title: "SankeyChart - legend position - 1 measure and 1 attribute - legend on left",
                uri: "SankeyChart.e2358b2eb8272c27a72828149c7f5903",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 1, 9),
    )();
LegendPosition1MeasureAnd1AttributeLegendOnLeft.parameters = {
    kind: "legend position - 1 measure and 1 attribute - legend on left",
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
        reloadAfterReady: true,
    },
} satisfies IStoryParameters;

export const LegendPosition1MeasureAnd1AttributeLegendOnRight = () =>
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
                identifier: "SankeyChart.9c2cb40ad4c8506587a72dba13491ef0",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "right",
                        },
                    },
                },
                sorts: [],
                title: "SankeyChart - legend position - 1 measure and 1 attribute - legend on right",
                uri: "SankeyChart.9c2cb40ad4c8506587a72dba13491ef0",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 1, 10),
    )();
LegendPosition1MeasureAnd1AttributeLegendOnRight.parameters = {
    kind: "legend position - 1 measure and 1 attribute - legend on right",
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
        reloadAfterReady: true,
    },
} satisfies IStoryParameters;

export const LegendPosition1MeasureAnd1AttributeLegendOnTop = () =>
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
                identifier: "SankeyChart.84eca319c15734a47da60ef80dd8f550",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                    },
                },
                sorts: [],
                title: "SankeyChart - legend position - 1 measure and 1 attribute - legend on top",
                uri: "SankeyChart.84eca319c15734a47da60ef80dd8f550",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 1, 11),
    )();
LegendPosition1MeasureAnd1AttributeLegendOnTop.parameters = {
    kind: "legend position - 1 measure and 1 attribute - legend on top",
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
        reloadAfterReady: true,
    },
} satisfies IStoryParameters;

export const LegendPosition1MeasureAnd1AttributeLegendAtBottom = () =>
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
                identifier: "SankeyChart.de25217f5081805d2a97693b2e644ad0",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "bottom",
                        },
                    },
                },
                sorts: [],
                title: "SankeyChart - legend position - 1 measure and 1 attribute - legend at bottom",
                uri: "SankeyChart.de25217f5081805d2a97693b2e644ad0",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 1, 12),
    )();
LegendPosition1MeasureAnd1AttributeLegendAtBottom.parameters = {
    kind: "legend position - 1 measure and 1 attribute - legend at bottom",
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
        reloadAfterReady: true,
    },
} satisfies IStoryParameters;

export const LegendPosition1MeasureAnd1AttributeDisabled = () =>
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
                identifier: "SankeyChart.f14941f41deaf52d301de5876ebdeaec",
                properties: {
                    controls: {
                        legend: {
                            enabled: false,
                        },
                    },
                },
                sorts: [],
                title: "SankeyChart - legend position - 1 measure and 1 attribute - disabled",
                uri: "SankeyChart.f14941f41deaf52d301de5876ebdeaec",
                visualizationUrl: "local:sankey",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(18, 1, 13),
    )();
LegendPosition1MeasureAnd1AttributeDisabled.parameters = {
    kind: "legend position - 1 measure and 1 attribute - disabled",
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
        reloadAfterReady: true,
    },
} satisfies IStoryParameters;
