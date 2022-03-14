// (C) 2022 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { modifyAttribute, modifyMeasure, newBucket, newInsightDefinition } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { XirrDescriptor } from "../XirrDescriptor";

describe("XirrDescriptor", () => {
    it("should generate embedding code without context", () => {
        // TODO replace by some recording?
        const insight = newInsightDefinition("local:xirr", (i) =>
            i.buckets([
                newBucket(
                    BucketNames.MEASURES,
                    modifyMeasure(ReferenceMd.Amount, (m) =>
                        m.alias("Custom Amount alias").localId("amount-custom-local-id"),
                    ),
                ),
                newBucket(
                    BucketNames.ATTRIBUTE,
                    modifyAttribute(ReferenceMd.DateDatasets.Activity.Month.Short, (a) =>
                        a.alias("Custom Month alias").localId("month-custom-local-id"),
                    ),
                ),
            ]),
        );
        const descriptor = new XirrDescriptor();

        expect(descriptor.getEmbeddingCode(insight)).toMatchSnapshot();
    });
});
