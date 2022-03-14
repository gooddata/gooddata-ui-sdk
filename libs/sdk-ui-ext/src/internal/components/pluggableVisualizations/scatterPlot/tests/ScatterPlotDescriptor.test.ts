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
import { ScatterPlotDescriptor } from "../ScatterPlotDescriptor";

describe("ScatterPlotDescriptor", () => {
    it("should generate embedding code without context", () => {
        // TODO replace by some recording?
        const insight = newInsightDefinition("local:scatter", (i) =>
            i
                .buckets([
                    newBucket(
                        BucketNames.MEASURES,
                        modifyMeasure(ReferenceMd.Amount, (m) =>
                            m.alias("Custom Amount alias").localId("amount-custom-local-id"),
                        ),
                    ),
                    newBucket(
                        BucketNames.SECONDARY_MEASURES,
                        modifyMeasure(ReferenceMd.Velocity.Sum, (m) =>
                            m.alias("Custom Velocity alias").localId("velocity-custom-local-id"),
                        ),
                    ),
                    newBucket(
                        BucketNames.ATTRIBUTE,
                        modifyAttribute(ReferenceMd.Region, (a) =>
                            a.alias("Custom Region alias").localId("region-custom-local-id"),
                        ),
                    ),
                ])
                .filters([
                    newMeasureValueFilter("amount-custom-local-id", "GREATER_THAN_OR_EQUAL_TO", 42, 0),
                ]),
        );
        const descriptor = new ScatterPlotDescriptor();

        expect(descriptor.getEmbeddingCode(insight)).toMatchSnapshot();
    });
});
