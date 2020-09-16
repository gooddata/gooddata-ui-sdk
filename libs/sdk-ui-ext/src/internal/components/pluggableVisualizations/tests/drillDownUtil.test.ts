// (C) 2020 GoodData Corporation

import { newAttribute, newBucket, newInsightDefinition } from "@gooddata/sdk-model";
import { IImplicitDrillDown } from "../../..";
import { modifyBucketsAttributesForDrillDown } from "../drillDownUtil";
import { Account, Department, Region, Status, Won } from "@gooddata/reference-workspace/dist/ldm/full";
import { insightDefinitionToInsight } from "./testHelpers";

describe("drillDownUtil", () => {
    describe("modifyBucketsAttributesForDrillDown", () => {
        it("should replace drill target attribute and remove preceding items in the bucket", () => {
            const source = newInsightDefinition("visclass", (b) => {
                return b
                    .title("sourceInsight")
                    .buckets([newBucket("measure", Won), newBucket("attribute", Region, Department, Status)]);
            });

            const drillConfig: IImplicitDrillDown = {
                implicitDrillDown: {
                    from: { drillFromAttribute: { localIdentifier: Department.attribute.localIdentifier } },
                    drillDownStep: {
                        drillToAttribute: {
                            attributeDisplayForm: Account.Default.attribute.displayForm,
                        },
                    },
                },
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

            const drillConfig: IImplicitDrillDown = {
                implicitDrillDown: {
                    from: { drillFromAttribute: { localIdentifier: Region.attribute.localIdentifier } },
                    drillDownStep: {
                        drillToAttribute: {
                            attributeDisplayForm: Department.attribute.displayForm,
                        },
                    },
                },
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
    });
});
