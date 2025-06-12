// (C) 2019-2023 GoodData Corporation
import noop from "lodash/noop.js";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks.js";
import { PluggableGeoPushpinChart } from "../PluggableGeoPushpinChart.js";
import { IExtendedReferencePoint, IVisConstruct } from "../../../../interfaces/Visualization.js";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { getLastRenderEl } from "../../tests/testHelpers.js";
import * as testMocks from "../../../../tests/mocks/testMocks.js";
import { IInsightDefinition, newBucket, newInsightDefinition, newAttribute } from "@gooddata/sdk-model";
import { describe, it, expect, vi, afterEach } from "vitest";

describe("PluggableGeoPushpinChart", () => {
    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();
    const executionFactory = dummyBackend().workspace("PROJECTID").execution();
    const defaultProps: IVisConstruct = {
        projectId: "PROJECTID",
        element: () => mockElement,
        configPanelElement: () => mockConfigElement,
        callbacks: {
            afterRender: noop,
            pushData: noop,
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: mockRenderFun,
    };

    function createComponent(props: IVisConstruct = defaultProps) {
        return new PluggableGeoPushpinChart(props);
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    it("should create geo pushpin visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    describe("getExtendedReferencePoint", () => {
        const geoPushpin = createComponent();
        const sourceReferencePoint = referencePointMocks.simpleGeoPushpinReferencePoint;
        const extendedReferencePointPromise: Promise<IExtendedReferencePoint> =
            geoPushpin.getExtendedReferencePoint(sourceReferencePoint);

        it("should return a new reference point with geoPushpin adapted buckets", () => {
            return extendedReferencePointPromise.then((extendedReferencePoint) => {
                expect(extendedReferencePoint.buckets).toEqual(sourceReferencePoint.buckets);
            });
        });

        it("should return a new reference point with geoPushpin UI config", () => {
            return extendedReferencePointPromise.then((extendedReferencePoint) => {
                expect(extendedReferencePoint.uiConfig).toMatchSnapshot();
            });
        });

        it("should transform view by attribute to location attribute", async () => {
            const { oneMetricAndGeoCategoryAndStackReferencePoint } = referencePointMocks;

            const newExtendedReferencePoint = await geoPushpin.getExtendedReferencePoint(
                oneMetricAndGeoCategoryAndStackReferencePoint,
            );

            expect(newExtendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "location",
                    items: [
                        {
                            localIdentifier: "a1",
                            type: "attribute",
                            aggregation: null,
                            attribute: "attr.owner.country",
                            locationDisplayFormRef: { uri: "/geo/attribute/displayform/uri/1" },
                            dfRef: { uri: "/geo/attribute/displayform/uri/2" },
                        },
                    ],
                },
                {
                    localIdentifier: "size",
                    items: [
                        {
                            localIdentifier: "m1",
                            type: "metric",
                            aggregation: null,
                            attribute: "aazb6kroa3iC",
                            showInPercent: null,
                            showOnSecondaryAxis: null,
                        },
                    ],
                },
                {
                    localIdentifier: "color",
                    items: [],
                },
                {
                    localIdentifier: "segment",
                    items: [
                        {
                            localIdentifier: "a2",
                            type: "attribute",
                            aggregation: null,
                            attribute: "attr.stage.iswon",
                            dfRef: {
                                uri: "a2/df",
                            },
                        },
                    ],
                },
            ]);
        });

        it("should transform geo attribute with attribute", async () => {
            const { viewByWithDateAndGeoAttributeReferencePoint } = referencePointMocks;

            const newExtendedReferencePoint = await geoPushpin.getExtendedReferencePoint(
                viewByWithDateAndGeoAttributeReferencePoint,
            );

            expect(newExtendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "location",
                    items: [
                        {
                            localIdentifier: "a1",
                            type: "attribute",
                            aggregation: null,
                            attribute: "attr.owner.country",
                            locationDisplayFormRef: { uri: "/geo/attribute/displayform/uri/1" },
                            dfRef: { uri: "/geo/attribute/displayform/uri/2" },
                        },
                    ],
                },
                {
                    localIdentifier: "size",
                    items: [
                        {
                            localIdentifier: "m1",
                            type: "metric",
                            aggregation: null,
                            attribute: "aazb6kroa3iC",
                            showInPercent: null,
                            showOnSecondaryAxis: null,
                        },
                    ],
                },
                {
                    localIdentifier: "color",
                    items: [],
                },
                {
                    localIdentifier: "segment",
                    items: [],
                },
            ]);
        });

        it("should not transform same location attribute on location and segment bucket", async () => {
            const { viewByWithNonGeoAndGeoAttributeReferencePoint } = referencePointMocks;

            const newExtendedReferencePoint = await geoPushpin.getExtendedReferencePoint(
                viewByWithNonGeoAndGeoAttributeReferencePoint,
            );

            expect(newExtendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "location",
                    items: [
                        {
                            localIdentifier: "a1",
                            type: "attribute",
                            aggregation: null,
                            attribute: "attr.owner.country",
                            locationDisplayFormRef: { uri: "/geo/attribute/displayform/uri/1" },
                            dfRef: { uri: "/geo/attribute/displayform/uri/2" },
                        },
                    ],
                },
                {
                    localIdentifier: "size",
                    items: [
                        {
                            localIdentifier: "m1",
                            type: "metric",
                            aggregation: null,
                            attribute: "aazb6kroa3iC",
                            showInPercent: null,
                            showOnSecondaryAxis: null,
                        },
                    ],
                },
                {
                    localIdentifier: "color",
                    items: [],
                },
                {
                    localIdentifier: "segment",
                    items: [
                        {
                            aggregation: null,
                            attribute: "attr.owner.department",
                            dfRef: {
                                uri: "a1/df",
                            },
                            localIdentifier: "a1",
                            type: "attribute",
                        },
                    ],
                },
            ]);
        });

        it("should reset showInPercent and showOnSecondaryAxis for size and color measures", async () => {
            const newExtendedReferencePoint = await geoPushpin.getExtendedReferencePoint(
                referencePointMocks.twoMeasuresWithShowInPercentOnSecondaryAxisReferencePoint,
            );
            expect(newExtendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "location",
                    items: [
                        {
                            aggregation: null,
                            attribute: "attr.owner.country",
                            dfRef: { uri: "/geo/attribute/displayform/uri/2" },
                            localIdentifier: "a1",
                            locationDisplayFormRef: { uri: "/geo/attribute/displayform/uri/1" },
                            type: "attribute",
                        },
                    ],
                },
                {
                    localIdentifier: "size",
                    items: [
                        {
                            localIdentifier: "m3",
                            type: "metric",
                            aggregation: null,
                            attribute: "dt.opportunitysnapshot.snapshotdate",
                            showInPercent: null,
                            showOnSecondaryAxis: null,
                        },
                    ],
                },
                {
                    localIdentifier: "color",
                    items: [
                        {
                            localIdentifier: "m4",
                            type: "metric",
                            aggregation: null,
                            attribute: "acfWntEMcom0",
                            showInPercent: null,
                            showOnSecondaryAxis: null,
                        },
                    ],
                },
                {
                    localIdentifier: "segment",
                    items: [],
                },
            ]);
        });

        it("should return a new reference point with geoPushpin supported properties list", async () => {
            const geoPushpinChart = createComponent();
            const extendedReferencePoint = await geoPushpinChart.getExtendedReferencePoint(
                referencePointMocks.simpleGeoPushpinReferencePoint,
            );
            expect(extendedReferencePoint.properties).toEqual({
                controls: {
                    points: {
                        groupNearbyPoints: false,
                    },
                    tooltipText: "/geo/attribute/displayform/uri/2",
                },
            });
        });

        it("should remove all derived measures", async () => {
            const geoPushpinChart = createComponent();
            const extendedReferencePoint = await geoPushpinChart.getExtendedReferencePoint(
                referencePointMocks.samePeriodPreviousYearRefPoint,
            );

            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "location",
                    items: [],
                },
                {
                    localIdentifier: "size",
                    items: [
                        {
                            localIdentifier: "m1",
                            type: "metric",
                            aggregation: null,
                            attribute: "aazb6kroa3iC",
                            showInPercent: null,
                            showOnSecondaryAxis: null,
                        },
                    ],
                },
                {
                    localIdentifier: "color",
                    items: [],
                },
                {
                    localIdentifier: "segment",
                    items: [],
                },
            ]);
        });

        it("should remove all arithmetic measures", async () => {
            const geoPushpinChart = createComponent();
            const extendedReferencePoint = await geoPushpinChart.getExtendedReferencePoint(
                referencePointMocks.firstMeasureArithmeticNoAttributeReferencePoint,
            );

            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "location",
                    items: [],
                },
                {
                    localIdentifier: "size",
                    items: [
                        {
                            localIdentifier: "m1",
                            type: "metric",
                            aggregation: null,
                            attribute: "aazb6kroa3iC",
                            showInPercent: null,
                            showOnSecondaryAxis: null,
                        },
                    ],
                },
                {
                    localIdentifier: "color",
                    items: [
                        {
                            localIdentifier: "m2",
                            type: "metric",
                            aggregation: null,
                            attribute: "af2Ewj9Re2vK",
                            showInPercent: null,
                            showOnSecondaryAxis: null,
                        },
                    ],
                },
                {
                    localIdentifier: "segment",
                    items: [],
                },
            ]);
        });

        it("should generate latitude/longitude and tooltipText to properties", async () => {
            const withLatitudeLongitudeSupported = dummyBackend();
            withLatitudeLongitudeSupported.capabilities.supportsSeparateLatitudeLongitudeLabels = true;
            const geoPushpinChart = createComponent({
                ...defaultProps,
                backend: withLatitudeLongitudeSupported,
            });
            const extendedReferencePoint = await geoPushpinChart.getExtendedReferencePoint(
                referencePointMocks.latitudeLongitudeGeoPushpinReferencePoint,
            );

            expect(extendedReferencePoint.properties).toMatchSnapshot();
        });

        it("should not generate latitude/longitude and tooltipText to properties when location item missing", async () => {
            const withLatitudeLongitudeSupported = dummyBackend();
            withLatitudeLongitudeSupported.capabilities.supportsSeparateLatitudeLongitudeLabels = true;
            const geoPushpinChart = createComponent({
                ...defaultProps,
                backend: withLatitudeLongitudeSupported,
            });
            const extendedReferencePoint = await geoPushpinChart.getExtendedReferencePoint(
                referencePointMocks.noLocationGeoPushpinReferencePoint,
            );

            expect(extendedReferencePoint.properties).toMatchSnapshot();
        });
    });

    describe("`renderVisualization` and `renderConfigurationPanel`", () => {
        it("should mount on the element defined by the callback", () => {
            const visualization = createComponent();

            visualization.update({}, testMocks.insightWithSingleMeasure, {}, executionFactory);

            // 1st call for rendering element
            // 2nd call for rendering config panel
            expect(mockRenderFun).toHaveBeenCalledTimes(2);
            expect(getLastRenderEl(mockRenderFun, mockElement)).toBeDefined();
            expect(getLastRenderEl(mockRenderFun, mockConfigElement)).toBeDefined();
        });
    });

    describe("getExecution", () => {
        it("should generate virtual buckets for latitude and longitude from location", () => {
            const withLatitudeLongitudeSupported = dummyBackend();
            withLatitudeLongitudeSupported.capabilities.supportsSeparateLatitudeLongitudeLabels = true;
            const executionFactory = withLatitudeLongitudeSupported.workspace("test").execution();

            const visualization = createComponent({
                ...defaultProps,
                backend: withLatitudeLongitudeSupported,
            });
            const visualizationProperties = {
                controls: {
                    latitude: "latitude_df_identifier",
                    longitude: "longitude_df_identifier",
                },
            };
            const insight: IInsightDefinition = newInsightDefinition("visualizationClass-url", (b) => {
                return b
                    .title("sourceInsight")
                    .buckets([newBucket("location", newAttribute("geo_attribute"))])
                    .properties(visualizationProperties);
            });

            // without this update this.visualizationProperties is not defined on visualization
            visualization.update({}, insight, {}, executionFactory);

            const generatedBuckets = visualization.getExecution({}, insight, executionFactory).definition
                .buckets;
            expect(generatedBuckets.find((b) => b.localIdentifier === "latitude")).toMatchSnapshot();
            expect(generatedBuckets.find((b) => b.localIdentifier === "longitude")).toMatchSnapshot();
        });

        it("should not generate virtual buckets if location is empty", () => {
            const withLatitudeLongitudeSupported = dummyBackend();
            withLatitudeLongitudeSupported.capabilities.supportsSeparateLatitudeLongitudeLabels = true;
            const executionFactory = withLatitudeLongitudeSupported.workspace("test").execution();

            const visualization = createComponent({
                ...defaultProps,
                backend: withLatitudeLongitudeSupported,
            });
            const visualizationProperties = {
                controls: {
                    latitude: "latitude_df_identifier",
                    longitude: "longitude_df_identifier",
                },
            };
            const insight: IInsightDefinition = newInsightDefinition("visualizationClass-url", (b) => {
                return b
                    .title("sourceInsight")
                    .buckets([newBucket("location")])
                    .properties(visualizationProperties);
            });

            // without this update this.visualizationProperties is not defined on visualization
            visualization.update({}, insight, {}, executionFactory);

            const generatedBuckets = visualization.getExecution({}, insight, executionFactory).definition
                .buckets;
            expect(generatedBuckets.length).toBe(0);
        });
    });
});
