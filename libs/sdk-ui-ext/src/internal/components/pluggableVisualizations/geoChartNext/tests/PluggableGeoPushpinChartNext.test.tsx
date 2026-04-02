// (C) 2025-2026 GoodData Corporation

import type { ReactElement } from "react";

import { waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    type IInsightDefinition,
    localIdRef,
    newAttribute,
    newAttributeSort,
    newBucket,
    newInsightDefinition,
    newMeasure,
    newMeasureValueFilter,
    newMeasureValueFilterWithOptions,
    uriRef,
} from "@gooddata/sdk-model";
import { BucketNames, GeoLocationMissingSdkError } from "@gooddata/sdk-ui";
import { GeoChartInternal, PUSHPIN_LAYER_ID } from "@gooddata/sdk-ui-geo/internal";

import {
    type IBucketItem,
    type IReferencePoint,
    type IVisConstruct,
} from "../../../../interfaces/Visualization.js";
import {
    firstMeasureArithmeticNoAttributeReferencePoint,
    samePeriodPreviousYearRefPoint,
    twoMeasuresWithShowInPercentOnSecondaryAxisReferencePoint,
} from "../../../../tests/mocks/referencePointMocks.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import { GeoPushpinConfigurationPanel } from "../../../configurationPanels/GeoPushpinConfigurationPanel.js";
import {
    type ICreateComponentOverrides,
    fireAndExpectNoViewportSync,
    fireAndExpectViewportSync,
} from "../../geoCommon/tests/viewportSync.test.helpers.js";
import { PluggableGeoPushpinChartNext } from "../PluggableGeoPushpinChartNext.js";

const PROJECT_ID = "PROJECTID";
const visualizationUrl = "local:pushpin";

function createLocationBucketItem(localIdentifier = "a_location"): IBucketItem {
    return {
        localIdentifier,
        type: "attribute",
        attribute: "attr.region",
        dfRef: uriRef(`/df/${localIdentifier}`),
        locationDisplayFormRef: uriRef(`/df/${localIdentifier}.location`),
    };
}

function createMetricBucketItem(localIdentifier = "m1"): IBucketItem {
    return {
        localIdentifier,
        type: "metric",
        attribute: `measure.${localIdentifier}`,
        aggregation: undefined,
        showInPercent: undefined,
        showOnSecondaryAxis: undefined,
    };
}

