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
    title: "04 Stories For Pluggable Vis/GeoAreaChart/customization/color",
};

export const AreaChartLevelCustomSegmentMapping = () =>
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
                identifier: "GeoAreaChart.fd2f906e5c8a51c9734bc745c3cc5fa1",
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
                title: "GeoAreaChart - area chart-level custom segment mapping",
                uri: "GeoAreaChart.fd2f906e5c8a51c9734bc745c3cc5fa1",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 0),
    )();
AreaChartLevelCustomSegmentMapping.parameters = {
    kind: "area chart-level custom segment mapping",
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

export const AreaChartLevelCustomGradientPalette = () =>
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
                identifier: "GeoAreaChart.60b110131a437a26781d095391e04b0a",
                properties: {
                    controls: {
                        areas: {
                            borderColor: "#000000",
                            borderWidth: 2,
                            fillOpacity: 0.9,
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
                title: "GeoAreaChart - area chart-level custom gradient palette",
                uri: "GeoAreaChart.60b110131a437a26781d095391e04b0a",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 1),
    )();
AreaChartLevelCustomGradientPalette.parameters = {
    kind: "area chart-level custom gradient palette",
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

export const AreaWithColorAttributeCategories = () =>
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
                                attribute: {
                                    displayForm: {
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                    localIdentifier: "a_f_owner.region_id",
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
                identifier: "GeoAreaChart.a6329e977538ade1062a41e4372e9dba",
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
                title: "GeoAreaChart - area with color attribute categories",
                uri: "GeoAreaChart.a6329e977538ade1062a41e4372e9dba",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 1, 2),
    )();
AreaWithColorAttributeCategories.parameters = {
    kind: "area with color attribute categories",
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
