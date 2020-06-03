// (C) 2020 GoodData Corporation
import {
    calculateAverage,
    getFormatFromExecutionResponse,
    isClusteringAllowed,
    isColorAssignmentItemChanged,
    isDataOfReasonableSize,
    isLocationMissing,
    isPointsConfigChanged,
} from "../../geoChart/common";
import { ColorBucket, LocationBucket, SegmentBucket, SizeBucket, TooltipBucket } from "./fixtures";
import { IGeoData, IGeoPointsConfig } from "../../../../../GeoChart";
import { IColorAssignment } from "@gooddata/sdk-ui";
import { RecShortcuts } from "../../../../../../__mocks__/recordings";
import { IBucket } from "@gooddata/sdk-model";

describe("common", () => {
    describe("isDataOfReasonableSize", () => {
        it.each([
            [155, true],
            [150, false],
        ])("should return isDataOfReasonableSize is %s", (limit: number, expectedResult: boolean) => {
            const { dv, geoData } = RecShortcuts.LocationOnly;
            expect(isDataOfReasonableSize(dv, geoData, limit)).toEqual(expectedResult);
        });
    });

    describe("isLocationMissing", () => {
        it("should return false if location is in buckets", () => {
            const buckets: IBucket[] = [
                LocationBucket,
                SegmentBucket,
                TooltipBucket,
                SizeBucket,
                ColorBucket,
            ];
            expect(isLocationMissing(buckets)).toBe(false);
        });

        it("should return true if location is not in buckets", () => {
            const buckets: IBucket[] = [SizeBucket];
            expect(isLocationMissing(buckets)).toBe(true);
        });
    });

    describe("calculateAverage", () => {
        it("should return expected value", () => {
            const values: number[] = [1, 2, 3, 4, 5, 6];
            expect(calculateAverage(values)).toEqual(3.5);
        });
    });

    describe("getFormatFromExecutionResponse", () => {
        it("should return format of Size Measure ", () => {
            const { dv } = RecShortcuts.LocationAndSize;

            expect(getFormatFromExecutionResponse(dv, 0)).toEqual("#,##0.00");
        });
    });

    describe("isClusteringAllowed", () => {
        const Scenarios: Array<[boolean, string, IGeoData, boolean]> = [
            [
                false,
                "size measure is in bucket",
                {
                    location: { index: 0, name: "location", data: [] },
                    size: { index: 0, name: "size", data: [], format: "" },
                },
                true,
            ],
            [
                false,
                "color measure is in bucket",
                {
                    location: { index: 0, name: "location", data: [] },
                    color: { index: 1, name: "color", data: [], format: "" },
                },
                true,
            ],
            [
                false,
                "segment attribute is in bucket",
                {
                    location: { index: 0, name: "location", data: [] },
                    segment: { index: 1, name: "segment", data: [], uris: [] },
                },
                true,
            ],
            [
                true,
                "tooltipText attribute is in bucket",
                {
                    location: { index: 0, name: "location", data: [] },
                    tooltipText: { index: 1, name: "tooltipText", data: [] },
                },
                true,
            ],
            [
                true,
                "only location attribute is in bucket",
                {
                    location: { index: 0, name: "location", data: [] },
                },
                true,
            ],
            [
                false,
                "configuration groupNearbyPoints is false",
                {
                    location: { index: 0, name: "location", data: [] },
                },
                false,
            ],
        ];

        it.each(Scenarios)(
            "should return %s when %s",
            (expectedValue: boolean, _description: string, geoData: IGeoData, groupNearbyPoints: boolean) => {
                expect(isClusteringAllowed(geoData, groupNearbyPoints)).toEqual(expectedValue);
            },
        );
    });

    describe("isPointsConfigChanged", () => {
        const pointsConfig: IGeoPointsConfig = {
            groupNearbyPoints: true,
            minSize: "normal",
            maxSize: "normal",
        };
        it("should return false without changes", () => {
            expect(isPointsConfigChanged(pointsConfig, pointsConfig)).toBe(false);
        });

        it.each([
            ["groupNearbyPoints", false],
            ["minSize", "0.5x"],
            ["maxSize", "1.25x"],
        ])("should return true when %s is changed", (configKey: string, configValue: string | boolean) => {
            expect(
                isPointsConfigChanged(pointsConfig, {
                    [configKey]: configValue,
                }),
            ).toBe(true);
        });
    });

    describe("isColorAssignmentItemChanged", () => {
        const colorAssignment: IColorAssignment[] = [
            {
                color: { type: "guid", value: "1" },
                headerItem: {
                    attributeHeaderItem: {
                        name: "General Goods",
                        uri: "/gdc/md/storybook/obj/23/elements?id=1",
                    },
                },
            },
        ];

        it("should return false without changes", () => {
            expect(isColorAssignmentItemChanged(colorAssignment, colorAssignment)).toBe(false);
        });

        it("should return true with colorAssignment is different", () => {
            const prevColorAssignment: IColorAssignment[] = [
                ...colorAssignment,
                {
                    color: { type: "guid", value: "2" },
                    headerItem: {
                        attributeHeaderItem: {
                            name: "General Goods",
                            uri: "/gdc/md/storybook/obj/23/elements?id=2",
                        },
                    },
                },
            ];
            expect(isColorAssignmentItemChanged(prevColorAssignment, colorAssignment)).toBe(true);
        });
    });
});
