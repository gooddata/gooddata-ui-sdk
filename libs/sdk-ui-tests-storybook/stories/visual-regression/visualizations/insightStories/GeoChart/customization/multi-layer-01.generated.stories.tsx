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
    title: "04 Stories For Pluggable Vis/GeoChart/customization/multi-layer",
};

export const AreaPrimaryWithPushpinOverlay = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "state_id.statecode",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "geo.area",
                                },
                            },
                        ],
                        localIdentifier: "area",
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
                identifier: "GeoChart.408635f5315222f713c811fe94582c9b",
                layers: [
                    {
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
                                localIdentifier: "latitude",
                            },
                            {
                                items: [
                                    {
                                        attribute: {
                                            displayForm: {
                                                identifier: "f_city.id.longitude",
                                                type: "displayForm",
                                            },
                                            localIdentifier: "a_f_city.id.longitude",
                                        },
                                    },
                                ],
                                localIdentifier: "longitude",
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
                                                identifier: "f_city.id.cityname",
                                                type: "displayForm",
                                            },
                                            localIdentifier: "a_f_city.id.cityname",
                                        },
                                    },
                                ],
                                localIdentifier: "tooltipText",
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
                        id: "pushpin-layer",
                        type: "pushpin",
                    },
                ],
                properties: {
                    controls: {
                        areas: {
                            borderColor: "#000000",
                            borderWidth: 2,
                            fillOpacity: 0.9,
                        },
                        legend: {
                            position: "right",
                        },
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
                        viewport: {
                            area: "continent_na",
                        },
                    },
                },
                sorts: [],
                title: "GeoChart - area primary with pushpin overlay",
                uri: "GeoChart.408635f5315222f713c811fe94582c9b",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 1, 0),
    )();
AreaPrimaryWithPushpinOverlay.parameters = {
    kind: "area primary with pushpin overlay",
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

export const AreaPrimaryWithTwoPushpinOverlays = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "state_id.statecode",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "geo.area",
                                },
                            },
                        ],
                        localIdentifier: "area",
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
                identifier: "GeoChart.e47963abcc763a71caa697cff2d567fd",
                layers: [
                    {
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
                                localIdentifier: "latitude",
                            },
                            {
                                items: [
                                    {
                                        attribute: {
                                            displayForm: {
                                                identifier: "f_city.id.longitude",
                                                type: "displayForm",
                                            },
                                            localIdentifier: "a_f_city.id.longitude",
                                        },
                                    },
                                ],
                                localIdentifier: "longitude",
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
                                                identifier: "f_city.id.cityname",
                                                type: "displayForm",
                                            },
                                            localIdentifier: "a_f_city.id.cityname",
                                        },
                                    },
                                ],
                                localIdentifier: "tooltipText",
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
                        id: "pushpin-layer",
                        type: "pushpin",
                    },
                    {
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
                                localIdentifier: "latitude",
                            },
                            {
                                items: [
                                    {
                                        attribute: {
                                            displayForm: {
                                                identifier: "f_city.id.longitude",
                                                type: "displayForm",
                                            },
                                            localIdentifier: "a_f_city.id.longitude",
                                        },
                                    },
                                ],
                                localIdentifier: "longitude",
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
                                localIdentifier: "tooltipText",
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
                        id: "pushpin-layer-2",
                        type: "pushpin",
                    },
                ],
                properties: {
                    controls: {
                        areas: {
                            borderColor: "#000000",
                            borderWidth: 2,
                            fillOpacity: 0.9,
                        },
                        legend: {
                            position: "right",
                        },
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
                        viewport: {
                            area: "continent_na",
                        },
                    },
                },
                sorts: [],
                title: "GeoChart - area primary with two pushpin overlays",
                uri: "GeoChart.e47963abcc763a71caa697cff2d567fd",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 1, 1),
    )();
