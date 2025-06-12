// (C) 2023 GoodData Corporation
import { describe, expect, it } from "vitest";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { IBucket, IMeasure, newBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { IChartConfig } from "../../../interfaces/index.js";
import { createHeadlineProvider } from "../HeadlineProviderFactory.js";
import ComparisonProvider from "../internal/providers/ComparisonProvider.js";
import MultiMeasuresProvider from "../internal/providers/MultiMeasuresProvider.js";
import LegacyProvider from "../internal/providers/LegacyProvider.js";

describe("HeadlineProviderFactory", () => {
    describe("createHeadlineProvider", () => {
        const createBuckets = (
            primaryMeasure: IMeasure = null,
            secondaryMeasures: IMeasure[] = [],
        ): IBucket[] => {
            return [
                newBucket(BucketNames.MEASURES, primaryMeasure),
                newBucket(BucketNames.SECONDARY_MEASURES, ...secondaryMeasures),
            ];
        };

        const createConfig = (enabledComparison?: boolean): IChartConfig => {
            return enabledComparison === undefined
                ? {}
                : {
                      comparison: { enabled: enabledComparison },
                  };
        };

        it("should create LegacyProvider in case enableNewHeadline is off", () => {
            const buckets = createBuckets(ReferenceMd.Amount, [ReferenceMd.Amount_1.Sum]);
            const config = createConfig(true);

            expect(createHeadlineProvider(buckets, config, false)).toBeInstanceOf(LegacyProvider);
        });

        it("should create ComparisonProvider in case 1 primaryMeasure, 1 secondaryMeasure and comparison is enabled have provided", () => {
            const buckets = createBuckets(ReferenceMd.Amount, [ReferenceMd.Amount_1.Sum]);
            const config = createConfig(true);

            expect(createHeadlineProvider(buckets, config, true)).toBeInstanceOf(ComparisonProvider);
        });

        it("should create MultiMeasureProvider in case no measure has provided", () => {
            const buckets = createBuckets(ReferenceMd.Amount);
            const config = createConfig(true);

            expect(createHeadlineProvider(buckets, config, true)).toBeInstanceOf(MultiMeasuresProvider);
        });

        it("should create MultiMeasureProvider in case 1 primaryMeasure has provided", () => {
            const buckets = createBuckets();
            const config = createConfig(true);

            expect(createHeadlineProvider(buckets, config, true)).toBeInstanceOf(MultiMeasuresProvider);
        });

        it("should create MultiMeasureProvider in case 1 primaryMeasure and multiple secondaryMeasures has provided", () => {
            const buckets = createBuckets(ReferenceMd.Amount, [
                ReferenceMd.Amount_1.Sum,
                ReferenceMd.Amount_1.Avg,
            ]);
            const config = createConfig(true);

            expect(createHeadlineProvider(buckets, config, true)).toBeInstanceOf(MultiMeasuresProvider);
        });

        it("should create MultiMeasureProvider in case comparison is not enabled", () => {
            const buckets = createBuckets(ReferenceMd.Amount, [ReferenceMd.Amount_1.Sum]);
            const config = createConfig(false);

            expect(createHeadlineProvider(buckets, config, true)).toBeInstanceOf(MultiMeasuresProvider);
        });

        it("should create ComparisonProvider in case comparison is undefined", () => {
            const buckets = createBuckets(ReferenceMd.Amount, [ReferenceMd.Amount_1.Sum]);
            const config = createConfig();

            expect(createHeadlineProvider(buckets, config, true)).toBeInstanceOf(ComparisonProvider);
        });
    });
});
