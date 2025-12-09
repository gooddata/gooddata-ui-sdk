// (C) 2025 GoodData Corporation

import type { ReactElement } from "react";

import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    IInsightDefinition,
    newAttribute,
    newBucket,
    newInsightDefinition,
    newMeasure,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { AREA_LAYER_ID, GeoChartNextInternal } from "@gooddata/sdk-ui-geo/next";

import { IVisConstruct } from "../../../../interfaces/Visualization.js";
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
            newBucket(BucketNames.COLOR, newMeasure("m1")),
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
});
