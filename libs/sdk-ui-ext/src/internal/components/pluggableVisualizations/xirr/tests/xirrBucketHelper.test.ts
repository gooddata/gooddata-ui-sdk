// (C) 2019-2020 GoodData Corporation
import { getXirrBuckets } from "../xirrBucketHelper.js";
import { IReferencePoint, IBucketOfFun } from "../../../../interfaces/Visualization.js";
import { BucketNames } from "@gooddata/sdk-ui";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks.js";
import { describe, it, expect } from "vitest";

describe("xirrBucketHelper", () => {
    const validMeasureBucket: IBucketOfFun = {
        localIdentifier: BucketNames.MEASURES,
        items: [referencePointMocks.masterMeasureItems[0]],
    };

    const arithmeticMeasureBucket: IBucketOfFun = {
        localIdentifier: BucketNames.MEASURES,
        items: [
            referencePointMocks.arithmeticMeasureItems[0],
            referencePointMocks.masterMeasureItems[0],
            referencePointMocks.masterMeasureItems[1],
        ],
    };

    const popMeasureBucket: IBucketOfFun = {
        localIdentifier: BucketNames.MEASURES,
        items: [referencePointMocks.derivedMeasureItems[0], referencePointMocks.masterMeasureItems[0]],
    };

    const emptyMeasureBucket: IBucketOfFun = {
        localIdentifier: BucketNames.MEASURES,
        items: [],
    };

    const validAttributeBucket: IBucketOfFun = {
        localIdentifier: BucketNames.ATTRIBUTE,
        items: [referencePointMocks.dateItem],
    };

    const emptyAttributeBucket: IBucketOfFun = {
        localIdentifier: BucketNames.ATTRIBUTE,
        items: [],
    };

    const getReferencePoint = (buckets: IBucketOfFun[]): IReferencePoint => ({
        buckets,
        filters: {
            items: [],
            localIdentifier: "filters",
        },
    });

    describe("getXirrBuckets", () => {
        it("should maintain existing buckets", () => {
            const buckets = [validMeasureBucket, validAttributeBucket];
            const input = getReferencePoint(buckets);
            const actual = getXirrBuckets(input);

            expect(actual).toEqual(buckets);
        });

        it("should add default buckets if some are missing", () => {
            const buckets = [validAttributeBucket];
            const input = getReferencePoint(buckets);
            const actual = getXirrBuckets(input);

            expect(actual).toEqual([emptyMeasureBucket, validAttributeBucket]);
        });

        it("should remove extraneous buckets", () => {
            const buckets = [
                {
                    ...validMeasureBucket,
                    items: [...validMeasureBucket.items, referencePointMocks.masterMeasureItems[1]],
                },
                validAttributeBucket,
            ];
            const input = getReferencePoint(buckets);
            const actual = getXirrBuckets(input);

            expect(actual).toEqual([validMeasureBucket, validAttributeBucket]);
        });

        type MigrationTestCase = [string, IBucketOfFun[], IBucketOfFun[]];
        const migrationTestCases: MigrationTestCase[] = [
            [
                "table without date attribute",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.ATTRIBUTE,
                        items: [referencePointMocks.attributeItems[0]],
                    },
                    {
                        localIdentifier: BucketNames.COLUMNS,
                        items: [referencePointMocks.attributeItems[1]],
                    },
                ],
                [validMeasureBucket, emptyAttributeBucket],
            ],
            [
                "table with date attribute in row",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.ATTRIBUTE,
                        items: [referencePointMocks.dateItem],
                    },
                    {
                        localIdentifier: BucketNames.COLUMNS,
                        items: [referencePointMocks.attributeItems[1]],
                    },
                ],
                [validMeasureBucket, validAttributeBucket],
            ],
            [
                "table with date attribute in column",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.ATTRIBUTE,
                        items: [referencePointMocks.attributeItems[0]],
                    },
                    {
                        localIdentifier: BucketNames.COLUMNS,
                        items: [referencePointMocks.dateItem],
                    },
                ],
                [validMeasureBucket, validAttributeBucket],
            ],
            [
                "table with date attribute in both row and column",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.ATTRIBUTE,
                        items: [referencePointMocks.dateItem],
                    },
                    {
                        localIdentifier: BucketNames.COLUMNS,
                        items: [{ ...referencePointMocks.dateItem, localIdentifier: "not matching" }],
                    },
                ],
                [validMeasureBucket, validAttributeBucket],
            ],
            [
                "bar/column chart without date attribute",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.ATTRIBUTE,
                        items: [referencePointMocks.attributeItems[0]],
                    },
                    {
                        localIdentifier: BucketNames.STACK,
                        items: [referencePointMocks.attributeItems[1]],
                    },
                ],
                [validMeasureBucket, emptyAttributeBucket],
            ],
            [
                "bar/column chart with date attribute",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.ATTRIBUTE,
                        items: [referencePointMocks.dateItem],
                    },
                    {
                        localIdentifier: BucketNames.STACK,
                        items: [referencePointMocks.attributeItems[1]],
                    },
                ],
                [validMeasureBucket, validAttributeBucket],
            ],
            [
                "line chart without date attribute",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.TREND,
                        items: [referencePointMocks.attributeItems[0]],
                    },
                    {
                        localIdentifier: BucketNames.SEGMENT,
                        items: [referencePointMocks.attributeItems[1]],
                    },
                ],
                [validMeasureBucket, emptyAttributeBucket],
            ],
            [
                "line chart with date attribute",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.TREND,
                        items: [referencePointMocks.dateItem],
                    },
                    {
                        localIdentifier: BucketNames.SEGMENT,
                        items: [referencePointMocks.attributeItems[1]],
                    },
                ],
                [validMeasureBucket, validAttributeBucket],
            ],
            [
                "area chart/heatmap without date attribute",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [referencePointMocks.attributeItems[0]],
                    },
                    {
                        localIdentifier: BucketNames.STACK,
                        items: [referencePointMocks.attributeItems[1]],
                    },
                ],
                [validMeasureBucket, emptyAttributeBucket],
            ],
            [
                "area chart/heatmap with date attribute in view",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [referencePointMocks.dateItem],
                    },
                    {
                        localIdentifier: BucketNames.STACK,
                        items: [referencePointMocks.attributeItems[0]],
                    },
                ],
                [validMeasureBucket, validAttributeBucket],
            ],
            [
                "area chart/heatmap with date attribute in stack",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [referencePointMocks.attributeItems[0]],
                    },
                    {
                        localIdentifier: BucketNames.STACK,
                        items: [referencePointMocks.dateItem],
                    },
                ],
                [validMeasureBucket, validAttributeBucket],
            ],
            [
                "combo chart with measure in primary measures bucket",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.SECONDARY_MEASURES,
                        items: [referencePointMocks.masterMeasureItems[1]],
                    },
                    {
                        localIdentifier: BucketNames.STACK,
                        items: [referencePointMocks.attributeItems[1]],
                    },
                ],
                [validMeasureBucket, emptyAttributeBucket],
            ],
            [
                "combo chart with measure in secondary measures bucket",
                [
                    {
                        localIdentifier: BucketNames.MEASURES,
                        items: [],
                    },
                    {
                        localIdentifier: BucketNames.SECONDARY_MEASURES,
                        items: [referencePointMocks.masterMeasureItems[0]],
                    },
                    {
                        localIdentifier: BucketNames.STACK,
                        items: [referencePointMocks.attributeItems[1]],
                    },
                ],
                [validMeasureBucket, emptyAttributeBucket],
            ],
            [
                "combo chart with date attribute in stack",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.SECONDARY_MEASURES,
                        items: [referencePointMocks.masterMeasureItems[1]],
                    },
                    {
                        localIdentifier: BucketNames.STACK,
                        items: [referencePointMocks.dateItem],
                    },
                ],
                [validMeasureBucket, validAttributeBucket],
            ],
            [
                "pie/donut chart without date attribute",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [referencePointMocks.attributeItems[0]],
                    },
                ],
                [validMeasureBucket, emptyAttributeBucket],
            ],
            [
                "pie/donut chart with date attribute",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [referencePointMocks.dateItem],
                    },
                ],
                [validMeasureBucket, validAttributeBucket],
            ],
            [
                "headline with measure",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.SECONDARY_MEASURES,
                        items: [referencePointMocks.masterMeasureItems[1]],
                    },
                ],
                [validMeasureBucket, emptyAttributeBucket],
            ],
            [
                "scatter plot without date attribute",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.SECONDARY_MEASURES,
                        items: [referencePointMocks.masterMeasureItems[1]],
                    },
                    {
                        localIdentifier: BucketNames.ATTRIBUTE,
                        items: [referencePointMocks.attributeItems[1]],
                    },
                ],
                [validMeasureBucket, emptyAttributeBucket],
            ],
            [
                "scatter plot with date attribute",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.SECONDARY_MEASURES,
                        items: [referencePointMocks.masterMeasureItems[1]],
                    },
                    {
                        localIdentifier: BucketNames.ATTRIBUTE,
                        items: [referencePointMocks.dateItem],
                    },
                ],
                [validMeasureBucket, validAttributeBucket],
            ],
            [
                "bubble chart with primary measure",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.SECONDARY_MEASURES,
                        items: [referencePointMocks.masterMeasureItems[1]],
                    },
                    {
                        localIdentifier: BucketNames.TERTIARY_MEASURES,
                        items: [referencePointMocks.masterMeasureItems[2]],
                    },
                    {
                        localIdentifier: BucketNames.ATTRIBUTE,
                        items: [referencePointMocks.attributeItems[1]],
                    },
                ],
                [validMeasureBucket, emptyAttributeBucket],
            ],
            [
                "bubble chart with secondary measure",
                [
                    {
                        localIdentifier: BucketNames.MEASURES,
                        items: [],
                    },
                    {
                        localIdentifier: BucketNames.SECONDARY_MEASURES,
                        items: [referencePointMocks.masterMeasureItems[0]],
                    },
                    {
                        localIdentifier: BucketNames.TERTIARY_MEASURES,
                        items: [referencePointMocks.masterMeasureItems[1]],
                    },
                    {
                        localIdentifier: BucketNames.ATTRIBUTE,
                        items: [referencePointMocks.attributeItems[1]],
                    },
                ],
                [validMeasureBucket, emptyAttributeBucket],
            ],
            [
                "bubble chart with tertiary measure",
                [
                    {
                        localIdentifier: BucketNames.MEASURES,
                        items: [],
                    },
                    {
                        localIdentifier: BucketNames.SECONDARY_MEASURES,
                        items: [],
                    },
                    {
                        localIdentifier: BucketNames.TERTIARY_MEASURES,
                        items: [referencePointMocks.masterMeasureItems[0]],
                    },
                    {
                        localIdentifier: BucketNames.ATTRIBUTE,
                        items: [referencePointMocks.attributeItems[1]],
                    },
                ],
                [validMeasureBucket, emptyAttributeBucket],
            ],
            [
                "bubble chart without date attribute",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.SECONDARY_MEASURES,
                        items: [referencePointMocks.masterMeasureItems[1]],
                    },
                    {
                        localIdentifier: BucketNames.TERTIARY_MEASURES,
                        items: [referencePointMocks.masterMeasureItems[2]],
                    },
                    {
                        localIdentifier: BucketNames.ATTRIBUTE,
                        items: [referencePointMocks.attributeItems[1]],
                    },
                ],
                [validMeasureBucket, emptyAttributeBucket],
            ],
            [
                "bubble chart with date attribute",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.SECONDARY_MEASURES,
                        items: [referencePointMocks.masterMeasureItems[1]],
                    },
                    {
                        localIdentifier: BucketNames.TERTIARY_MEASURES,
                        items: [referencePointMocks.masterMeasureItems[2]],
                    },
                    {
                        localIdentifier: BucketNames.ATTRIBUTE,
                        items: [referencePointMocks.dateItem],
                    },
                ],
                [validMeasureBucket, validAttributeBucket],
            ],
            [
                "treemap without date attribute",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [referencePointMocks.attributeItems[0]],
                    },
                    {
                        localIdentifier: BucketNames.SEGMENT,
                        items: [referencePointMocks.attributeItems[1]],
                    },
                ],
                [validMeasureBucket, emptyAttributeBucket],
            ],
            [
                "treemap with date attribute in view",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [referencePointMocks.dateItem],
                    },
                    {
                        localIdentifier: BucketNames.SEGMENT,
                        items: [referencePointMocks.attributeItems[0]],
                    },
                ],
                [validMeasureBucket, validAttributeBucket],
            ],
            [
                "treemap with date attribute in segment",
                [
                    validMeasureBucket,
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [referencePointMocks.attributeItems[0]],
                    },
                    {
                        localIdentifier: BucketNames.SEGMENT,
                        items: [referencePointMocks.dateItem],
                    },
                ],
                [validMeasureBucket, validAttributeBucket],
            ],
            [
                "bar chart with arithmetic measure in the first place (RAIL-1931)",
                [
                    arithmeticMeasureBucket,
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [referencePointMocks.attributeItems[0]],
                    },
                    {
                        localIdentifier: BucketNames.SEGMENT,
                        items: [referencePointMocks.dateItem],
                    },
                ],
                [validMeasureBucket, validAttributeBucket],
            ],
            [
                "bar chart with PoP measure in the first place (RAIL-1931)",
                [
                    popMeasureBucket,
                    {
                        localIdentifier: BucketNames.VIEW,
                        items: [referencePointMocks.attributeItems[0]],
                    },
                    {
                        localIdentifier: BucketNames.SEGMENT,
                        items: [referencePointMocks.dateItem],
                    },
                ],
                [validMeasureBucket, validAttributeBucket],
            ],
        ];

        it.each(migrationTestCases)(
            "should correctly migrate from %s settings",
            (_, input: IBucketOfFun[], expected: IBucketOfFun[]) => {
                const actual = getXirrBuckets(getReferencePoint(input));
                expect(actual).toEqual(expected);
            },
        );
    });
});