AreaPrimaryWithTwoPushpinOverlays.parameters = {
    kind: "area primary with two pushpin overlays",
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

export const MultiLayerChartLevelSegmentMapping = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "state_id.statecode",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "geo.area",
                                },
                            },
                        ],
                        localIdentifier: "area",
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
                identifier: "GeoChart.eafdff297dd058f0f113ff6ba0ecc095",
                layers: [
                    {
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
                                localIdentifier: "latitude",
                            },
                            {
                                items: [
                                    {
                                        attribute: {
                                            displayForm: {
                                                identifier: "f_city.id.longitude",
                                                type: "displayForm",
                                            },
                                            localIdentifier: "a_f_city.id.longitude",
                                        },
                                    },
                                ],
                                localIdentifier: "longitude",
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
                                localIdentifier: "tooltipText",
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
                        id: "pushpin-layer-2",
                        type: "pushpin",
                    },
                ],
                properties: {
                    controls: {
                        areas: {
                            borderColor: "#000000",
                            borderWidth: 2,
                            fillOpacity: 0.9,
                        },
                        colorMapping: [
                            {
                                color: {
                                    type: "rgb",
                                    value: {
                                        b: 95,
                                        g: 170,
                                        r: 0,
                                    },
                                },
                            },
                            {
                                color: {
                                    type: "rgb",
                                    value: {
                                        b: 87,
                                        g: 87,
                                        r: 235,
                                    },
                                },
                            },
                        ],
                        legend: {
                            position: "right",
                        },
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
                        viewport: {
                            area: "continent_na",
                        },
                    },
                },
                sorts: [],
                title: "GeoChart - multi-layer chart-level segment mapping",
                uri: "GeoChart.eafdff297dd058f0f113ff6ba0ecc095",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 1, 2),
    )();
MultiLayerChartLevelSegmentMapping.parameters = {
    kind: "multi-layer chart-level segment mapping",
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

export const MultiLayerPerLayerSegmentMappingOverride = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "state_id.statecode",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "geo.area",
                                },
                            },
                        ],
                        localIdentifier: "area",
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
                identifier: "GeoChart.85d85b6bb96c8a2bcbbef992e5b4871b",
                layers: [
                    {
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
                                localIdentifier: "latitude",
                            },
                            {
                                items: [
                                    {
                                        attribute: {
                                            displayForm: {
                                                identifier: "f_city.id.longitude",
                                                type: "displayForm",
                                            },
                                            localIdentifier: "a_f_city.id.longitude",
                                        },
                                    },
                                ],
                                localIdentifier: "longitude",
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
                                localIdentifier: "tooltipText",
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
                        id: "pushpin-layer-override",
                        properties: {
                            controls: {
                                colorMapping: [
                                    {
                                        color: {
                                            type: "rgb",
                                            value: {
                                                b: 20,
                                                g: 20,
                                                r: 20,
                                            },
                                        },
                                        id: "mapping-0",
                                    },
                                    {
                                        color: {
                                            type: "rgb",
                                            value: {
                                                b: 0,
                                                g: 140,
                                                r: 255,
                                            },
                                        },
                                        id: "mapping-1",
                                    },
                                ],
                            },
                        },
                        type: "pushpin",
                    },
                ],
                properties: {
                    controls: {
                        areas: {
                            borderColor: "#000000",
                            borderWidth: 2,
                            fillOpacity: 0.9,
                        },
                        colorMapping: [
                            {
                                color: {
                                    type: "rgb",
                                    value: {
                                        b: 95,
                                        g: 170,
                                        r: 0,
                                    },
                                },
                            },
                            {
                                color: {
                                    type: "rgb",
                                    value: {
                                        b: 87,
                                        g: 87,
                                        r: 235,
                                    },
                                },
                            },
                        ],
                        legend: {
                            position: "right",
                        },
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
                        viewport: {
                            area: "continent_na",
                        },
                    },
                },
                sorts: [],
                title: "GeoChart - multi-layer per-layer segment mapping override",
                uri: "GeoChart.85d85b6bb96c8a2bcbbef992e5b4871b",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 1, 3),
    )();
MultiLayerPerLayerSegmentMappingOverride.parameters = {
    kind: "multi-layer per-layer segment mapping override",
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
