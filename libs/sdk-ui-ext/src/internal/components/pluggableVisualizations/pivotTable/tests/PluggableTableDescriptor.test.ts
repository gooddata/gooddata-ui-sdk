// (C) 2022 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    modifyAttribute,
    modifyMeasure,
    newAttributeSort,
    newBucket,
    newInsightDefinition,
    newTotal,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { newWidthForAttributeColumn } from "@gooddata/sdk-ui-pivot";
import { PivotTableDescriptor } from "../PivotTableDescriptor";

describe("PivotTableDescriptor", () => {
    it("should generate embedding code without context", () => {
        // TODO replace by some recording?
        const insight = newInsightDefinition("local:table", (i) =>
            i
                .buckets([
                    newBucket(
                        BucketNames.MEASURES,
                        modifyMeasure(ReferenceMd.Amount, (m) =>
                            m.alias("Custom Amount alias").localId("amount-custom-local-id"),
                        ),
                    ),
                    newBucket(
                        BucketNames.ATTRIBUTE,
                        modifyAttribute(ReferenceMd.Region, (a) =>
                            a.alias("Custom Region alias").localId("region-custom-local-id"),
                        ),
                        modifyAttribute(ReferenceMd.Department, (a) =>
                            a.alias("Custom Department alias").localId("department-custom-local-id"),
                        ),
                        newTotal("sum", "amount-custom-local-id", "region-custom-local-id"),
                        newTotal("sum", "amount-custom-local-id", "department-custom-local-id"),
                    ),
                    newBucket(
                        BucketNames.COLUMNS,
                        modifyAttribute(ReferenceMd.Activity.Subject, (a) =>
                            a.alias("Custom Subject alias").localId("subject-custom-local-id"),
                        ),
                    ),
                ])
                .sorts([newAttributeSort("region-custom-local-id", "asc")])
                .properties({
                    controls: {
                        columnWidths: [
                            newWidthForAttributeColumn("region-custom-local-id", 256),
                            newWidthForAttributeColumn("department-custom-local-id", 180),
                        ],
                    },
                }),
        );
        const descriptor = new PivotTableDescriptor();

        expect(descriptor.getEmbeddingCode(insight)).toMatchSnapshot();
    });
});
