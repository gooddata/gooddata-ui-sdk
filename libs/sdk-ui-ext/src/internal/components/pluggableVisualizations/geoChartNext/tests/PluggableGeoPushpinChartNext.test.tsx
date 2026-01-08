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
    newMeasureValueFilter,
    newMeasureValueFilterWithOptions,
} from "@gooddata/sdk-model";
import { BucketNames, GeoLocationMissingSdkError } from "@gooddata/sdk-ui";
import { GeoChartNextInternal, PUSHPIN_LAYER_ID } from "@gooddata/sdk-ui-geo/next";

import { type IVisConstruct } from "../../../../interfaces/Visualization.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import { PluggableGeoPushpinChartNext } from "../PluggableGeoPushpinChartNext.js";

const PROJECT_ID = "PROJECTID";
const visualizationUrl = "local:pushpin";

describe("PluggableGeoPushpinChartNext", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();

    const backend = dummyBackend();
    const executionFactory = backend.workspace(PROJECT_ID).execution();

    function createComponent(onError = vi.fn()) {
        const props: IVisConstruct = {
            projectId: PROJECT_ID,
            element: () => mockElement,
            configPanelElement: () => mockConfigElement,
            callbacks: {
                afterRender: () => {},
                pushData: () => {},
                onError,
            },
            backend,
            visualizationProperties: {
                controls: {
                    latitude: "latitude_df",
                    longitude: "longitude_df",
                },
            },
            renderFun: mockRenderFun,
            messages,
        } as unknown as IVisConstruct;

        return { visualization: new PluggableGeoPushpinChartNext(props), onError };
    }

    afterEach(() => {
        mockRenderFun.mockReset();
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

    it("should surface GeoLocationMissingSdkError when location bucket is empty", () => {
        const onError = vi.fn();
        const { visualization } = createComponent(onError);

        visualization.update({ messages }, insightWithoutLocation, {}, executionFactory);

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

    it("should render GeoChartNext with pushpin layer metadata", () => {
        const { visualization } = createComponent();

        visualization.update({ messages }, insightWithLocation, {}, executionFactory);

        expect(mockRenderFun).toHaveBeenCalled();
        const chartCall = mockRenderFun.mock.calls.find(
            ([node]) => (node as ReactElement)?.type === GeoChartNextInternal,
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
            ([node]) => (node as ReactElement)?.type === GeoChartNextInternal,
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
            ([node]) => (node as ReactElement)?.type === GeoChartNextInternal,
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
            ([node]) => (node as ReactElement)?.type === GeoChartNextInternal,
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
});
