// (C) 2026 GoodData Corporation

import { type IInsight } from "@gooddata/sdk-model";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/dropdown_icons.css";

import { type IStoryParameters, State } from "../../../../../../../stories/_infra/backstopScenario.js";
import {
    getScenariosGroupByIndexes,
    plugVizStory,
} from "../../../../../../../stories/visual-regression/visualizations/insightStories.js";
import "../../../../../../..//stories/visual-regression/visualizations/insightStories.css";

export default {
    title: "04 Stories For Pluggable Vis/GeoChart/customization/color/layer-config",
};

export const AreaLayerLevelSegmentMappingOverridesChartLevel = () =>
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
                identifier: "GeoChart.deea35ee0ff36f4286ba9c898047d4f6",
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
                title: "GeoChart - area layer-level segment mapping overrides chart-level",
                uri: "GeoChart.deea35ee0ff36f4286ba9c898047d4f6",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 0, 0),
    )();
AreaLayerLevelSegmentMappingOverridesChartLevel.parameters = {
    kind: "area layer-level segment mapping overrides chart-level",
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

export const AreaLayerLevelGradientPaletteOverridesChartLevel = () =>
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
                ],
                filters: [],
                identifier: "GeoChart.82bc11be13ff0ba30b513983ff398046",
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
                title: "GeoChart - area layer-level gradient palette overrides chart-level",
                uri: "GeoChart.82bc11be13ff0ba30b513983ff398046",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 0, 1),
    )();
AreaLayerLevelGradientPaletteOverridesChartLevel.parameters = {
    kind: "area layer-level gradient palette overrides chart-level",
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

export const PushpinLayerLevelSegmentMappingOverridesChartLevel = () =>
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
                identifier: "GeoChart.1b1e9fb7694fa25de62c64b8fab0df98",
                properties: {
                    controls: {
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
                title: "GeoChart - pushpin layer-level segment mapping overrides chart-level",
                uri: "GeoChart.1b1e9fb7694fa25de62c64b8fab0df98",
                visualizationUrl: "local:pushpin",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 0, 2),
    )();
PushpinLayerLevelSegmentMappingOverridesChartLevel.parameters = {
    kind: "pushpin layer-level segment mapping overrides chart-level",
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

export const PushpinLayerLevelGradientPaletteOverridesChartLevel = () =>
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
                        localIdentifier: "color",
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
                identifier: "GeoChart.52df9fa11a3f1f3589d2dcd4d4c14d00",
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
                title: "GeoChart - pushpin layer-level gradient palette overrides chart-level",
                uri: "GeoChart.52df9fa11a3f1f3589d2dcd4d4c14d00",
                visualizationUrl: "local:pushpin",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 0, 3),
    )();
PushpinLayerLevelGradientPaletteOverridesChartLevel.parameters = {
    kind: "pushpin layer-level gradient palette overrides chart-level",
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

export const MultiLayerBothInheritChartLevelColors = () =>
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
                identifier: "GeoChart.6978d23e9fac3f9b74ecd3f89c7374cd",
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
                title: "GeoChart - multi-layer both inherit chart-level colors",
                uri: "GeoChart.6978d23e9fac3f9b74ecd3f89c7374cd",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 0, 4),
    )();
MultiLayerBothInheritChartLevelColors.parameters = {
    kind: "multi-layer both inherit chart-level colors",
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

export const MultiLayerPushpinOverrideOnly = () =>
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
                identifier: "GeoChart.781c89d454c9a9ce193902883aee7549",
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
                        id: "pushpin-layer",
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
                title: "GeoChart - multi-layer pushpin override only",
                uri: "GeoChart.781c89d454c9a9ce193902883aee7549",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 0, 5),
    )();
MultiLayerPushpinOverrideOnly.parameters = {
    kind: "multi-layer pushpin override only",
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

export const MultiLayerAreaOverrideOnly = () =>
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
                identifier: "GeoChart.1453572fe8d171ddfb09ce522255fc9a",
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
                title: "GeoChart - multi-layer area override only",
                uri: "GeoChart.1453572fe8d171ddfb09ce522255fc9a",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 0, 6),
    )();
MultiLayerAreaOverrideOnly.parameters = {
    kind: "multi-layer area override only",
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

export const MultiLayerBothLayerOverridesWithConflictingChartFallback = () =>
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
                identifier: "GeoChart.1799ddde88c93b48c5b0b5a893beadbf",
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
                        id: "pushpin-layer",
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
                                colorPalette: [
                                    {
                                        fill: {
                                            b: 193,
                                            g: 48,
                                            r: 86,
                                        },
                                        guid: "layer-01",
                                    },
                                    {
                                        fill: {
                                            b: 230,
                                            g: 70,
                                            r: 120,
                                        },
                                        guid: "layer-02",
                                    },
                                    {
                                        fill: {
                                            b: 235,
                                            g: 93,
                                            r: 190,
                                        },
                                        guid: "layer-03",
                                    },
                                    {
                                        fill: {
                                            b: 170,
                                            g: 120,
                                            r: 255,
                                        },
                                        guid: "layer-04",
                                    },
                                    {
                                        fill: {
                                            b: 120,
                                            g: 73,
                                            r: 255,
                                        },
                                        guid: "layer-05",
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
                title: "GeoChart - multi-layer both layer overrides with conflicting chart fallback",
                uri: "GeoChart.1799ddde88c93b48c5b0b5a893beadbf",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(11, 0, 7),
    )();
MultiLayerBothLayerOverridesWithConflictingChartFallback.parameters = {
    kind: "multi-layer both layer overrides with conflicting chart fallback",
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
