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
    title: "04 Stories For Pluggable Vis/BarChart/customization",
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
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.afe94e85b25b4e86f7d876aff4361dcc",
                properties: {
                    controls: {
                        enableSeparateTotalLabels: true,
                    },
                },
                sorts: [],
                title: "BarChart - data labels - default",
                uri: "BarChart.afe94e85b25b4e86f7d876aff4361dcc",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 2, 0),
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

export const DataLabelsDataLabelsAutoVisibility = () =>
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
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.26925091b22a031264678b91f8b13d52",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: "auto",
                        },
                        enableSeparateTotalLabels: true,
                    },
                },
                sorts: [],
                title: "BarChart - data labels - data labels auto visibility",
                uri: "BarChart.26925091b22a031264678b91f8b13d52",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 2, 1),
    )();
DataLabelsDataLabelsAutoVisibility.parameters = {
    kind: "data labels - data labels auto visibility",
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

export const DataLabelsDataLabelsForcedVisible = () =>
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
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.498a45430b9002ebef1904b46d9af87c",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                        enableSeparateTotalLabels: true,
                    },
                },
                sorts: [],
                title: "BarChart - data labels - data labels forced visible",
                uri: "BarChart.498a45430b9002ebef1904b46d9af87c",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 2, 2),
    )();
DataLabelsDataLabelsForcedVisible.parameters = {
    kind: "data labels - data labels forced visible",
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

export const DataLabelsDataLabelsForcedHidden = () =>
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
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.6cd3d6b14be98a244e4ba8090f11bef0",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: false,
                        },
                        enableSeparateTotalLabels: true,
                    },
                },
                sorts: [],
                title: "BarChart - data labels - data labels forced hidden",
                uri: "BarChart.6cd3d6b14be98a244e4ba8090f11bef0",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 2, 3),
    )();
DataLabelsDataLabelsForcedHidden.parameters = {
    kind: "data labels - data labels forced hidden",
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

export const DataLabelsForcedDatalabelsVisibleAndGermanSeparators = () =>
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
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.502978c311765bb56a9e9ad9c5ffc195",
                properties: {
                    controls: {
                        dataLabels: {
                            visible: true,
                        },
                        enableSeparateTotalLabels: true,
                    },
                },
                sorts: [],
                title: "BarChart - data labels - forced dataLabels visible and german separators",
                uri: "BarChart.502978c311765bb56a9e9ad9c5ffc195",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 2, 4),
    )();
DataLabelsForcedDatalabelsVisibleAndGermanSeparators.parameters = {
    kind: "data labels - forced dataLabels visible and german separators",
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

export const DataLabelsDataLabelsAndTotalsWithAutoVisibility = () =>
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
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.55519316df8abae731fe3866bbfd620e",
                properties: {
                    controls: {
                        dataLabels: {
                            totalsVisible: "auto",
                            visible: "auto",
                        },
                        enableSeparateTotalLabels: true,
                    },
                },
                sorts: [],
                title: "BarChart - data labels - data labels and totals with auto visibility",
                uri: "BarChart.55519316df8abae731fe3866bbfd620e",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 2, 5),
    )();
DataLabelsDataLabelsAndTotalsWithAutoVisibility.parameters = {
    kind: "data labels - data labels and totals with auto visibility",
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

export const DataLabelsDataLabelsForcedHiddenTotalsForcedVisible = () =>
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
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.4aadbf066d4f84b409c7c92b0336f9a5",
                properties: {
                    controls: {
                        dataLabels: {
                            totalsVisible: true,
                            visible: false,
                        },
                        enableSeparateTotalLabels: true,
                    },
                },
                sorts: [],
                title: "BarChart - data labels - data labels forced hidden totals forced visible",
                uri: "BarChart.4aadbf066d4f84b409c7c92b0336f9a5",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 2, 6),
    )();
DataLabelsDataLabelsForcedHiddenTotalsForcedVisible.parameters = {
    kind: "data labels - data labels forced hidden totals forced visible",
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

export const DataLabelsDataLabelsForcedHiddenTotalsForcedHidden = () =>
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
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.528a4646cf071cbdbdd2f74fa468813f",
                properties: {
                    controls: {
                        dataLabels: {
                            totalsVisible: false,
                            visible: false,
                        },
                        enableSeparateTotalLabels: true,
                    },
                },
                sorts: [],
                title: "BarChart - data labels - data labels forced hidden totals forced hidden",
                uri: "BarChart.528a4646cf071cbdbdd2f74fa468813f",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 2, 7),
    )();
DataLabelsDataLabelsForcedHiddenTotalsForcedHidden.parameters = {
    kind: "data labels - data labels forced hidden totals forced hidden",
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

export const DataLabelsLabelsForcedHiddenTotalsAutoVisibility = () =>
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
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.4298d6d3a7fe5ab7959645c1e141ee4a",
                properties: {
                    controls: {
                        dataLabels: {
                            totalsVisible: "auto",
                            visible: false,
                        },
                        enableSeparateTotalLabels: true,
                    },
                },
                sorts: [],
                title: "BarChart - data labels - labels forced hidden totals auto visibility",
                uri: "BarChart.4298d6d3a7fe5ab7959645c1e141ee4a",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 2, 8),
    )();
DataLabelsLabelsForcedHiddenTotalsAutoVisibility.parameters = {
    kind: "data labels - labels forced hidden totals auto visibility",
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

export const DataLabelsDataLabelsWithBackplateStyle = () =>
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
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
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
                                        identifier: "label.f_product.product.name",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_label.f_product.product.name",
                                },
                            },
                        ],
                        localIdentifier: "stack",
                    },
                ],
                filters: [],
                identifier: "BarChart.77d13a68598dc03c58fab23013be6bd1",
                properties: {
                    controls: {
                        dataLabels: {
                            style: "backplate",
                            totalsVisible: true,
                            visible: true,
                        },
                        enableSeparateTotalLabels: true,
                    },
                },
                sorts: [],
                title: "BarChart - data labels - data labels with backplate style",
                uri: "BarChart.77d13a68598dc03c58fab23013be6bd1",
                visualizationUrl: "local:bar",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(1, 2, 9),
    )();
DataLabelsDataLabelsWithBackplateStyle.parameters = {
    kind: "data labels - data labels with backplate style",
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
