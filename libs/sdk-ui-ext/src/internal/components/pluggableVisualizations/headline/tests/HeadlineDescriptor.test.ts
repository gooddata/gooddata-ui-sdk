// (C) 2022 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { modifyMeasure, newBucket, newInsightDefinition } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { HeadlineDescriptor } from "../HeadlineDescriptor";

describe("HeadlineDescriptor", () => {
    it("should generate embedding code without context", () => {
        // TODO replace by some recording?
        const insight = newInsightDefinition("local:headline", (i) =>
            i.buckets([
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
            ]),
        );
        const descriptor = new HeadlineDescriptor();

        expect(descriptor.getEmbeddingCode(insight)).toMatchSnapshot();
    });
});
