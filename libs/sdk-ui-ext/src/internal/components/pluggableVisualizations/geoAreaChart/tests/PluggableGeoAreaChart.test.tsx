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
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { AREA_LAYER_ID, GeoChartNextInternal } from "@gooddata/sdk-ui-geo/next";

import { type IVisConstruct } from "../../../../interfaces/Visualization.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";
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

    function createComponent() {
        const props: IVisConstruct = {
            projectId: PROJECT_ID,
            element: () => mockElement,
            configPanelElement: () => mockConfigElement,
            callbacks: {
                afterRender: () => {},
                pushData: () => {},
                onError: () => {},
            },
            backend,
            visualizationProperties: {
                controls: {
                    tooltipText: "tooltip_df",
                },
            },
            renderFun: mockRenderFun,
            messages,
        } as unknown as IVisConstruct;

        return new PluggableGeoAreaChart(props);
    }

    afterEach(() => {
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
        const visualization = createComponent();

        visualization.update({ messages }, insightWithAreaBucket, {}, executionFactory);

        const chartCall = mockRenderFun.mock.calls.find(
            ([node]) => (node as ReactElement)?.type === GeoChartNextInternal,
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

    it("should build additional executions from insight layers", () => {
        const visualization = createComponent();
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
            ([node]) => (node as ReactElement)?.type === GeoChartNextInternal,
        );

        expect(chartCall).toBeDefined();
        const element = chartCall?.[0] as ReactElement;
        const props = element.props as { executions?: unknown[] };
        expect(props.executions).toBeDefined();
        expect(props.executions).toHaveLength(1);
    });

    it("should keep MVF on root area execution and drop it from additional layers where it would dangle", () => {
        const visualization = createComponent();

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
            ([node]) => (node as ReactElement)?.type === GeoChartNextInternal,
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
        const visualization = createComponent();

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
            ([node]) => (node as ReactElement)?.type === GeoChartNextInternal,
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
});
