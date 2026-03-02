// (C) 2026 GoodData Corporation

import { type IInsight } from "@gooddata/sdk-model";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/dropdown_icons.css";

import { type IStoryParameters, State } from "../../../../../../stories/_infra/backstopScenario.js";
import {
    getScenariosGroupByIndexes,
    plugVizStory,
} from "../../../../../../stories/visual-regression/visualizations/insightStories.js";
import "../../../../../..//stories/visual-regression/visualizations/insightStories.css";

export default {
    title: "04 Stories For Pluggable Vis/GeoPushpinChart/customization/legend",
};

export const LegendPositionTop = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_city.id.latitude",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_city.id.latitude",
                                },
                            },
                        ],
                        localIdentifier: "location",
                    },
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Population",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_population",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_f_population_sum",
                                },
                            },
                        ],
                        localIdentifier: "size",
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
                filters: [
                    {
                        positiveAttributeFilter: {
                            displayForm: {
                                identifier: "f_owner.region_id",
                                type: "displayForm",
                            },
                            in: {
                                values: ["West Coast", "East Coast"],
                            },
                        },
                    },
                ],
                identifier: "GeoPushpinChart.4db9cbbbb5ae89d41b7623d3f5ad8647",
                properties: {
                    controls: {
                        latitude: "f_city.id.latitude",
                        legend: {
                            position: "top",
                        },
                        longitude: "f_city.id.longitude",
                        mapStyle: {
                            glyphs: "/geo-assets/glyphs/{fontstack}/{range}.pbf",
                            layers: [
                                {
                                    id: "background",
                                    paint: {
                                        "background-color": "#ffffff",
                                    },
                                    type: "background",
                                },
                            ],
                            name: "offline-minimal",
                            sources: {},
                            version: 8,
                        },
                        tooltipText: "f_city.id.cityname",
                    },
                },
                sorts: [],
                title: "GeoPushpinChart - legend position top",
                uri: "GeoPushpinChart.4db9cbbbb5ae89d41b7623d3f5ad8647",
                visualizationUrl: "local:pushpin",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 3, 0),
    )();
LegendPositionTop.parameters = {
    kind: "legend position top",
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

export const LegendPositionRight = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_city.id.latitude",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_city.id.latitude",
                                },
                            },
                        ],
                        localIdentifier: "location",
                    },
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Population",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_population",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_f_population_sum",
                                },
                            },
                        ],
                        localIdentifier: "size",
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
                filters: [
                    {
                        positiveAttributeFilter: {
                            displayForm: {
                                identifier: "f_owner.region_id",
                                type: "displayForm",
                            },
                            in: {
                                values: ["West Coast", "East Coast"],
                            },
                        },
                    },
                ],
                identifier: "GeoPushpinChart.b9d042ecf17934f9c0471ccb4b9a9d5f",
                properties: {
                    controls: {
                        latitude: "f_city.id.latitude",
                        legend: {
                            position: "right",
                        },
                        longitude: "f_city.id.longitude",
                        mapStyle: {
                            glyphs: "/geo-assets/glyphs/{fontstack}/{range}.pbf",
                            layers: [
                                {
                                    id: "background",
                                    paint: {
                                        "background-color": "#ffffff",
                                    },
                                    type: "background",
                                },
                            ],
                            name: "offline-minimal",
                            sources: {},
                            version: 8,
                        },
                        tooltipText: "f_city.id.cityname",
                    },
                },
                sorts: [],
                title: "GeoPushpinChart - legend position right",
                uri: "GeoPushpinChart.b9d042ecf17934f9c0471ccb4b9a9d5f",
                visualizationUrl: "local:pushpin",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 3, 1),
    )();
