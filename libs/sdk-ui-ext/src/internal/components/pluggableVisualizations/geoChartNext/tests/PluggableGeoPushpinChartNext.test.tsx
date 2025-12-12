// (C) 2025 GoodData Corporation

import type { ReactElement } from "react";

import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    type IInsightDefinition,
    newAttribute,
    newBucket,
    newInsightDefinition,
    newMeasure,
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
                newBucket(BucketNames.SIZE, newMeasure("m1")),
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
            executions?: unknown[];
        };
        const pushpinLayer = props.execution?.context;

        expect(pushpinLayer?.id).toBe(PUSHPIN_LAYER_ID);
        expect(pushpinLayer?.latitude).toBeDefined();
        expect(pushpinLayer?.longitude).toBeDefined();
        expect(pushpinLayer?.location).toBeUndefined();
        expect(props.executions).toBeDefined();
        expect(props.executions).toHaveLength(1);
    });
});
