// (C) 2020-2024 GoodData Corporation

import {
    insightFilters,
    localIdRef,
    newAttribute,
    newAttributeSort,
    newBucket,
    newInsightDefinition,
    newRankingFilter,
} from "@gooddata/sdk-model";
import { reverseAndTrimIntersection, modifyBucketsAttributesForDrillDown } from "../drillDownUtil.js";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { insightDefinitionToInsight } from "./testHelpers.js";
import { IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { reverseAndTrimIntersectionMock } from "./reverseAndTrimIntersectionMock.js";
import { IDrillDownDefinition } from "../../../interfaces/Visualization.js";
import { describe, it, expect } from "vitest";

const { Account, Department, Region, Status, Won } = ReferenceMd;

describe("drillDownUtil", () => {
    describe("modifyBucketsAttributesForDrillDown", () => {
        it("should replace drill target attribute and remove preceding items in the bucket", () => {
            const source = newInsightDefinition("visclass", (b) => {
                return b
                    .title("sourceInsight")
                    .buckets([
                        newBucket("measure", Won),
                        newBucket("attribute", Region.Default, Department.Default, Status),
                    ]);
            });

            const drillConfig: IDrillDownDefinition = {
                type: "drillDown",
                origin: localIdRef(Department.Default.attribute.localIdentifier),
                target: Account.Default.attribute.displayForm,
            };

            const sourceInsight = insightDefinitionToInsight(source, "uri", "id");
            const result = modifyBucketsAttributesForDrillDown(sourceInsight, drillConfig);

            const replacedDepartmentToAccount = newAttribute(Account.Default.attribute.displayForm, (b) =>
                b.localId(Department.Default.attribute.localIdentifier),
            );

            const expected = newInsightDefinition("visclass", (b) => {
                return b
                    .title("sourceInsight")
                    .buckets([
                        newBucket("measure", Won),
                        newBucket("attribute", replacedDepartmentToAccount, Status),
                    ]);
            });

            const expectedInsight = insightDefinitionToInsight(expected, "uri", "id");
            expect(result).toEqual(expectedInsight);
        });

        it("should remove duplicities caused by drill down target already present in the insight", () => {
            const source = newInsightDefinition("visclass", (b) => {
                return b
                    .title("sourceInsight")
                    .buckets([
                        newBucket("measure", Won),
                        newBucket("attribute", Region.Default, Department.Default),
                    ]);
            });

            const drillConfig: IDrillDownDefinition = {
                type: "drillDown",
                origin: localIdRef(Region.Default.attribute.localIdentifier),
                target: Department.Default.attribute.displayForm,
            };

            const sourceInsight = insightDefinitionToInsight(source, "uri", "id");
            const result = modifyBucketsAttributesForDrillDown(sourceInsight, drillConfig);

            const replacedRegionToCustomDepartment = newAttribute(
                Department.Default.attribute.displayForm,
                (b) => b.localId(Region.Default.attribute.localIdentifier),
            );

            const expected = newInsightDefinition("visclass", (b) => {
                return b
                    .title("sourceInsight")
                    .buckets([
                        newBucket("measure", Won),
                        newBucket("attribute", replacedRegionToCustomDepartment),
                    ]);
            });

            const expectedInsight = insightDefinitionToInsight(expected, "uri", "id");
            expect(result).toEqual(expectedInsight);
        });

        it("should remove sorts related to removed attributes", () => {
            const source = newInsightDefinition("visclass", (b) => {
                return b
                    .title("sourceInsight")
                    .buckets([
                        newBucket("measure", Won),
                        newBucket("attribute", Region.Default, Department.Default),
                    ])
                    .sorts([
                        newAttributeSort(Region.Default, "desc"),
                        newAttributeSort(Department.Default, "asc"),
                    ]);
            });

            const drillConfig: IDrillDownDefinition = {
                type: "drillDown",
                origin: localIdRef(Region.Default.attribute.localIdentifier),
                target: Department.Default.attribute.displayForm,
            };

            const sourceInsight = insightDefinitionToInsight(source, "uri", "id");
            const result = modifyBucketsAttributesForDrillDown(sourceInsight, drillConfig);

            // using the direct reference, not insightSorts, because insightSorts will remove the invalid sorts as well
            expect(result.insight.sorts).toEqual([newAttributeSort(Region.Default, "desc")]);
        });

        it("should remove filters related to removed attributes", () => {
            const filters = [
                newRankingFilter(Won, "TOP", 3),
                newRankingFilter(Won, [Region.Default], "TOP", 3),
                newRankingFilter(Won, [Department.Default], "BOTTOM", 3), // this one must go
            ];
            const source = newInsightDefinition("visclass", (b) => {
                return b
                    .title("sourceInsight")
                    .buckets([
                        newBucket("measure", Won),
                        newBucket("attribute", Region.Default, Department.Default),
                    ])
                    .filters(filters);
            });

            const drillConfig: IDrillDownDefinition = {
                type: "drillDown",
                origin: localIdRef(Region.Default.attribute.localIdentifier),
                target: Department.Default.attribute.displayForm,
            };

            const sourceInsight = insightDefinitionToInsight(source, "uri", "id");
            const result = modifyBucketsAttributesForDrillDown(sourceInsight, drillConfig);

            expect(insightFilters(result)).toEqual(filters.slice(0, 2));
        });
    });

    describe("reverseAndTrimIntersection", () => {
        const {
            drillConfigRegion,
            intersectionWithOuterDepartment,
            intersectionWithOuterRegion,
            intersectionWithOuterDepartmentResult,
            intersectionWithOuterRegionResult,
        } = reverseAndTrimIntersectionMock;

        const invalidScenarios: Array<[string, IDrillEventIntersectionElement[]?]> = [
            ["undefined", undefined],
            ["null", null],
            ["empty", []],
        ];
        it.each(invalidScenarios)(
            "should handle '%s' intersection and return the original intersection",
            (_name, intersection?) => {
                const actual = reverseAndTrimIntersection(drillConfigRegion, intersection);
                expect(actual).toEqual(intersection);
            },
        );

        it("should cut and reverse the intersection when drilling to inner attribute", () => {
            const actual = reverseAndTrimIntersection(drillConfigRegion, intersectionWithOuterDepartment);
            expect(actual).toEqual(intersectionWithOuterDepartmentResult);
        });

        it("should cut and reverse the intersection when drilling to outer attribute", () => {
            const actual = reverseAndTrimIntersection(drillConfigRegion, intersectionWithOuterRegion);
            expect(actual).toEqual(intersectionWithOuterRegionResult);
        });
    });
});
