// (C) 2022 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { modifyAttribute, modifyMeasure, newBucket, newInsightDefinition } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { GeoPushpinChartDescriptor } from "../GeoPushpinChartDescriptor";

describe("GeoPushpinChartDescriptor", () => {
    it("should generate embedding code without context", () => {
        // TODO replace by some recording?
        const insight = newInsightDefinition("local:pushpin", (i) =>
            i.buckets([
                newBucket(
                    BucketNames.LOCATION,
                    modifyAttribute(ReferenceMd.Region, (a) =>
                        a.alias("Custom Region alias").localId("region-custom-local-id"),
                    ),
                ),
                newBucket(
                    BucketNames.SIZE,
                    modifyMeasure(ReferenceMd.Amount, (m) =>
                        m.alias("Custom Amount alias").localId("amount-custom-local-id"),
                    ),
                ),
                newBucket(
                    BucketNames.COLOR,
                    modifyMeasure(ReferenceMd.Velocity.Sum, (m) =>
                        m.alias("Custom Velocity alias").localId("velocity-custom-local-id"),
                    ),
                ),
                newBucket(
                    BucketNames.VIEW,
                    modifyAttribute(ReferenceMd.Department, (a) =>
                        a.alias("Custom Department alias").localId("department-custom-local-id"),
                    ),
                ),
            ]),
        );
        const descriptor = new GeoPushpinChartDescriptor();

        expect(descriptor.getEmbeddingCode(insight)).toMatchSnapshot();
    });
});
