// (C) 2022 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newBucket, newInsightDefinition } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { BubbleChartDescriptor } from "../BubbleChartDescriptor";

describe("BubbleChartDescriptor", () => {
    // TODO replace by some recording?
    const insight = newInsightDefinition("local:bubble", (i) =>
        i.buckets([
            newBucket(BucketNames.MEASURES, ReferenceMd.Amount),
            newBucket(BucketNames.VIEW, ReferenceMd.Region),
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
