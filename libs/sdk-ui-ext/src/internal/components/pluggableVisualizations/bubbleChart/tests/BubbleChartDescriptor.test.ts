// (C) 2022 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    modifyAttribute,
    modifyMeasure,
    newArithmeticMeasure,
    newBucket,
    newInsightDefinition,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { BubbleChartDescriptor } from "../BubbleChartDescriptor";

describe("BubbleChartDescriptor", () => {
    // TODO replace by some recording?
    const insight = newInsightDefinition("local:bubble", (i) =>
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
            newBucket(
                BucketNames.TERTIARY_MEASURES,
                newArithmeticMeasure(
                    ["amount-custom-local-id", "velocity-custom-local-id"],
                    "multiplication",
                    (m) => m.title("Velocity times Amount"),
                ),
            ),
            newBucket(
                BucketNames.VIEW,
                modifyAttribute(ReferenceMd.Region, (a) =>
                    a.alias("Custom Region alias").localId("region-custom-local-id"),
                ),
            ),
        ]),
    );
    const descriptor = new BubbleChartDescriptor();

    type Scenario = [string, number | string];
    const scenarios: Scenario[] = [
        ["without height", undefined],
        ["with height as number", 1000],
        ["with height as string", "20rem"],
    ];

    it.each(scenarios)("should generate embedding code %s", (_, height) => {
        expect(descriptor.getEmbeddingCode(insight, { height })).toMatchSnapshot();
    });
});