describe("PluggableGeoPushpinChartNext", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();

    const backend = dummyBackend();
    const executionFactory = backend.workspace(PROJECT_ID).execution();

    function createComponent(
        onError = vi.fn(),
        featureFlags?: IVisConstruct["featureFlags"],
        overrides?: ICreateComponentOverrides,
        backendOverride = backend,
    ) {
        const pushData = vi.fn();
        const props: IVisConstruct = {
            projectId: PROJECT_ID,
            element: () => mockElement,
            configPanelElement: () => mockConfigElement,
            callbacks: {
                afterRender: () => {},
                pushData,
                onError,
            },
            backend: backendOverride,
            featureFlags,
            environment: overrides?.environment,
            visualizationProperties: overrides?.visualizationProperties ?? {
                controls: {
                    latitude: "latitude_df",
                    longitude: "longitude_df",
                },
            },
            renderFun: mockRenderFun,
            messages,
        } as unknown as IVisConstruct;

        return { visualization: new PluggableGeoPushpinChartNext(props), onError, pushData };
    }

    function getConfigPanelCalls() {
        return mockRenderFun.mock.calls.filter(
            ([node]) => (node as ReactElement)?.type === GeoPushpinConfigurationPanel,
        );
    }

    function getLastConfigPanelProps(): ReactElement["props"] {
        const lastCall = getConfigPanelCalls().at(-1);
        if (!lastCall) {
            throw new Error("Missing configuration panel render call.");
        }

        return (lastCall[0] as ReactElement).props;
    }

    afterEach(async () => {
        await Promise.resolve();
        await Promise.resolve();
        mockRenderFun.mockReset();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    const insightWithoutLocation: IInsightDefinition = newInsightDefinition(visualizationUrl, (builder) =>
        builder.title("no location").buckets([newBucket(BucketNames.SIZE, newMeasure("m1"))]),
    );

    const insightWithLocation: IInsightDefinition = newInsightDefinition(visualizationUrl, (builder) =>
        builder
            .title("with location")
            .buckets([
                newBucket(
                    BucketNames.LOCATION,
                    newAttribute("attr.region", (attribute) => attribute.localId("a1")),
                ),
                newBucket(
                    BucketNames.SIZE,
                    newMeasure("m1", (m) => m.localId("m_size")),
                ),
            ])
            .properties({
                controls: {
                    latitude: "latitude_df",
                    longitude: "longitude_df",
                },
            }),
    );

    const insightWithLocationAndSegment: IInsightDefinition = newInsightDefinition(
        visualizationUrl,
        (builder) =>
            builder
                .title("with location and segment")
                .buckets([
                    newBucket(
                        BucketNames.LOCATION,
                        newAttribute("attr.region", (attribute) => attribute.localId("a1")),
                    ),
                    newBucket(
                        BucketNames.SEGMENT,
                        newAttribute("attr.category", (attribute) => attribute.localId("a_segment")),
                    ),
                ])
                .properties({
                    controls: {
                        latitude: "latitude_df",
                        longitude: "longitude_df",
                    },
                }),
    );

    const insightWithLocationAndTooltipMetric: IInsightDefinition = newInsightDefinition(
        visualizationUrl,
        (builder) =>
            builder
                .title("with location and tooltip metric")
                .buckets([
                    newBucket(
                        BucketNames.LOCATION,
                        newAttribute("attr.region", (attribute) => attribute.localId("a1")),
                    ),
                    newBucket(
                        BucketNames.MEASURES,
                        newMeasure("m1", (m) => m.localId("m_tooltip")),
                    ),
                ])
                .properties({
                    controls: {
                        latitude: "latitude_df",
                        longitude: "longitude_df",
                    },
                }),
    );

    it("should surface GeoLocationMissingSdkError when location bucket is empty", () => {
        const onError = vi.fn();
        const { visualization } = createComponent(onError);

        visualization.update({ messages }, insightWithoutLocation, {}, executionFactory);

        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(expect.any(GeoLocationMissingSdkError));
    });

    it("should surface GeoLocationMissingSdkError when lat/long controls are missing", () => {
        const onError = vi.fn();
        const { visualization } = createComponent(onError);

        const insightWithMissingLatLong: IInsightDefinition = newInsightDefinition(
            visualizationUrl,
            (builder) =>
                builder
                    .title("missing lat/long controls")
                    .buckets([
                        newBucket(
                            BucketNames.LOCATION,
                            newAttribute("attr.region", (attribute) => attribute.localId("a1")),
                        ),
                        newBucket(
                            BucketNames.SIZE,
                            newMeasure("m1", (m) => m.localId("m_size")),
                        ),
                    ])
                    .properties({
                        controls: {
                            // Intentionally missing latitude/longitude
                        },
                    }),
        );

        visualization.update({ messages }, insightWithMissingLatLong, {}, executionFactory);

        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(expect.any(GeoLocationMissingSdkError));
    });

    it("should proceed without errors when location bucket is present", () => {
        const onError = vi.fn();
        const { visualization } = createComponent(onError);

        expect(() =>
            visualization.update({ messages }, insightWithLocation, {}, executionFactory),
        ).not.toThrow();

        expect(onError).not.toHaveBeenCalled();
    });

    it("should not move a non-geo attribute into SEGMENT when switching (no valid location)", async () => {
        const { visualization } = createComponent();

        const referencePoint: IReferencePoint = {
            buckets: [
                {
                    localIdentifier: BucketNames.VIEW,
                    items: [
                        {
                            localIdentifier: "a_view",
                            type: "attribute",
                            attribute: "attr.region",
                            dfRef: uriRef("/df/region"),
                            // no locationDisplayFormRef => not geo-capable
                        },
                    ],
                },
            ],
            filters: { localIdentifier: "filters", items: [] },
            properties: {},
        };

        const extended = await visualization.getExtendedReferencePoint(referencePoint);
        const segmentBucket = extended.buckets.find((b) => b.localIdentifier === BucketNames.SEGMENT);
        expect(segmentBucket?.items ?? []).toEqual([]);
    });

    it("should not treat an area-only attribute as location when switching", async () => {
        const { visualization } = createComponent();

        const referencePoint: IReferencePoint = {
            buckets: [
                {
                    localIdentifier: BucketNames.VIEW,
                    items: [
                        {
                            localIdentifier: "a_region",
                            type: "attribute",
                            attribute: "attr.region",
                            dfRef: uriRef("/df/region_text"),
                            // This is set for geo-capable attributes, but for pushpin we must require lat+long.
                            locationDisplayFormRef: uriRef("/df/region_area"),
                            displayForms: [
                                {
                                    id: "attr.region_name",
                                    ref: uriRef("/df/region_text"),
                                    type: "GDC.text",
                                    title: "Region name",
                                    isDefault: true,
                                },
                                {
                                    id: "attr.region_area",
                                    ref: uriRef("/df/region_area"),
                                    type: "GDC.geo.area",
                                    title: "Region area",
                                    isDefault: false,
                                },
                            ],
                        },
                    ],
                },
            ],
            filters: { localIdentifier: "filters", items: [] },
            properties: {},
        };

        const extended = await visualization.getExtendedReferencePoint(referencePoint);
        const locationBucket = extended.buckets.find((b) => b.localIdentifier === BucketNames.LOCATION);
        expect(locationBucket?.items ?? []).toEqual([]);
    });

    it("should render GeoChartNext with pushpin layer metadata", () => {
        const { visualization } = createComponent();

        visualization.update({ messages }, insightWithLocation, {}, executionFactory);

        expect(mockRenderFun).toHaveBeenCalled();
        const chartCall = mockRenderFun.mock.calls.find(
            ([node]) => (node as ReactElement)?.type === GeoChartInternal,
        );

        expect(chartCall).toBeDefined();
        const element = chartCall?.[0] as ReactElement;
        const props = element.props as {
            execution?: {
                context?: { id?: string };
            };
            executions?: unknown[];
            type?: string;
        };
        expect(props.type).toBe("pushpin");
        expect(props.execution).toBeDefined();
        expect(props.executions).toEqual([]);
        expect(props.execution?.context?.id).toBe(PUSHPIN_LAYER_ID);
    });

    it("should resolve clustering to false for rendering and the panel when tooltip measures are present", () => {
        const { visualization } = createComponent(vi.fn(), undefined, {
            visualizationProperties: {
                controls: {
                    latitude: "latitude_df",
                    longitude: "longitude_df",
                },
            },
        });

        visualization.update({ messages }, insightWithLocationAndTooltipMetric, {}, executionFactory);

        const chartCall = mockRenderFun.mock.calls.find(
            ([node]) => (node as ReactElement)?.type === GeoChartInternal,
        );
        expect(chartCall).toBeDefined();
        if (!chartCall) {
            throw new Error("Missing GeoChartInternal render call.");
        }

        const chartProps = (chartCall[0] as ReactElement).props as {
            config?: { points?: { groupNearbyPoints?: boolean } };
        };
        expect(chartProps.config?.points?.groupNearbyPoints).toBe(false);

        const configPanelProps = getLastConfigPanelProps() as {
            properties?: { controls?: { points?: { groupNearbyPoints?: boolean } } };
        };

        expect(configPanelProps.properties?.controls?.points?.groupNearbyPoints).toBe(false);
    });

    it("should regenerate the reference point when pushpin points controls change", () => {
        const { visualization } = createComponent(undefined, { enableGeoPushpinIcon: true });

        expect(
            visualization.haveSomePropertiesRelevantForReferencePointChanged(
                {
                    buckets: [],
                    filters: { localIdentifier: "filters", items: [] },
                    properties: {
                        controls: {
                            points: {
                                shapeType: "oneIcon",
                            },
                        },
                    },
                },
                {
                    buckets: [],
                    filters: { localIdentifier: "filters", items: [] },
                    properties: {
                        controls: {
                            points: {
                                shapeType: "circle",
                            },
                        },
                    },
                },
            ),
        ).toBe(true);
    });

    it("should not regenerate the reference point when only non-structural pushpin controls change", () => {
        const { visualization } = createComponent(undefined, { enableGeoPushpinIcon: true });

        expect(
            visualization.haveSomePropertiesRelevantForReferencePointChanged(
                {
                    buckets: [],
                    filters: { localIdentifier: "filters", items: [] },
                    properties: {
                        controls: {
                            points: {
                                shapeType: "oneIcon",
                                icon: "airport",
                                groupNearbyPoints: true,
                                minSize: "default",
                                maxSize: "normal",
                            },
                        },
                    },
                },
                {
                    buckets: [],
                    filters: { localIdentifier: "filters", items: [] },
                    properties: {
                        controls: {
                            points: {
                                shapeType: "oneIcon",
                                icon: "harbor",
                                groupNearbyPoints: false,
                                minSize: "1.25x",
                                maxSize: "1.5x",
                            },
                        },
                    },
                },
            ),
        ).toBe(false);
    });

    it("should rerender the configuration panel after sprite icons load", async () => {
        const getDefaultStyleSpriteIcons = vi.fn().mockResolvedValue(["airport", "harbor"]);
        const spriteBackend = {
            ...backend,
            geo: () => ({
                ...backend.geo(),
                getDefaultStyleSpriteIcons,
            }),
        };

        const { visualization } = createComponent(
            vi.fn(),
            {
                enableGeoPushpinIcon: true,
                geoIconSheet: "https://sprites.test/map",
            },
            undefined,
            spriteBackend,
        );

        visualization.update({ messages }, insightWithLocation, {}, executionFactory);

        expect(getConfigPanelCalls()).toHaveLength(1);
        expect((getConfigPanelCalls()[0][0] as ReactElement).props).toMatchObject({
            spriteIcons: [],
        });

        await waitFor(() => {
            expect(getConfigPanelCalls().length).toBeGreaterThan(1);
            expect(getLastConfigPanelProps()).toMatchObject({
                spriteIcons: [
                    { title: "airport", value: "airport" },
                    { title: "harbor", value: "harbor" },
                ],
            });
        });

        expect(getDefaultStyleSpriteIcons).toHaveBeenCalledTimes(1);
    });

    it("should clear stale sprite icons when the sprite URL is removed", async () => {
        const spriteBackend = {
            ...backend,
            geo: () => ({
                ...backend.geo(),
                getDefaultStyleSpriteIcons: vi.fn().mockResolvedValue(["airport"]),
            }),
        };

        const { visualization } = createComponent(
            vi.fn(),
            {
                enableGeoPushpinIcon: true,
                geoIconSheet: "https://sprites.test/map",
            },
            undefined,
            spriteBackend,
        );

        visualization.update({ messages }, insightWithLocation, {}, executionFactory);

        await waitFor(() => {
            expect(getLastConfigPanelProps()).toMatchObject({
                spriteIcons: [{ title: "airport", value: "airport" }],
            });
        });

        (visualization as unknown as { featureFlags: Record<string, unknown> }).featureFlags = {
            enableGeoPushpinIcon: true,
        };

        visualization.update({ messages }, insightWithLocation, {}, executionFactory);

        expect(getLastConfigPanelProps()).toMatchObject({
            spriteIcons: [],
        });
    });

    it("should pass legacy tileset insight properties to the configuration panel as a basemap fallback", () => {
        const { visualization } = createComponent();
        const insightWithLegacyTileset = newInsightDefinition(visualizationUrl, (builder) =>
            builder
                .title("with legacy tileset")
                .buckets([
                    newBucket(
                        BucketNames.LOCATION,
                        newAttribute("attr.region", (attribute) => attribute.localId("a1")),
                    ),
                ])
                .properties({
                    controls: {
                        latitude: "latitude_df",
                        longitude: "longitude_df",
                        tileset: "satellite",
                    },
                }),
        );

        visualization.update({ messages }, insightWithLegacyTileset, {}, executionFactory);

        const configPanelCall = mockRenderFun.mock.calls.find(([node]) => {
            const props = (node as ReactElement).props as {
                properties?: { controls?: { tileset?: string } };
            };
            return props.properties?.controls?.tileset === "satellite";
        });

        expect(configPanelCall).toBeDefined();
    });

    it("should preserve live viewport on rerender when viewport config is enabled", () => {
        const { visualization } = createComponent(vi.fn(), {
            enableGeoChartsViewportConfig: true,
        });
        const insightWithSavedViewport = newInsightDefinition(visualizationUrl, (builder) =>
            builder
                .title("with saved viewport")
                .buckets([
                    newBucket(
                        BucketNames.LOCATION,
                        newAttribute("attr.region", (attribute) => attribute.localId("a1")),
                    ),
                    newBucket(
                        BucketNames.SIZE,
                        newMeasure("m1", (m) => m.localId("m_size")),
                    ),
                ])
                .properties({
                    controls: {
                        latitude: "latitude_df",
                        longitude: "longitude_df",
                        center: { lat: 48.1, lng: 17.1 },
                        zoom: 4,
                    },
                }),
        );

        visualization.update({ messages }, insightWithSavedViewport, {}, executionFactory);

        const firstChartCall = [...mockRenderFun.mock.calls]
            .reverse()
            .find(([node]) => (node as ReactElement)?.type === GeoChartInternal);
        expect(firstChartCall).toBeDefined();
        if (!firstChartCall) {
            throw new Error("Missing GeoChartInternal render call.");
        }

        const firstChartProps = (firstChartCall[0] as ReactElement).props as {
            onCenterPositionChanged?: (center: { lat: number; lng: number }) => void;
            onZoomChanged?: (zoom: number) => void;
        };
        const liveCenter = { lat: 50.09, lng: 14.42 };
        const liveZoom = 7;

        firstChartProps.onCenterPositionChanged?.(liveCenter);
        firstChartProps.onZoomChanged?.(liveZoom);

        const insightWithUnrelatedControlChange = newInsightDefinition(visualizationUrl, (builder) =>
            builder
                .title("with saved viewport")
                .buckets([
                    newBucket(
                        BucketNames.LOCATION,
                        newAttribute("attr.region", (attribute) => attribute.localId("a1")),
                    ),
                    newBucket(
                        BucketNames.SIZE,
                        newMeasure("m1", (m) => m.localId("m_size")),
                    ),
                ])
                .properties({
                    controls: {
                        latitude: "latitude_df",
                        longitude: "longitude_df",
                        center: { lat: 48.1, lng: 17.1 },
                        zoom: 4,
                        legend: {
                            enabled: false,
                        },
                    },
                }),
        );

        visualization.update(
            {
                messages,
                config: {
                    separators: {
                        thousand: ",",
                        decimal: ".",
                    },
                },
            },
            insightWithUnrelatedControlChange,
            {},
            executionFactory,
        );

        const configPanelCall = [...mockRenderFun.mock.calls].reverse().find(([node]) => {
            const props = (node as ReactElement).props as {
                getCurrentMapView?: () => { center?: { lat: number; lng: number }; zoom?: number };
            };
            return typeof props.getCurrentMapView === "function";
        });
        expect(configPanelCall).toBeDefined();
        if (!configPanelCall) {
            throw new Error("Missing configuration panel render call.");
        }

        const configPanelProps = (configPanelCall[0] as ReactElement).props as {
            getCurrentMapView?: () => { center?: { lat: number; lng: number }; zoom?: number };
        };

        expect(configPanelProps.getCurrentMapView?.()).toEqual({
            center: liveCenter,
            zoom: liveZoom,
        });
    });

    describe("viewport sync", () => {
        const pushpinBuckets = [
            newBucket(
                BucketNames.LOCATION,
                newAttribute("attr.region", (attribute) => attribute.localId("a1")),
            ),
            newBucket(
                BucketNames.SIZE,
                newMeasure("m1", (m) => m.localId("m_size")),
            ),
        ];

        function setupViewportTest(viewportArea: string, environment: "analyticalDesigner" | "dashboards") {
            const { visualization, pushData } = createComponent(
                vi.fn(),
                { enableGeoChartsViewportConfig: true },
                {
                    environment,
                    visualizationProperties: {
                        controls: {
                            latitude: "latitude_df",
                            longitude: "longitude_df",
                            viewport: { area: viewportArea },
                            center: { lat: 48.1, lng: 17.1 },
                            zoom: 4,
                        },
                    },
                },
            );

            const insight: IInsightDefinition = newInsightDefinition(visualizationUrl, (builder) =>
                builder
                    .title("viewport test")
                    .buckets(pushpinBuckets)
                    .properties({
                        controls: {
                            latitude: "latitude_df",
                            longitude: "longitude_df",
                            viewport: { area: viewportArea },
                            center: { lat: 48.1, lng: 17.1 },
                            zoom: 4,
                        },
                    }),
            );

            visualization.update({ messages, config: { isInEditMode: true } }, insight, {}, executionFactory);

            return { pushData };
        }

        it("should sync custom viewport center and zoom from map callbacks in AD", async () => {
            const { pushData } = setupViewportTest("custom", "analyticalDesigner");
            await fireAndExpectViewportSync(mockRenderFun, pushData, { lat: 50.09, lng: 14.42 }, 7);
        });

        it("should not sync center and zoom when viewport area is a preset", async () => {
            const { pushData } = setupViewportTest("continent_eu", "analyticalDesigner");
            await fireAndExpectNoViewportSync(mockRenderFun, pushData, { lat: 50.09, lng: 14.42 }, 7);
        });

        it("should not sync viewport when environment is not AD", async () => {
            const { pushData } = setupViewportTest("custom", "dashboards");
            await fireAndExpectNoViewportSync(mockRenderFun, pushData, { lat: 50.09, lng: 14.42 }, 7);
        });
    });
    it("should keep empty sort list when insight has no explicit sorts", () => {
        const { visualization } = createComponent();

        visualization.update({ messages }, insightWithLocationAndSegment, {}, executionFactory);

        const chartCall = mockRenderFun.mock.calls.find(
            ([node]) => (node as ReactElement)?.type === GeoChartInternal,
        );

        expect(chartCall).toBeDefined();
        const element = chartCall?.[0] as ReactElement;
        const props = element.props as {
            execution?: {
                context?: {
                    sortBy?: unknown[];
                };
            };
        };

        expect(props.execution?.context?.sortBy).toEqual([]);
    });

    it("should prefer explicit insight sorts over default segment sort", () => {
        const { visualization } = createComponent();
        const insightWithCustomSort = newInsightDefinition(visualizationUrl, (builder) =>
            builder
                .title("with custom sort")
                .buckets([
                    newBucket(
                        BucketNames.LOCATION,
                        newAttribute("attr.region", (attribute) => attribute.localId("a1")),
                    ),
                    newBucket(
                        BucketNames.SEGMENT,
                        newAttribute("attr.category", (attribute) => attribute.localId("a_segment")),
                    ),
                ])
                .sorts([newAttributeSort("a_segment", "desc")])
                .properties({
                    controls: {
                        latitude: "latitude_df",
                        longitude: "longitude_df",
                    },
                }),
        );

        visualization.update({ messages }, insightWithCustomSort, {}, executionFactory);

        const chartCall = mockRenderFun.mock.calls.find(
            ([node]) => (node as ReactElement)?.type === GeoChartInternal,
        );

        expect(chartCall).toBeDefined();
        const element = chartCall?.[0] as ReactElement;
        const props = element.props as {
            execution?: {
                context?: {
                    sortBy?: unknown[];
                };
            };
        };

        expect(props.execution?.context?.sortBy).toEqual([newAttributeSort("a_segment", "desc")]);
    });

    it("should derive latitude/longitude from layer controls when buckets only contain location", () => {
        const { visualization } = createComponent();

        const insightWithLayerControls = {
            ...insightWithLocation,
            insight: {
                ...insightWithLocation.insight,
                filters: [newMeasureValueFilter(localIdRef("m_size"), "GREATER_THAN", 0)],
                layers: [
                    {
                        id: "layer_pushpins",
                        name: "Pushpin layer",
                        type: "pushpin",
                        buckets: [
                            newBucket(
                                BucketNames.LOCATION,
                                newAttribute("customer_city.city_latitude", (attribute) =>
                                    attribute.localId("loc"),
                                ),
                            ),
                        ],
                        properties: {
                            controls: {
                                latitude: "customer_city.city_latitude",
                                longitude: "customer_city.city_longitude",
                            },
                        },
                    },
                ],
            },
        } as IInsightDefinition;

        visualization.update({ messages }, insightWithLayerControls, {}, executionFactory);

        const chartCall = mockRenderFun.mock.calls.find(
            ([node]) => (node as ReactElement)?.type === GeoChartInternal,
        );

        expect(chartCall).toBeDefined();
        const element = chartCall?.[0] as ReactElement;
        const props = element.props as {
            execution?: {
                context?: {
                    id?: string;
                    latitude?: unknown;
                    longitude?: unknown;
                    location?: unknown;
                };
            };
            executions?: Array<{ definition?: { filters?: unknown[] } }>;
        };
        const pushpinLayer = props.execution?.context;

        expect(pushpinLayer?.id).toBe(PUSHPIN_LAYER_ID);
        expect(pushpinLayer?.latitude).toBeDefined();
        expect(pushpinLayer?.longitude).toBeDefined();
        expect(pushpinLayer?.location).toBeUndefined();
        expect(props.executions).toBeDefined();
        expect(props.executions).toHaveLength(1);

        // Measure value filters must not be applied to layers that don't contain the referenced measure,
        // otherwise backend normalization fails ("dangling localId reference").
        const additionalLayerFilters = props.executions?.[0]?.definition?.filters ?? [];
        expect(additionalLayerFilters).toEqual([]);
    });

    it("should keep MVF dimensionality referencing LOCATION localId when LOCATION is replaced by LAT/LNG", () => {
        const { visualization } = createComponent();

        const locationLocalId = "loc";
        const measureLocalId = "m_size";
        const insightWithDimensionalityMvf: IInsightDefinition = newInsightDefinition(
            visualizationUrl,
            (builder) =>
                builder
                    .title("with mvf dimensionality")
                    .buckets([
                        newBucket(
                            BucketNames.LOCATION,
                            newAttribute("attr.region", (attribute) => attribute.localId(locationLocalId)),
                        ),
                        newBucket(
                            BucketNames.SIZE,
                            newMeasure("m1", (m) => m.localId(measureLocalId)),
                        ),
                    ])
                    .filters([
                        newMeasureValueFilterWithOptions(localIdRef(measureLocalId), {
                            operator: "GREATER_THAN",
                            value: 0,
                            dimensionality: [localIdRef(locationLocalId)],
                        }),
                    ])
                    .properties({
                        controls: {
                            latitude: "latitude_df",
                            longitude: "longitude_df",
                        },
                    }),
        );

        visualization.update({ messages }, insightWithDimensionalityMvf, {}, executionFactory);

        const chartCall = mockRenderFun.mock.calls.find(
            ([node]) => (node as ReactElement)?.type === GeoChartInternal,
        );

        expect(chartCall).toBeDefined();
        const element = chartCall?.[0] as ReactElement;
        const props = element.props as { execution?: { definition?: { filters?: unknown[] } } };
        const rootExecutionFilters = props.execution?.definition?.filters ?? [];

        // MVF must not be dropped due to dimensionality localId; LATITUDE keeps LOCATION localId.
        expect(rootExecutionFilters).toHaveLength(1);
    });

    it("should drop MVF for additional layers when dimensionality localId does not exist there", () => {
        const { visualization } = createComponent();

        const insightWithSharedMeasureAndLayer = {
            ...insightWithLocation,
            insight: {
                ...insightWithLocation.insight,
                // Dimensionality references the root LOCATION localId ("a1"). Additional layer uses different location localId.
                filters: [
                    newMeasureValueFilterWithOptions(localIdRef("m_size"), {
                        operator: "GREATER_THAN",
                        value: 0,
                        dimensionality: [localIdRef("a1")],
                    }),
                ],
                layers: [
                    {
                        id: "layer_pushpins",
                        name: "Pushpin layer",
                        type: "pushpin",
                        buckets: [
                            newBucket(
                                BucketNames.LOCATION,
                                newAttribute("customer_city.city_latitude", (attribute) =>
                                    attribute.localId("loc"),
                                ),
                            ),
                            newBucket(
                                BucketNames.SIZE,
                                newMeasure("m1", (m) => m.localId("m_size")),
                            ),
                        ],
                        properties: {
                            controls: {
                                latitude: "customer_city.city_latitude",
                                longitude: "customer_city.city_longitude",
                            },
                        },
                    },
                ],
            },
        } as IInsightDefinition;

        visualization.update({ messages }, insightWithSharedMeasureAndLayer, {}, executionFactory);

        const chartCall = mockRenderFun.mock.calls.find(
            ([node]) => (node as ReactElement)?.type === GeoChartInternal,
        );

        expect(chartCall).toBeDefined();
        const element = chartCall?.[0] as ReactElement;
        const props = element.props as {
            executions?: Array<{ definition?: { filters?: unknown[] } }>;
        };

        // Filter must be dropped for the additional layer because its dimensionality references attribute localId
        // not present in that layer (otherwise backend normalization would fail with dangling localId reference).
        const additionalLayerFilters = props.executions?.[0]?.definition?.filters ?? [];
        expect(additionalLayerFilters).toEqual([]);
    });

    describe("getExtendedReferencePoint (legacy parity cases)", () => {
        it("should keep drops available while clustering stays enabled", async () => {
            const { visualization } = createComponent(undefined, {
                enableGeoPushpinIcon: true,
            });

            const extendedReferencePoint = await visualization.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [createLocationBucketItem()],
                    },
                ],
                filters: { localIdentifier: "filters", items: [] },
                properties: {
                    controls: {
                        points: {
                            groupNearbyPoints: true,
                        },
                    },
                },
            });

            expect(extendedReferencePoint.uiConfig?.buckets[BucketNames.SIZE].canAddItems).toBe(true);
            expect(extendedReferencePoint.uiConfig?.buckets[BucketNames.COLOR].canAddItems).toBe(true);
            expect(extendedReferencePoint.uiConfig?.buckets[BucketNames.MEASURES].canAddItems).toBe(true);
            expect(extendedReferencePoint.uiConfig?.buckets[BucketNames.SEGMENT].canAddItems).toBe(true);
        });

        it("should disable invalid clustering when tooltip measures are present", async () => {
            const { visualization } = createComponent(undefined, {
                enableGeoPushpinIcon: true,
            });

            const extendedReferencePoint = await visualization.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [createLocationBucketItem()],
                    },
                    {
                        localIdentifier: BucketNames.MEASURES,
                        items: [createMetricBucketItem()],
                    },
                ],
                filters: { localIdentifier: "filters", items: [] },
                properties: {
                    controls: {
                        points: {
                            groupNearbyPoints: true,
                        },
                    },
                },
            });

            expect(extendedReferencePoint.properties?.controls?.["points"]?.groupNearbyPoints).toBe(false);
            expect(extendedReferencePoint.uiConfig?.buckets[BucketNames.MEASURES].canAddItems).toBe(true);
        });

        it("should keep size and color drops available for circle shape with a stale icon", async () => {
            const { visualization } = createComponent(undefined, {
                enableGeoPushpinIcon: true,
            });

            const extendedReferencePoint = await visualization.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [createLocationBucketItem()],
                    },
                ],
                filters: { localIdentifier: "filters", items: [] },
                properties: {
                    controls: {
                        points: {
                            shapeType: "circle",
                            icon: "airport",
                        },
                    },
                },
            });

            expect(extendedReferencePoint.uiConfig?.buckets[BucketNames.SIZE].canAddItems).toBe(true);
            expect(extendedReferencePoint.uiConfig?.buckets[BucketNames.COLOR].canAddItems).toBe(true);
        });

        it("should disable size and color drops for oneIcon shape", async () => {
            const { visualization } = createComponent(undefined, {
                enableGeoPushpinIcon: true,
            });

            const extendedReferencePoint = await visualization.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [createLocationBucketItem()],
                    },
                ],
                filters: { localIdentifier: "filters", items: [] },
                properties: {
                    controls: {
                        points: {
                            shapeType: "oneIcon",
                            icon: "airport",
                        },
                    },
                },
            });

            expect(extendedReferencePoint.uiConfig?.buckets[BucketNames.SIZE].canAddItems).toBe(false);
            expect(extendedReferencePoint.uiConfig?.buckets[BucketNames.COLOR].canAddItems).toBe(false);
        });

        it("should keep size and color drops available when visualization properties already switched to circle", async () => {
            const { visualization } = createComponent(undefined, {
                enableGeoPushpinIcon: true,
            });

            const insightWithCircleShape = newInsightDefinition(visualizationUrl, (builder) =>
                builder
                    .title("with circle shape")
                    .buckets([
                        newBucket(
                            BucketNames.LOCATION,
                            newAttribute("attr.region", (attribute) => attribute.localId("a1")),
                        ),
                    ])
                    .properties({
                        controls: {
                            latitude: "latitude_df",
                            longitude: "longitude_df",
                            points: {
                                shapeType: "circle",
                            },
                        },
                    }),
            );

            visualization.update({ messages }, insightWithCircleShape, {}, executionFactory);

            const extendedReferencePoint = await visualization.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [createLocationBucketItem()],
                    },
                ],
                filters: { localIdentifier: "filters", items: [] },
                properties: {
                    controls: {
                        points: {
                            shapeType: "oneIcon",
                            icon: "airport",
                        },
                    },
                },
            });

            expect(extendedReferencePoint.uiConfig?.buckets[BucketNames.SIZE].canAddItems).toBe(true);
            expect(extendedReferencePoint.uiConfig?.buckets[BucketNames.COLOR].canAddItems).toBe(true);
        });

        it("should reset showInPercent and showOnSecondaryAxis for size and color measures", async () => {
            const { visualization } = createComponent();
            const extendedReferencePoint = await visualization.getExtendedReferencePoint(
                twoMeasuresWithShowInPercentOnSecondaryAxisReferencePoint,
            );

            const sizeBucket = extendedReferencePoint.buckets.find(
                (b) => b.localIdentifier === BucketNames.SIZE,
            );
            const colorBucket = extendedReferencePoint.buckets.find(
                (b) => b.localIdentifier === BucketNames.COLOR,
            );

            expect(sizeBucket?.items[0]).toMatchObject({
                localIdentifier: "m3",
                showInPercent: null,
                showOnSecondaryAxis: null,
            });
            expect(colorBucket?.items[0]).toMatchObject({
                localIdentifier: "m4",
                showInPercent: null,
                showOnSecondaryAxis: null,
            });
        });

        it("should remove all derived measures", async () => {
            const { visualization } = createComponent();
            const extendedReferencePoint = await visualization.getExtendedReferencePoint(
                samePeriodPreviousYearRefPoint,
            );

            const measureLocalIds = extendedReferencePoint.buckets
                .flatMap((b) => b.items ?? [])
                .filter((i) => i.type === "metric")
                .map((i) => i.localIdentifier);

            expect(measureLocalIds).toEqual(["m1"]);
        });

        it("should remove all arithmetic measures", async () => {
            const { visualization } = createComponent();
            const extendedReferencePoint = await visualization.getExtendedReferencePoint(
                firstMeasureArithmeticNoAttributeReferencePoint,
            );

            const sizeBucket = extendedReferencePoint.buckets.find(
                (b) => b.localIdentifier === BucketNames.SIZE,
            );
            const colorBucket = extendedReferencePoint.buckets.find(
                (b) => b.localIdentifier === BucketNames.COLOR,
            );

            expect(sizeBucket?.items.map((i) => i.localIdentifier)).toEqual(["m1"]);
            expect(colorBucket?.items.map((i) => i.localIdentifier)).toEqual(["m2"]);
        });
    });

    it("should reset shapeType from iconByValue to circle when geo icon label is not available", async () => {
        const { visualization } = createComponent(undefined, {
            enableGeoPushpinIcon: true,
        });

        const extendedReferencePoint = await visualization.getExtendedReferencePoint({
            buckets: [
                {
                    localIdentifier: BucketNames.VIEW,
                    items: [
                        {
                            ...createLocationBucketItem(),
                            displayForms: [
                                {
                                    id: "attr.region.latitude",
                                    ref: uriRef("/df/latitude"),
                                    type: "GDC.geo.pin_latitude",
                                    title: "Latitude",
                                    isDefault: false,
                                },
                                {
                                    id: "attr.region.longitude",
                                    ref: uriRef("/df/longitude"),
                                    type: "GDC.geo.pin_longitude",
                                    title: "Longitude",
                                    isDefault: false,
                                },
                                // No GDC.geo.icon display form — simulates label removed from LDM
                            ],
                        },
                    ],
                },
            ],
            filters: { localIdentifier: "filters", items: [] },
            properties: {
                controls: {
                    points: {
                        shapeType: "iconByValue",
                    },
                },
            },
        });

        expect(extendedReferencePoint.properties?.controls?.["points"]?.shapeType).toBe("circle");
    });

    it("should keep shapeType as iconByValue when geo icon label is available", async () => {
        const { visualization } = createComponent(undefined, {
            enableGeoPushpinIcon: true,
        });

        const extendedReferencePoint = await visualization.getExtendedReferencePoint({
            buckets: [
                {
                    localIdentifier: BucketNames.VIEW,
                    items: [
                        {
                            ...createLocationBucketItem(),
                            displayForms: [
                                {
                                    id: "attr.region.latitude",
                                    ref: uriRef("/df/latitude"),
                                    type: "GDC.geo.pin_latitude",
                                    title: "Latitude",
                                    isDefault: false,
                                },
                                {
                                    id: "attr.region.longitude",
                                    ref: uriRef("/df/longitude"),
                                    type: "GDC.geo.pin_longitude",
                                    title: "Longitude",
                                    isDefault: false,
                                },
                                {
                                    id: "attr.region.geoIcon",
                                    ref: uriRef("/df/geoIcon"),
                                    type: "GDC.geo.icon",
                                    title: "Geo Icon",
                                    isDefault: false,
                                },
                            ],
                        },
                    ],
                },
            ],
            filters: { localIdentifier: "filters", items: [] },
            properties: {
                controls: {
                    points: {
                        shapeType: "iconByValue",
                    },
                },
            },
        });

        expect(extendedReferencePoint.properties?.controls?.["points"]?.shapeType).toBe("iconByValue");
    });
});
