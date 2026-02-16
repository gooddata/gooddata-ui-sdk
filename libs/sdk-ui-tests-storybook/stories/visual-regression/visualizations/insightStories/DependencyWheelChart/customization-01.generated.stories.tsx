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
    title: "04 Stories For Pluggable Vis/DependencyWheelChart/customization",
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
                identifier: "DependencyWheelChart.aabdfd433b0eeeccd54c786b49402ebd",
                properties: {
                    controls: {
                        legend: {},
                    },
                },
                sorts: [],
                title: "DependencyWheelChart - legend position - 1 measure and 2 attributes - default legend",
                uri: "DependencyWheelChart.aabdfd433b0eeeccd54c786b49402ebd",
                visualizationUrl: "local:dependencywheel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(6, 1, 0),
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
                identifier: "DependencyWheelChart.aa7c2ee7e53433ef76837e48e8e2a386",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "auto",
                        },
                    },
                },
                sorts: [],
                title: "DependencyWheelChart - legend position - 1 measure and 2 attributes - auto legend",
                uri: "DependencyWheelChart.aa7c2ee7e53433ef76837e48e8e2a386",
                visualizationUrl: "local:dependencywheel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(6, 1, 1),
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
                identifier: "DependencyWheelChart.844d9c8a0ab77f3da375542c390a373e",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "left",
                        },
                    },
                },
                sorts: [],
                title: "DependencyWheelChart - legend position - 1 measure and 2 attributes - legend on left",
                uri: "DependencyWheelChart.844d9c8a0ab77f3da375542c390a373e",
                visualizationUrl: "local:dependencywheel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(6, 1, 2),
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
                identifier: "DependencyWheelChart.fd3bb4293060829bcba439fa9bfb12fc",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "right",
                        },
                    },
                },
                sorts: [],
                title: "DependencyWheelChart - legend position - 1 measure and 2 attributes - legend on right",
                uri: "DependencyWheelChart.fd3bb4293060829bcba439fa9bfb12fc",
                visualizationUrl: "local:dependencywheel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(6, 1, 3),
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
                identifier: "DependencyWheelChart.60f56271b8c86c47afe730285613abfd",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                    },
                },
                sorts: [],
                title: "DependencyWheelChart - legend position - 1 measure and 2 attributes - legend on top",
                uri: "DependencyWheelChart.60f56271b8c86c47afe730285613abfd",
                visualizationUrl: "local:dependencywheel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(6, 1, 4),
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
                identifier: "DependencyWheelChart.4e02e90472a7b332920bbfb441a32a09",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "bottom",
                        },
                    },
                },
                sorts: [],
                title: "DependencyWheelChart - legend position - 1 measure and 2 attributes - legend at bottom",
                uri: "DependencyWheelChart.4e02e90472a7b332920bbfb441a32a09",
                visualizationUrl: "local:dependencywheel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(6, 1, 5),
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
                identifier: "DependencyWheelChart.fe8cf7741d878a72ad17905fb2af58a9",
                properties: {
                    controls: {
                        legend: {
                            enabled: false,
                        },
                    },
                },
                sorts: [],
                title: "DependencyWheelChart - legend position - 1 measure and 2 attributes - disabled",
                uri: "DependencyWheelChart.fe8cf7741d878a72ad17905fb2af58a9",
                visualizationUrl: "local:dependencywheel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(6, 1, 6),
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
                identifier: "DependencyWheelChart.3fdb2c12ae227f48eb93d2967c9c1bd6",
                properties: {
                    controls: {
                        legend: {},
                    },
                },
                sorts: [],
                title: "DependencyWheelChart - legend position - 1 measure and 1 attribute - default legend",
                uri: "DependencyWheelChart.3fdb2c12ae227f48eb93d2967c9c1bd6",
                visualizationUrl: "local:dependencywheel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(6, 1, 7),
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
                identifier: "DependencyWheelChart.0a9ae5995827e79c5e8f26494b1fef49",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "auto",
                        },
                    },
                },
                sorts: [],
                title: "DependencyWheelChart - legend position - 1 measure and 1 attribute - auto legend",
                uri: "DependencyWheelChart.0a9ae5995827e79c5e8f26494b1fef49",
                visualizationUrl: "local:dependencywheel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(6, 1, 8),
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
                identifier: "DependencyWheelChart.8200545633aaad6aa72d5b7deeefab5c",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "left",
                        },
                    },
                },
                sorts: [],
                title: "DependencyWheelChart - legend position - 1 measure and 1 attribute - legend on left",
                uri: "DependencyWheelChart.8200545633aaad6aa72d5b7deeefab5c",
                visualizationUrl: "local:dependencywheel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(6, 1, 9),
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
                identifier: "DependencyWheelChart.37b462959360c4d603a2fa26899e1a74",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "right",
                        },
                    },
                },
                sorts: [],
                title: "DependencyWheelChart - legend position - 1 measure and 1 attribute - legend on right",
                uri: "DependencyWheelChart.37b462959360c4d603a2fa26899e1a74",
                visualizationUrl: "local:dependencywheel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(6, 1, 10),
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
                identifier: "DependencyWheelChart.8548c7c5ac54fa96c1a4cc8b792eba1e",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                    },
                },
                sorts: [],
                title: "DependencyWheelChart - legend position - 1 measure and 1 attribute - legend on top",
                uri: "DependencyWheelChart.8548c7c5ac54fa96c1a4cc8b792eba1e",
                visualizationUrl: "local:dependencywheel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(6, 1, 11),
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
                identifier: "DependencyWheelChart.f0845449d01d673dce21d2f84a0abc3c",
                properties: {
                    controls: {
                        legend: {
                            enabled: true,
                            position: "bottom",
                        },
                    },
                },
                sorts: [],
                title: "DependencyWheelChart - legend position - 1 measure and 1 attribute - legend at bottom",
                uri: "DependencyWheelChart.f0845449d01d673dce21d2f84a0abc3c",
                visualizationUrl: "local:dependencywheel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(6, 1, 12),
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
                identifier: "DependencyWheelChart.3759a5c8fba20389ebe1bccdcbe8f109",
                properties: {
                    controls: {
                        legend: {
                            enabled: false,
                        },
                    },
                },
                sorts: [],
                title: "DependencyWheelChart - legend position - 1 measure and 1 attribute - disabled",
                uri: "DependencyWheelChart.3759a5c8fba20389ebe1bccdcbe8f109",
                visualizationUrl: "local:dependencywheel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(6, 1, 13),
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
    },
} satisfies IStoryParameters;
