// (C) 2007-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import {
    IInsight,
    bucketMeasures,
    idMatchMeasure,
    insightBucket,
    insightMeasures,
} from "@gooddata/sdk-model";

import {
    insightWithArithmeticAndDerivedMeasures,
    insightWithArithmeticMeasureTree,
    insightWithComplexArithmeticMeasureTree,
    insightWithMultipleMeasureBuckets,
    insightWithPoP,
    insightWithPoPAndAlias,
} from "../../../../__mocks__/fixtures.js";
import { fillMissingTitles } from "../fillMissingTitles.js";

describe("measureTitleHelper", () => {
    describe("fillMissingTitles", () => {
        const locale = "en-US";

        function getMeasureTitle(insight: IInsight, localIdentifier: string): string | undefined {
            const measures = insightMeasures(insight);
            const matchingMeasure = measures.find(idMatchMeasure(localIdentifier));

            return matchingMeasure === undefined ? undefined : matchingMeasure.measure.title;
        }

        it("should set title of derived measures based on master title when master is NOT renamed", () => {
            const result = fillMissingTitles(insightWithPoP, locale, 1000);

            expect(getMeasureTitle(result, "m1")).toEqual("# Accounts with AD Query");

            expect(getMeasureTitle(result, "m1_pop")).toEqual("# Accounts with AD Query - SP year ago");

            expect(getMeasureTitle(result, "m1_previous_period")).toEqual(
                "# Accounts with AD Query - period ago",
            );
        });

        it("should set title of derived measures based on master alias when master is renamed", () => {
            const result = fillMissingTitles(insightWithPoPAndAlias, locale, 1000);

            expect(getMeasureTitle(result, "m1")).toEqual("# Accounts with AD Query");

            expect(getMeasureTitle(result, "m1_pop")).toEqual("AD Queries - SP year ago");

            expect(getMeasureTitle(result, "m1_previous_period")).toEqual("AD Queries - period ago");
        });

        it("should ignore title attribute when it is included in derived / arithmetic measure (computed title)", () => {
            const result = fillMissingTitles(insightWithArithmeticAndDerivedMeasures, locale, 1000);

            expect(getMeasureTitle(result, "am1")).toEqual(
                "Sum of AD Accounts and AD Accounts - SP year ago",
            );

            expect(getMeasureTitle(result, "m1_pop")).toEqual("AD Accounts - SP year ago");
        });

        it("should set title of derived based on master title even when it is located in a different bucket", () => {
            const result = fillMissingTitles(insightWithMultipleMeasureBuckets, locale, 1000);

            expect(bucketMeasures(insightBucket(result, "measures")!)).toEqual([
                {
                    measure: {
                        localIdentifier: "fdd41e4ca6224cd2b5ecce15fdabf062",
                        title: "Sum of Email Clicks",
                        format: "#,##0.00",
                        definition: {
                            measureDefinition: {
                                aggregation: "sum",
                                item: {
                                    uri: "/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/15428",
                                },
                            },
                        },
                    },
                },
            ]);

            expect(bucketMeasures(insightBucket(result, "secondary_measures")!)).toEqual([
                {
                    measure: {
                        localIdentifier: "fdd41e4ca6224cd2b5ecce15fdabf062_pop",
                        title: "Sum of Email Clicks - SP year ago",
                        definition: {
                            popMeasureDefinition: {
                                measureIdentifier: "fdd41e4ca6224cd2b5ecce15fdabf062",
                                popAttribute: {
                                    uri: "/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/15330",
                                },
                            },
                        },
                    },
                },
                {
                    measure: {
                        localIdentifier: "fdd41e4ca6224cd2b5ecce15fdabf062_previous_period",
                        title: "Sum of Email Clicks - period ago",
                        definition: {
                            previousPeriodMeasure: {
                                measureIdentifier: "fdd41e4ca6224cd2b5ecce15fdabf062",
                                dateDataSets: [
                                    {
                                        dataSet: {
                                            uri: "/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/921",
                                        },
                                        periodsAgo: 1,
                                    },
                                ],
                            },
                        },
                    },
                },
            ]);
        });

        it("should set correct titles to arithmetic measures in simple tree", () => {
            const result = fillMissingTitles(insightWithArithmeticMeasureTree, locale, 1000);

            expect(getMeasureTitle(result, "tree_level_0")).toEqual("Sum of AD Accounts and KD Accounts");

            expect(getMeasureTitle(result, "tree_level_1")).toEqual(
                "Sum of AD Accounts and Sum of AD Accounts and KD Accounts",
            );

            expect(getMeasureTitle(result, "tree_level_2")).toEqual(
                "Sum of AD Accounts and Sum of AD Accounts and Sum of AD Accounts and KD Accounts",
            );
        });

        it("should respect max arithmetic measure title length", () => {
            const result = fillMissingTitles(insightWithArithmeticMeasureTree, locale, 50);

            expect(getMeasureTitle(result, "tree_level_0")).toEqual("Sum of AD Accounts and KD Accounts");

            expect(getMeasureTitle(result, "tree_level_1")).toEqual(
                "Sum of AD Accounts and Sum of AD Accounts and KD A…",
            );

            expect(getMeasureTitle(result, "tree_level_2")).toEqual(
                "Sum of AD Accounts and Sum of AD Accounts and Sum …",
            );
        });

        it("should set correct titles to arithmetic measures in the complex tree", () => {
            const result = fillMissingTitles(insightWithComplexArithmeticMeasureTree, locale, 1000);

            expect(
                getMeasureTitle(result, "arithmetic_measure_created_from_complicated_arithmetic_measures"),
            ).toEqual(
                "Sum of Sum of Sum of AD Queries and KD Queries and Sum of Renamed SP last year M1 " +
                    "and Renamed previous period M1 and Sum of # Accounts with AD Query and # Accounts with KD Query",
            );

            expect(getMeasureTitle(result, "arithmetic_measure_created_from_simple_measures")).toEqual(
                "Sum of # Accounts with AD Query and # Accounts with KD Query",
            );

            expect(
                getMeasureTitle(result, "arithmetic_measure_created_from_renamed_simple_measures"),
            ).toEqual("Sum of AD Queries and KD Queries");

            expect(getMeasureTitle(result, "arithmetic_measure_created_from_derived_measures")).toEqual(
                "Sum of # Accounts with AD Query - SP year ago and # Accounts with AD Query - period ago",
            );

            expect(
                getMeasureTitle(result, "arithmetic_measure_created_from_renamed_derived_measures"),
            ).toEqual("Sum of Renamed SP last year M1 and Renamed previous period M1");

            expect(getMeasureTitle(result, "arithmetic_measure_created_from_arithmetic_measures")).toEqual(
                "Sum of Sum of AD Queries and KD Queries and Sum of Renamed SP last year M1 and " +
                    "Renamed previous period M1",
            );

            expect(getMeasureTitle(result, "derived_measure_from_arithmetic_measure")).toEqual(
                "Sum of # Accounts with AD Query and # Accounts with KD Query - SP year ago",
            );

            expect(
                getMeasureTitle(result, "invalid_arithmetic_measure_with_missing_dependency"),
            ).toBeUndefined();

            expect(
                getMeasureTitle(result, "invalid_arithmetic_measure_with_cyclic_dependency_1"),
            ).toBeUndefined();

            expect(
                getMeasureTitle(result, "invalid_arithmetic_measure_with_cyclic_dependency_2"),
            ).toBeUndefined();
        });
    });
});
