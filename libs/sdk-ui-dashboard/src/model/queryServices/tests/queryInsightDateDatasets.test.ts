// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../tests/DashboardTester.js";
import { EmptyDashboardIdentifier } from "../../tests/fixtures/Dashboard.fixtures.js";
import { addLayoutSection, initializeDashboard } from "../../commands/index.js";
import { InsightDateDatasets, queryDateDatasetsForInsight } from "../../queries/index.js";
import { IInsight, insightRef, ICatalogDateDataset } from "@gooddata/sdk-model";
import {
    MockAvailabilityWithDifferentRelevance,
    MockAvailabilityWithSameRelevance,
} from "../../tests/fixtures/CatalogAvailability.fixtures.js";
import {
    PivotTableWithDateFilter,
    PivotTableWithRowAndColumnAttributes,
    TreemapWithOneMeasureAndViewByDateAndSegmentByDate,
} from "../../tests/fixtures/Insights.fixtures.js";
import { createTestInsightItem, TestSectionHeader } from "../../tests/fixtures/Layout.fixtures.js";

function datasetsDigest(
    datasets: ReadonlyArray<ICatalogDateDataset | undefined>,
): ReadonlyArray<string | undefined> {
    return datasets.map((d) => d?.dataSet.title);
}

describe("query insight date datasets", () => {
    async function addTestSection(tester: DashboardTester, insight: IInsight) {
        await tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED");
        await tester.dispatchAndWaitFor(
            addLayoutSection(-1, TestSectionHeader, [createTestInsightItem(insight)]),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        );
    }

    describe("for insights that reference dates", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, EmptyDashboardIdentifier);
        });

        it("should return date datasets for insight with date attributes in buckets", async () => {
            await addTestSection(Tester, TreemapWithOneMeasureAndViewByDateAndSegmentByDate);
            const result: InsightDateDatasets = await Tester.query(
                queryDateDatasetsForInsight(insightRef(TreemapWithOneMeasureAndViewByDateAndSegmentByDate)),
            );

            expect(datasetsDigest(result.usedInAttributes)).toMatchSnapshot();
            expect(result.usedInDateFilters).toEqual([]);
            expect(result.usedInAttributeFilters).toEqual([]);
            expect(result.mostImportantFromInsight).toEqual(result.usedInAttributes[0]);

            expect(datasetsDigest(result.dateDatasetsOrdered)).toMatchSnapshot();
            expect(result.dateDatasetDisplayNames).toMatchSnapshot();
        });

        it("should return date datasets for insight with date filter", async () => {
            await addTestSection(Tester, PivotTableWithDateFilter);
            const result: InsightDateDatasets = await Tester.query(
                queryDateDatasetsForInsight(insightRef(PivotTableWithDateFilter)),
            );

            expect(datasetsDigest(result.usedInDateFilters)).toMatchSnapshot();
            expect(result.usedInAttributes).toEqual([]);
            expect(result.usedInAttributeFilters).toEqual([]);
            expect(result.mostImportantFromInsight).toEqual(result.usedInDateFilters[0]);

            expect(datasetsDigest(result.dateDatasetsOrdered)).toMatchSnapshot();
            expect(result.dateDatasetDisplayNames).toMatchSnapshot();
        });
    });

    describe("for datasets obtained from catalog", () => {
        it("should order date datasets by relevance desc", async () => {
            const Tester = DashboardTester.forRecording(
                EmptyDashboardIdentifier,
                {},
                {
                    catalogAvailability: {
                        availableDateDatasets: MockAvailabilityWithDifferentRelevance,
                    },
                },
            );

            await addTestSection(Tester, PivotTableWithRowAndColumnAttributes);

            const result: InsightDateDatasets = await Tester.query(
                queryDateDatasetsForInsight(insightRef(PivotTableWithRowAndColumnAttributes)),
            );

            expect(datasetsDigest(result.dateDatasetsOrdered)).toMatchSnapshot();
            expect(result.dateDatasetDisplayNames).toMatchSnapshot();
            expect(result.mostImportantFromInsight).toBeUndefined();
            expect([
                ...result.usedInAttributes,
                ...result.usedInAttributeFilters,
                ...result.usedInDateFilters,
            ]).toEqual([]);
        });

        it("should order date datasets by relevance and title if tied", async () => {
            const Tester = DashboardTester.forRecording(
                EmptyDashboardIdentifier,
                {},
                {
                    catalogAvailability: {
                        availableDateDatasets: MockAvailabilityWithSameRelevance,
                    },
                },
            );

            await addTestSection(Tester, PivotTableWithRowAndColumnAttributes);

            const result: InsightDateDatasets = await Tester.query(
                queryDateDatasetsForInsight(insightRef(PivotTableWithRowAndColumnAttributes)),
            );

            expect(datasetsDigest(result.dateDatasetsOrdered)).toMatchSnapshot();
            expect(result.dateDatasetDisplayNames).toMatchSnapshot();
            expect(result.mostImportantFromInsight).toBeUndefined();
            expect([
                ...result.usedInAttributes,
                ...result.usedInAttributeFilters,
                ...result.usedInDateFilters,
            ]).toEqual([]);
        });
    });
});
