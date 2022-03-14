// (C) 2022 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    modifyAttribute,
    modifyMeasure,
    newBucket,
    newInsightDefinition,
    newMeasureValueFilter,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { LineChartDescriptor } from "../LineChartDescriptor";

describe("LineChartDescriptor", () => {
    it("should generate embedding code without context", () => {
        // TODO replace by some recording?
        const insight = newInsightDefinition("local:line", (i) =>
            i
                .buckets([
                    newBucket(
                        BucketNames.MEASURES,
                        modifyMeasure(ReferenceMd.Amount, (m) =>
                            m.alias("Custom Amount alias").localId("amount-custom-local-id"),
                        ),
                    ),
                    newBucket(
                        BucketNames.TREND,
                        modifyAttribute(ReferenceMd.Region, (a) =>
                            a.alias("Custom Region alias").localId("region-custom-local-id"),
                        ),
                    ),
                    newBucket(
                        BucketNames.SEGMENT,
                        modifyAttribute(ReferenceMd.Department, (a) =>
                            a.alias("Custom Department alias").localId("department-custom-local-id"),
                        ),
                    ),
                ])
                .filters([
                    newMeasureValueFilter("amount-custom-local-id", "GREATER_THAN_OR_EQUAL_TO", 42, 0),
                ]),
        );
        const descriptor = new LineChartDescriptor();

        expect(descriptor.getEmbeddingCode(insight)).toMatchSnapshot();
    });
});
