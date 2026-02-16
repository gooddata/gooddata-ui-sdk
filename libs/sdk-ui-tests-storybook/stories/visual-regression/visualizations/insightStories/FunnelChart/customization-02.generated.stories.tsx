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
    title: "04 Stories For Pluggable Vis/FunnelChart/customization",
};

export const DataLabelsDefault = () =>
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
                ],
                filters: [],
                identifier: "FunnelChart.c6dc36b163271595a086b42b176cc083",
                properties: {
                    controls: {},
                },
                sorts: [],
                title: "FunnelChart - data labels - default",
                uri: "FunnelChart.c6dc36b163271595a086b42b176cc083",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 2, 0),
    )();
DataLabelsDefault.parameters = {
    kind: "data labels - default",
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

export const DataLabelsAutoVisibility = () =>
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
                ],
                filters: [],
                identifier: "FunnelChart.ca52fad62c72e4836755e458697d7a92",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: "auto",
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - data labels - auto visibility",
                uri: "FunnelChart.ca52fad62c72e4836755e458697d7a92",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 2, 1),
    )();
DataLabelsAutoVisibility.parameters = {
    kind: "data labels - auto visibility",
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

export const DataLabelsForcedVisible = () =>
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
                ],
                filters: [],
                identifier: "FunnelChart.efe22026d8653ac8816cfbf62ab22017",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - data labels - forced visible",
                uri: "FunnelChart.efe22026d8653ac8816cfbf62ab22017",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 2, 2),
    )();
DataLabelsForcedVisible.parameters = {
    kind: "data labels - forced visible",
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

export const DataLabelsForcedVisibleAndGermanSeparators = () =>
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
                ],
                filters: [],
                identifier: "FunnelChart.7998f8e18126a5518830f41f4de365ca",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - data labels - forced visible and german separators",
                uri: "FunnelChart.7998f8e18126a5518830f41f4de365ca",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 2, 3),
    )();
DataLabelsForcedVisibleAndGermanSeparators.parameters = {
    kind: "data labels - forced visible and german separators",
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

export const DataLabelsForcedHidden = () =>
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
                ],
                filters: [],
                identifier: "FunnelChart.3fb73844e5343532b930b3f1f9d587cc",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: false,
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - data labels - forced hidden",
                uri: "FunnelChart.3fb73844e5343532b930b3f1f9d587cc",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 2, 4),
    )();
DataLabelsForcedHidden.parameters = {
    kind: "data labels - forced hidden",
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

export const DataLabelsForcedVisibleWithShownPercentages = () =>
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
                ],
                filters: [],
                identifier: "FunnelChart.c2272affee4b8a79392044992070114e",
                properties: {
                    controls: {
                        dataLabels: {
                            percentsVisible: true,
                            visible: true,
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - data labels - forced visible with shown percentages",
                uri: "FunnelChart.c2272affee4b8a79392044992070114e",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 2, 5),
    )();
DataLabelsForcedVisibleWithShownPercentages.parameters = {
    kind: "data labels - forced visible with shown percentages",
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

export const DataLabelsForcedVisibleWithHiddenPercentages = () =>
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
                ],
                filters: [],
                identifier: "FunnelChart.063a6de71c9acfce6219262984ac94ca",
                properties: {
                    controls: {
                        dataLabels: {
                            percentsVisible: false,
                            visible: true,
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - data labels - forced visible with hidden percentages",
                uri: "FunnelChart.063a6de71c9acfce6219262984ac94ca",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 2, 6),
    )();
DataLabelsForcedVisibleWithHiddenPercentages.parameters = {
    kind: "data labels - forced visible with hidden percentages",
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

export const DataLabelsForcedHiddenPercentagesVisibleHasNoEffect = () =>
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
                ],
                filters: [],
                identifier: "FunnelChart.b97a1acf34ef9444320c1828adf7c744",
                properties: {
                    controls: {
                        dataLabels: {
                            percentsVisible: true,
                            visible: false,
                        },
                    },
                },
                sorts: [],
                title: "FunnelChart - data labels - forced hidden, percentages visible has no effect",
                uri: "FunnelChart.b97a1acf34ef9444320c1828adf7c744",
                visualizationUrl: "local:funnel",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(9, 2, 7),
    )();
DataLabelsForcedHiddenPercentagesVisibleHasNoEffect.parameters = {
    kind: "data labels - forced hidden, percentages visible has no effect",
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
