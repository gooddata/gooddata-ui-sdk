// (C) 2020-2021 GoodData Corporation

import {
    localIdRef,
    newAttribute,
    newAttributeSort,
    newBucket,
    newInsightDefinition,
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
                    .buckets([newBucket("measure", Won), newBucket("attribute", Region, Department, Status)]);
            });

            const drillConfig: IDrillDownDefinition = {
                type: "drillDown",
                origin: localIdRef(Department.attribute.localIdentifier),
                target: Account.Default.attribute.displayForm,
            };

            const sourceInsight = insightDefinitionToInsight(source, "uri", "id");
            const result = modifyBucketsAttributesForDrillDown(sourceInsight, drillConfig);

            const replacedDepartmentToAccount = newAttribute(Account.Default.attribute.displayForm, (b) =>
                b.localId(Department.attribute.localIdentifier),
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
                    .buckets([newBucket("measure", Won), newBucket("attribute", Region, Department)]);
            });

            const drillConfig: IDrillDownDefinition = {
                type: "drillDown",
                origin: localIdRef(Region.attribute.localIdentifier),
                target: Department.attribute.displayForm,
            };

            const sourceInsight = insightDefinitionToInsight(source, "uri", "id");
            const result = modifyBucketsAttributesForDrillDown(sourceInsight, drillConfig);

            const replacedRegionToCustomDepartment = newAttribute(Department.attribute.displayForm, (b) =>
                b.localId(Region.attribute.localIdentifier),
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
                    .buckets([newBucket("measure", Won), newBucket("attribute", Region, Department)])
                    .sorts([newAttributeSort(Region, "desc"), newAttributeSort(Department, "asc")]);
            });

            const drillConfig: IDrillDownDefinition = {
                type: "drillDown",
                origin: localIdRef(Region.attribute.localIdentifier),
                target: Department.attribute.displayForm,
            };

            const sourceInsight = insightDefinitionToInsight(source, "uri", "id");
            const result = modifyBucketsAttributesForDrillDown(sourceInsight, drillConfig);

            // using the direct reference, not insightSorts, because insightSorts will remove the invalid sorts as well
            expect(result.insight.sorts).toEqual([newAttributeSort(Region, "desc")]);
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
