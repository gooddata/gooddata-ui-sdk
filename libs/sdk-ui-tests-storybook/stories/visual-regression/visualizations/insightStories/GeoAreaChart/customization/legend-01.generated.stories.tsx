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
    title: "04 Stories For Pluggable Vis/GeoAreaChart/customization/legend",
};

export const AreaLegendWithSelection = () =>
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
                identifier: "GeoAreaChart.55c40cdb5c0ae31c93c348da5a9e4c01",
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
                        selectedSegmentItems: ["West Coast", "East Coast"],
                        viewport: {
                            area: "continent_na",
                        },
                    },
                },
                sorts: [],
                title: "GeoAreaChart - area legend with selection",
                uri: "GeoAreaChart.55c40cdb5c0ae31c93c348da5a9e4c01",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 2, 4),
    )();
AreaLegendWithSelection.parameters = {
    kind: "area legend with selection",
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

export const AreaLegendWithColorScaleOnly = () =>
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
                identifier: "GeoAreaChart.d9721f4cb94e76b8c4a6ece58db3f98d",
                properties: {
                    controls: {
                        areas: {
                            borderColor: "#000000",
                            borderWidth: 2,
                            fillOpacity: 0.9,
                        },
                        legend: {
                            position: "bottom",
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
                title: "GeoAreaChart - area legend with color-scale only",
                uri: "GeoAreaChart.d9721f4cb94e76b8c4a6ece58db3f98d",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 2, 5),
    )();
AreaLegendWithColorScaleOnly.parameters = {
    kind: "area legend with color-scale only",
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

export const AreaLegendWithCategoryAndColorScale = () =>
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
                identifier: "GeoAreaChart.669bdd0538fb74c508a22f2883810c88",
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
                title: "GeoAreaChart - area legend with category and color-scale",
                uri: "GeoAreaChart.669bdd0538fb74c508a22f2883810c88",
                visualizationUrl: "local:choropleth",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(10, 2, 6),
    )();
AreaLegendWithCategoryAndColorScale.parameters = {
    kind: "area legend with category and color-scale",
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
