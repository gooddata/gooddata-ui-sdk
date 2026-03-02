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
    title: "04 Stories For Pluggable Vis/GeoPushpinChart/customization/clusters",
};

export const ClusteredPoints = () =>
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
                ],
                filters: [],
                identifier: "GeoPushpinChart.d536b0836471901d33dcd7d55c459e2b",
                properties: {
                    controls: {
                        latitude: "f_city.id.latitude",
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
                        points: {
                            groupNearbyPoints: true,
                        },
                        tooltipText: "f_city.id.cityname",
                        viewport: {
                            area: "world",
                        },
                    },
                },
                sorts: [],
                title: "GeoPushpinChart - clustered points",
                uri: "GeoPushpinChart.d536b0836471901d33dcd7d55c459e2b",
                visualizationUrl: "local:pushpin",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 1, 0),
    )();
ClusteredPoints.parameters = {
    kind: "clustered points",
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

export const NonClusteredPoints = () =>
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
                ],
                filters: [],
                identifier: "GeoPushpinChart.5834d3468e0d2141b08c9e44ecaa6697",
                properties: {
                    controls: {
                        latitude: "f_city.id.latitude",
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
                        points: {
                            groupNearbyPoints: false,
                        },
                        tooltipText: "f_city.id.cityname",
                        viewport: {
                            area: "world",
                        },
                    },
                },
                sorts: [],
                title: "GeoPushpinChart - non-clustered points",
                uri: "GeoPushpinChart.5834d3468e0d2141b08c9e44ecaa6697",
                visualizationUrl: "local:pushpin",
            },
        } as unknown as IInsight,
        getScenariosGroupByIndexes(12, 1, 1),
    )();
NonClusteredPoints.parameters = {
    kind: "non-clustered points",
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