LegendPositionRight.parameters = {
    kind: "legend position right",
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

export const LegendPositionBottom = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_city.id.latitude",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_city.id.latitude",
                                },
                            },
                        ],
                        localIdentifier: "location",
                    },
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Population",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_population",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_f_population_sum",
                                },
                            },
                        ],
                        localIdentifier: "size",
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
                filters: [
                    {
                        positiveAttributeFilter: {
                            displayForm: {
                                identifier: "f_owner.region_id",
                                type: "displayForm",
                            },
                            in: {
                                values: ["West Coast", "East Coast"],
                            },
                        },
                    },
                ],
                identifier: "GeoPushpinChart.21af35fd7d32645842d4a26cbfa49507",
                properties: {
                    controls: {
                        latitude: "f_city.id.latitude",
                        legend: {
                            position: "bottom",
                        },
                        longitude: "f_city.id.longitude",
                        mapStyle: {
                            glyphs: "/geo-assets/glyphs/{fontstack}/{range}.pbf",
                            layers: [
                                {
                                    id: "background",
                                    paint: {
                                        "background-color": "#ffffff",
                                    },
                                    type: "background",
                                },
                            ],
                            name: "offline-minimal",
                            sources: {},
                            version: 8,
                        },
                        tooltipText: "f_city.id.cityname",
                    },
                },
                sorts: [],
                title: "GeoPushpinChart - legend position bottom",
                uri: "GeoPushpinChart.21af35fd7d32645842d4a26cbfa49507",
                visualizationUrl: "local:pushpin",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 3, 2),
    )();
LegendPositionBottom.parameters = {
    kind: "legend position bottom",
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

export const LegendPositionLeft = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_city.id.latitude",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_city.id.latitude",
                                },
                            },
                        ],
                        localIdentifier: "location",
                    },
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Population",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_population",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_f_population_sum",
                                },
                            },
                        ],
                        localIdentifier: "size",
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
                filters: [
                    {
                        positiveAttributeFilter: {
                            displayForm: {
                                identifier: "f_owner.region_id",
                                type: "displayForm",
                            },
                            in: {
                                values: ["West Coast", "East Coast"],
                            },
                        },
                    },
                ],
                identifier: "GeoPushpinChart.012f83c3798c79404e324c0b2b9fb593",
                properties: {
                    controls: {
                        latitude: "f_city.id.latitude",
                        legend: {
                            position: "left",
                        },
                        longitude: "f_city.id.longitude",
                        mapStyle: {
                            glyphs: "/geo-assets/glyphs/{fontstack}/{range}.pbf",
                            layers: [
                                {
                                    id: "background",
                                    paint: {
                                        "background-color": "#ffffff",
                                    },
                                    type: "background",
                                },
                            ],
                            name: "offline-minimal",
                            sources: {},
                            version: 8,
                        },
                        tooltipText: "f_city.id.cityname",
                    },
                },
                sorts: [],
                title: "GeoPushpinChart - legend position left",
                uri: "GeoPushpinChart.012f83c3798c79404e324c0b2b9fb593",
                visualizationUrl: "local:pushpin",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 3, 3),
    )();
LegendPositionLeft.parameters = {
    kind: "legend position left",
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

export const LegendWithSelection = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_city.id.latitude",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_city.id.latitude",
                                },
                            },
                        ],
                        localIdentifier: "location",
                    },
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Population",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_population",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_f_population_sum",
                                },
                            },
                        ],
                        localIdentifier: "size",
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
                filters: [
                    {
                        positiveAttributeFilter: {
                            displayForm: {
                                identifier: "f_owner.region_id",
                                type: "displayForm",
                            },
                            in: {
                                values: ["West Coast", "East Coast"],
                            },
                        },
                    },
                ],
                identifier: "GeoPushpinChart.c8ad5ce0355f4921ba449ab37fc10d48",
                properties: {
                    controls: {
                        latitude: "f_city.id.latitude",
                        legend: {
                            position: "right",
                        },
                        longitude: "f_city.id.longitude",
                        mapStyle: {
                            glyphs: "/geo-assets/glyphs/{fontstack}/{range}.pbf",
                            layers: [
                                {
                                    id: "background",
                                    paint: {
                                        "background-color": "#ffffff",
                                    },
                                    type: "background",
                                },
                            ],
                            name: "offline-minimal",
                            sources: {},
                            version: 8,
                        },
                        selectedSegmentItems: ["West Coast", "East Coast"],
                        tooltipText: "f_city.id.cityname",
                    },
                },
                sorts: [],
                title: "GeoPushpinChart - legend with selection",
                uri: "GeoPushpinChart.c8ad5ce0355f4921ba449ab37fc10d48",
                visualizationUrl: "local:pushpin",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 3, 4),
    )();
