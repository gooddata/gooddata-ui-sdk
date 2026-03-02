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
    title: "04 Stories For Pluggable Vis/GeoAreaChart/customization/viewport",
};

export const AreaViewportNorthAmerica = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "country.country_code",
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
                identifier: "GeoAreaChart.3985ba32dfa5ff2a946c7a49c5b837b2",
                properties: {
                    controls: {
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
                title: "GeoAreaChart - area viewport north america",
                uri: "GeoAreaChart.3985ba32dfa5ff2a946c7a49c5b837b2",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 3, 0),
    )();
AreaViewportNorthAmerica.parameters = {
    kind: "area viewport north america",
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

export const AreaViewportWorld = () =>
    plugVizStory(
        {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                attribute: {
                                    displayForm: {
                                        identifier: "country.country_code",
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
                identifier: "GeoAreaChart.0be13b5cb57cb3b17e9def4db8e2a53f",
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
                            area: "world",
                        },
                    },
                },
                sorts: [],
                title: "GeoAreaChart - area viewport world",
                uri: "GeoAreaChart.0be13b5cb57cb3b17e9def4db8e2a53f",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 3, 1),
    )();
AreaViewportWorld.parameters = {
    kind: "area viewport world",
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
