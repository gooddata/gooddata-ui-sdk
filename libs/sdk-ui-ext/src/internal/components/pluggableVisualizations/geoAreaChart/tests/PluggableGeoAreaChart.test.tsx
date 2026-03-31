// (C) 2025-2026 GoodData Corporation

import type { ReactElement } from "react";

import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    type IInsightDefinition,
    localIdRef,
    newAttribute,
    newBucket,
    newInsightDefinition,
    newMeasure,
    newMeasureValueFilterWithOptions,
    uriRef,
} from "@gooddata/sdk-model";
import { BucketNames, GeoAreaMissingSdkError } from "@gooddata/sdk-ui";
import { AREA_LAYER_ID, GeoChartInternal } from "@gooddata/sdk-ui-geo/internal";

import { type IReferencePoint, type IVisConstruct } from "../../../../interfaces/Visualization.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import {
    type ICreateComponentOverrides,
    fireAndExpectNoViewportSync,
    fireAndExpectViewportSync,
} from "../../geoCommon/tests/viewportSync.test.helpers.js";
import { PluggableGeoAreaChart } from "../PluggableGeoAreaChart.js";

const PROJECT_ID = "PROJECTID";
const visualizationUrl = "local:geo-area";

describe("PluggableGeoAreaChart", () => {
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
            backend,
            featureFlags,
            environment: overrides?.environment,
            visualizationProperties: overrides?.visualizationProperties ?? {},
            renderFun: mockRenderFun,
            messages,
        } as unknown as IVisConstruct;

        return { visualization: new PluggableGeoAreaChart(props), onError, pushData };
    }

    afterEach(async () => {
        await Promise.resolve();
        await Promise.resolve();
        mockRenderFun.mockReset();
    });

    const insightWithAreaBucket: IInsightDefinition = newInsightDefinition(visualizationUrl, (builder) =>
        builder.title("area chart").buckets([
            newBucket(
                BucketNames.AREA,
                newAttribute("attr.country", (attribute) => attribute.localId("area")),
            ),
            newBucket(
                BucketNames.COLOR,
                newMeasure("m1", (m) => m.localId("m_color")),
            ),
        ]),
    );

    it("should render GeoChartNext with area layer metadata and no additional executions", () => {
        const { visualization } = createComponent();

        visualization.update({ messages }, insightWithAreaBucket, {}, executionFactory);

        const chartCall = mockRenderFun.mock.calls.find(
            ([node]) => (node as ReactElement)?.type === GeoChartInternal,
        );

        expect(chartCall).toBeDefined();
        const element = chartCall?.[0] as ReactElement;
        const props = element.props as {
            type?: string;
            execution?: { context?: { id?: string } };
            executions?: unknown[];
        };

        expect(props.type).toBe("area");
        expect(props.execution?.context?.id).toBe(AREA_LAYER_ID);
        expect(props.executions).toEqual([]);
    });

    it("should use legacy tileset insight properties as a basemap fallback in dashboards", () => {
        const { visualization } = createComponent();
        const insightWithLegacyTileset = newInsightDefinition(visualizationUrl, (builder) =>
            builder
                .title("area chart with legacy tileset")
                .buckets([
                    newBucket(
                        BucketNames.AREA,
                        newAttribute("attr.country", (attribute) => attribute.localId("area")),
                    ),
                    newBucket(
                        BucketNames.COLOR,
                        newMeasure("m1", (m) => m.localId("m_color")),
                    ),
                ])
                .properties({
                    controls: {
                        tileset: "satellite",
                    },
                }),
        );

        visualization.update({ messages }, insightWithLegacyTileset, {}, executionFactory);

        const chartCall = mockRenderFun.mock.calls.find(
            ([node]) => (node as ReactElement)?.type === GeoChartInternal,
        );
        expect(chartCall).toBeDefined();
        const element = chartCall?.[0] as ReactElement;
        const props = element.props as { config?: { basemap?: string } };

        expect(props.config?.basemap).toBe("satellite");
    });

    it("should preserve live viewport on rerender when viewport config is enabled", () => {
        const { visualization } = createComponent(vi.fn(), {
            enableGeoChartsViewportConfig: true,
        });
        const insightWithSavedViewport = newInsightDefinition(visualizationUrl, (builder) =>
            builder
                .title("area with saved viewport")
                .buckets([
                    newBucket(
                        BucketNames.AREA,
                        newAttribute("attr.country", (attribute) => attribute.localId("area")),
                    ),
                    newBucket(
                        BucketNames.COLOR,
                        newMeasure("m1", (m) => m.localId("m_color")),
                    ),
                ])
                .properties({
                    controls: {
                        center: { lat: 40.71, lng: -74.0 },
                        zoom: 3,
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
        const liveCenter = { lat: 52.52, lng: 13.4 };
        const liveZoom = 6;

        firstChartProps.onCenterPositionChanged?.(liveCenter);
        firstChartProps.onZoomChanged?.(liveZoom);

        const insightWithUnrelatedControlChange = newInsightDefinition(visualizationUrl, (builder) =>
            builder
                .title("area with saved viewport")
                .buckets([
                    newBucket(
                        BucketNames.AREA,
                        newAttribute("attr.country", (attribute) => attribute.localId("area")),
                    ),
                    newBucket(
                        BucketNames.COLOR,
                        newMeasure("m1", (m) => m.localId("m_color")),
                    ),
                ])
                .properties({
                    controls: {
                        center: { lat: 40.71, lng: -74.0 },
                        zoom: 3,
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
        const areaBuckets = [
            newBucket(
                BucketNames.AREA,
                newAttribute("attr.country", (attribute) => attribute.localId("area")),
            ),
            newBucket(
                BucketNames.COLOR,
                newMeasure("m1", (m) => m.localId("m_color")),
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
                            viewport: { area: viewportArea },
                            center: { lat: 40.71, lng: -74.0 },
                            zoom: 3,
                        },
                    },
                },
            );

            const insight: IInsightDefinition = newInsightDefinition(visualizationUrl, (builder) =>
                builder
                    .title("viewport test")
                    .buckets(areaBuckets)
                    .properties({
                        controls: {
                            viewport: { area: viewportArea },
                            center: { lat: 40.71, lng: -74.0 },
                            zoom: 3,
                        },
                    }),
            );

            visualization.update({ messages, config: { isInEditMode: true } }, insight, {}, executionFactory);

            return { pushData };
        }

        it("should sync custom viewport center and zoom from map callbacks in AD", async () => {
            const { pushData } = setupViewportTest("custom", "analyticalDesigner");
            await fireAndExpectViewportSync(mockRenderFun, pushData, { lat: 52.52, lng: 13.4 }, 6);
        });

        it("should not sync center and zoom when viewport area is a preset", async () => {
            const { pushData } = setupViewportTest("continent_eu", "analyticalDesigner");
            await fireAndExpectNoViewportSync(mockRenderFun, pushData, { lat: 52.52, lng: 13.4 }, 6);
        });

        it("should not sync viewport when environment is not AD", async () => {
            const { pushData } = setupViewportTest("custom", "dashboards");
            await fireAndExpectNoViewportSync(mockRenderFun, pushData, { lat: 52.52, lng: 13.4 }, 6);
        });
    });
    it("should surface GeoAreaMissingSdkError when AREA bucket is missing", () => {
        const { visualization, onError } = createComponent();
        const insightMissingArea: IInsightDefinition = newInsightDefinition(visualizationUrl, (builder) =>
            builder.title("missing area").buckets([
                newBucket(
                    BucketNames.COLOR,
                    newMeasure("m1", (m) => m.localId("m_color")),
                ),
            ]),
        );

        visualization.update({ messages }, insightMissingArea, {}, executionFactory);

        expect(onError).toHaveBeenCalledWith(expect.any(GeoAreaMissingSdkError));
    });

    it("should build additional executions from insight layers", () => {
        const { visualization } = createComponent();
        const insightWithLayers = {
            ...insightWithAreaBucket,
            insight: {
                ...insightWithAreaBucket.insight,
                layers: [
                    {
                        id: "layer_pushpins",
                        name: "Additional pushpins",
                        type: "pushpin",
                        buckets: [
                            newBucket(
                                BucketNames.LOCATION,
                                newAttribute("customer_city.city", (attribute) => attribute.localId("loc")),
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

        visualization.update({ messages }, insightWithLayers, {}, executionFactory);

        const chartCall = mockRenderFun.mock.calls.find(
            ([node]) => (node as ReactElement)?.type === GeoChartInternal,
        );

        expect(chartCall).toBeDefined();
        const element = chartCall?.[0] as ReactElement;
        const props = element.props as { executions?: unknown[] };
        expect(props.executions).toBeDefined();
        expect(props.executions).toHaveLength(1);
    });

    it("should keep MVF on root area execution and drop it from additional layers where it would dangle", () => {
        const { visualization } = createComponent();

        const insightWithMvfAndLayers = {
            ...insightWithAreaBucket,
            insight: {
                ...insightWithAreaBucket.insight,
                filters: [
                    newMeasureValueFilterWithOptions(localIdRef("m_color"), {
                        operator: "GREATER_THAN",
                        value: 0,
                        dimensionality: [localIdRef("area")],
                    }),
                ],
                layers: [
                    {
                        id: "layer_pushpins",
                        name: "Additional pushpins",
                        type: "pushpin",
                        buckets: [
                            newBucket(
                                BucketNames.LOCATION,
                                newAttribute("customer_city.city", (attribute) => attribute.localId("loc")),
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

        visualization.update({ messages }, insightWithMvfAndLayers, {}, executionFactory);

        const chartCall = mockRenderFun.mock.calls.find(
            ([node]) => (node as ReactElement)?.type === GeoChartInternal,
        );
        expect(chartCall).toBeDefined();

        const element = chartCall?.[0] as ReactElement;
        const props = element.props as {
            execution?: { definition?: { filters?: unknown[] } };
            executions?: Array<{ definition?: { filters?: unknown[] } }>;
        };

        expect(props.execution?.definition?.filters ?? []).toHaveLength(1);
        expect(props.executions?.[0]?.definition?.filters ?? []).toEqual([]);
    });

    it("should apply per-layer MVFs: keep area MVF on root and pushpin MVF on pushpin layer", () => {
        const { visualization } = createComponent();

        const rootMeasureLocalId = "m_area";
        const pushpinMeasureLocalId = "m_pushpin";
        const areaLocalId = "area";
        const pushpinLocationLocalId = "loc";

        const insightWithMultipleMvfs: IInsightDefinition = newInsightDefinition(
            visualizationUrl,
            (builder) =>
                builder
                    .title("area + pushpin with mvfs")
                    .buckets([
                        newBucket(
                            BucketNames.AREA,
                            newAttribute("attr.country", (attribute) => attribute.localId(areaLocalId)),
                        ),
                        newBucket(
                            BucketNames.COLOR,
                            newMeasure("m1", (m) => m.localId(rootMeasureLocalId)),
                        ),
                    ])
                    .filters([
                        newMeasureValueFilterWithOptions(localIdRef(rootMeasureLocalId), {
                            operator: "GREATER_THAN",
                            value: 0,
                            dimensionality: [localIdRef(areaLocalId)],
                        }),
                        newMeasureValueFilterWithOptions(localIdRef(pushpinMeasureLocalId), {
                            operator: "GREATER_THAN",
                            value: 0,
                            dimensionality: [localIdRef(pushpinLocationLocalId)],
                        }),
                    ])
                    .layers([
                        {
                            id: "layer_pushpins",
                            name: "Additional pushpins",
                            type: "pushpin",
                            buckets: [
                                newBucket(
                                    BucketNames.LOCATION,
                                    newAttribute("customer_city.city", (attribute) =>
                                        attribute.localId(pushpinLocationLocalId),
                                    ),
                                ),
                                newBucket(
                                    BucketNames.SIZE,
                                    newMeasure("m2", (m) => m.localId(pushpinMeasureLocalId)),
                                ),
                            ],
                            properties: {
                                controls: {
                                    latitude: "customer_city.city_latitude",
                                    longitude: "customer_city.city_longitude",
                                },
                            },
                        },
                    ]),
        );

        visualization.update({ messages }, insightWithMultipleMvfs, {}, executionFactory);

        const chartCall = mockRenderFun.mock.calls.find(
            ([node]) => (node as ReactElement)?.type === GeoChartInternal,
        );
        expect(chartCall).toBeDefined();

        const element = chartCall?.[0] as ReactElement;
        const props = element.props as {
            execution?: { definition?: { filters?: unknown[] } };
            executions?: Array<{ definition?: { filters?: unknown[] } }>;
        };

        expect(props.execution?.definition?.filters ?? []).toHaveLength(1);
        expect(props.executions?.[0]?.definition?.filters ?? []).toHaveLength(1);
    });

    describe("getExtendedReferencePoint (geo area bucket auto-fill)", () => {
        it("should auto-fill AREA bucket from VIEW when AREA is empty", async () => {
            const { visualization } = createComponent();

            const areaCandidate = {
                localIdentifier: "a_country",
                type: "attribute",
                attribute: "attr.country",
                dfRef: uriRef("/df/country_text"),
                displayForms: [
                    {
                        id: "attr.country_area",
                        ref: uriRef("/df/country_area"),
                        type: "GDC.geo.area",
                        title: "Country (area)",
                        isDefault: false,
                    },
                ],
            };

            const referencePoint: IReferencePoint = {
                buckets: [
                    { localIdentifier: BucketNames.VIEW, items: [areaCandidate] },
                    { localIdentifier: BucketNames.AREA, items: [] },
                    { localIdentifier: BucketNames.COLOR, items: [] },
                    { localIdentifier: BucketNames.SEGMENT, items: [] },
                ],
                filters: { localIdentifier: "filters", items: [] },
                properties: {},
            };

            const extendedReferencePoint = await visualization.getExtendedReferencePoint(referencePoint);
            const areaBucket = extendedReferencePoint.buckets.find(
                (b: { localIdentifier?: string }) => b.localIdentifier === BucketNames.AREA,
            );

            expect(areaBucket?.items ?? []).toHaveLength(1);
            expect(areaBucket?.items?.[0]?.attribute).toBe("attr.country");
            expect(areaBucket?.items?.[0]?.areaDisplayFormRef).toEqual(uriRef("/df/country_area"));
        });

        it("should not override existing AREA selection", async () => {
            const { visualization } = createComponent();

            const existingArea = {
                localIdentifier: "a_region",
                type: "attribute",
                attribute: "attr.region",
                dfRef: uriRef("/df/region_text"),
                displayForms: [
                    {
                        id: "attr.region_area",
                        ref: uriRef("/df/region_area"),
                        type: "GDC.geo.area",
                        title: "Region (area)",
                        isDefault: false,
                    },
                ],
            };

            const otherCandidate = {
                localIdentifier: "a_country",
                type: "attribute",
                attribute: "attr.country",
                dfRef: uriRef("/df/country_text"),
                displayForms: [
                    {
                        id: "attr.country_area",
                        ref: uriRef("/df/country_area"),
                        type: "GDC.geo.area",
                        title: "Country (area)",
                        isDefault: false,
                    },
                ],
            };

            const referencePoint: IReferencePoint = {
                buckets: [
                    { localIdentifier: BucketNames.VIEW, items: [otherCandidate] },
                    { localIdentifier: BucketNames.AREA, items: [existingArea] },
                    { localIdentifier: BucketNames.COLOR, items: [] },
                    { localIdentifier: BucketNames.SEGMENT, items: [] },
                ],
                filters: { localIdentifier: "filters", items: [] },
                properties: {},
            };

            const extendedReferencePoint = await visualization.getExtendedReferencePoint(referencePoint);
            const areaBucket = extendedReferencePoint.buckets.find(
                (b: { localIdentifier?: string }) => b.localIdentifier === BucketNames.AREA,
            );

            expect(areaBucket?.items ?? []).toHaveLength(1);
            expect(areaBucket?.items?.[0]?.attribute).toBe("attr.region");
        });
    });

    it("should drop a non-area-capable attribute from AREA bucket when switching", async () => {
        const { visualization } = createComponent();

        // AREA exists but contains a non-area-capable attribute (no GDC.geo.area display form)
        const nonAreaCandidate = {
            localIdentifier: "a_region",
            type: "attribute",
            attribute: "attr.region",
            dfRef: uriRef("/df/region_text"),
            displayForms: [
                {
                    id: "attr.region_name",
                    ref: uriRef("/df/region_text"),
                    type: "GDC.text",
                    title: "Region name",
                    isDefault: true,
                },
            ],
        };

        const referencePoint: IReferencePoint = {
            buckets: [
                { localIdentifier: BucketNames.AREA, items: [nonAreaCandidate] },
                { localIdentifier: BucketNames.COLOR, items: [] },
                { localIdentifier: BucketNames.SEGMENT, items: [] },
            ],
            filters: { localIdentifier: "filters", items: [] },
            properties: {},
        };

        const extended = await visualization.getExtendedReferencePoint(referencePoint);
        const areaBucket = extended.buckets.find((b) => b.localIdentifier === BucketNames.AREA);
        expect(areaBucket?.items ?? []).toEqual([]);
    });
});