LegendWithSelection.parameters = {
    kind: "legend with selection",
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

export const LegendSizeColorScaleAndCategory = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_city.id.latitude",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_city.id.latitude",
                                },
                            },
                        ],
                        localIdentifier: "location",
                    },
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Population",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_population",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_f_population_sum",
                                },
                            },
                        ],
                        localIdentifier: "size",
                    },
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Revenue",
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
                        localIdentifier: "color",
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
                filters: [
                    {
                        positiveAttributeFilter: {
                            displayForm: {
                                identifier: "f_owner.region_id",
                                type: "displayForm",
                            },
                            in: {
                                values: ["West Coast", "East Coast"],
                            },
                        },
                    },
                ],
                identifier: "GeoPushpinChart.8808def0b840c0eb08691642eda144bb",
                properties: {
                    controls: {
                        latitude: "f_city.id.latitude",
                        legend: {
                            position: "right",
                        },
                        longitude: "f_city.id.longitude",
                        mapStyle: {
                            glyphs: "/geo-assets/glyphs/{fontstack}/{range}.pbf",
                            layers: [
                                {
                                    id: "background",
                                    paint: {
                                        "background-color": "#ffffff",
                                    },
                                    type: "background",
                                },
                            ],
                            name: "offline-minimal",
                            sources: {},
                            version: 8,
                        },
                        tooltipText: "f_city.id.cityname",
                        viewport: {
                            area: "continent_na",
                        },
                    },
                },
                sorts: [],
                title: "GeoPushpinChart - legend size color-scale and category",
                uri: "GeoPushpinChart.8808def0b840c0eb08691642eda144bb",
                visualizationUrl: "local:pushpin",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 3, 5),
    )();
LegendSizeColorScaleAndCategory.parameters = {
    kind: "legend size color-scale and category",
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

export const LegendCategoryEdgeCaseWithEmptyRegions = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "f_city.id.latitude",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_city.id.latitude",
                                },
                            },
                        ],
                        localIdentifier: "location",
                    },
                    {
                        items: [
                            {
                                measure: {
                                    alias: "Population",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                identifier: "f_population",
                                                type: "fact",
                                            },
                                        },
                                    },
                                    localIdentifier: "m_f_population_sum",
                                },
                            },
                        ],
                        localIdentifier: "size",
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
                identifier: "GeoPushpinChart.991908110406152b29c48a3e342cd2b0",
                properties: {
                    controls: {
                        latitude: "f_city.id.latitude",
                        legend: {
                            position: "right",
                        },
                        longitude: "f_city.id.longitude",
                        mapStyle: {
                            glyphs: "/geo-assets/glyphs/{fontstack}/{range}.pbf",
                            layers: [
                                {
                                    id: "background",
                                    paint: {
                                        "background-color": "#ffffff",
                                    },
                                    type: "background",
                                },
                            ],
                            name: "offline-minimal",
                            sources: {},
                            version: 8,
                        },
                        tooltipText: "f_city.id.cityname",
                        viewport: {
                            area: "continent_na",
                        },
                    },
                },
                sorts: [],
                title: "GeoPushpinChart - legend category edge case with empty regions",
                uri: "GeoPushpinChart.991908110406152b29c48a3e342cd2b0",
                visualizationUrl: "local:pushpin",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 3, 6),
    )();
LegendCategoryEdgeCaseWithEmptyRegions.parameters = {
    kind: "legend category edge case with empty regions",
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
