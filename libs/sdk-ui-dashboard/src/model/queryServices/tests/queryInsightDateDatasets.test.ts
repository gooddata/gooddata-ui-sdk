// (C) 2021 GoodData Corporation
import { DashboardTester, preloadedTesterFactory } from "../../tests/DashboardTester";
import {
    createTestInsightItem,
    EmptyDashboardIdentifier,
    PivotTableWithDateFilter,
    PivotTableWithRowAndColumnAttributes,
    TestSectionHeader,
    TreemapWithOneMeasureAndViewByDateAndSegmentByDate,
} from "../../tests/Dashboard.fixtures";
import { addLayoutSection, loadDashboard } from "../../commands";
import { InsightDateDatasets, queryDateDatasetsForInsight } from "../../queries";
import { IInsight, insightRef } from "@gooddata/sdk-model";
import { ICatalogDateDataset } from "@gooddata/sdk-backend-spi";
import includes from "lodash/includes";
import { invariant } from "ts-invariant";

function datasetsDigest(
    datasets: ReadonlyArray<ICatalogDateDataset | undefined>,
): ReadonlyArray<string | undefined> {
    return datasets.map((d) => d?.dataSet.title);
}

describe("query insight date datasets", () => {
    async function addTestSection(tester: DashboardTester, insight: IInsight) {
        await tester.dispatchAndWaitFor(loadDashboard(), "GDC.DASH/EVT.LOADED");
        await tester.dispatchAndWaitFor(
            addLayoutSection(-1, TestSectionHeader, [createTestInsightItem(insight)]),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        );
    }

    describe("for insights that reference dates", () => {
        let Tester: DashboardTester;
        beforeEach(preloadedTesterFactory((tester) => (Tester = tester), EmptyDashboardIdentifier));

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
        // given all available datasets, this availability mock will pick 2 by name and associate relevance so that second one has more relevance
        const MockAvailabilityWithDifferentRelevance = (
            datasets: ICatalogDateDataset[],
        ): ICatalogDateDataset[] => {
            const available = datasets
                .filter((d) => includes(["Date (Activity)", "Date (Timeline)"], d.dataSet.title))
                .map((d) => {
                    return {
                        ...d,
                        relevance: d.dataSet.title === "Date (Timeline)" ? 1 : 0,
                    };
                });

            invariant(available.length === 2, "unexpected mock");
            return available;
        };

        // given all available datasets, this mock will pick 2 by name and ensure they have same relevance
        const MockAvailabilityWithSameRelevance = (
            datasets: ICatalogDateDataset[],
        ): ICatalogDateDataset[] => {
            const available = datasets
                .filter((d) => includes(["Date (Activity)", "Date (Timeline)"], d.dataSet.title))
                .map((d) => {
                    return {
                        ...d,
                        relevance: 1,
                    };
                });

            invariant(available.length === 2, "unexpected mock");
            return available;
        };

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
