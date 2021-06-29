// (C) 2021 GoodData Corporation
import { DashboardTester, preloadedTesterFactory } from "../../tests/DashboardTester";
import {
    createTestInsightItem,
    EmptyDashboardIdentifier,
    TestSectionHeader,
    TreemapWithOneMeasureAndViewByDateAndSegmentByDate,
} from "../../tests/Dashboard.fixtures";
import { addLayoutSection } from "../../commands";
import { InsightDateDatasets, queryDateDatasetsForInsight } from "../../queries";
import { insightRef } from "@gooddata/sdk-model";
import { ICatalogDateDataset } from "@gooddata/sdk-backend-spi";

function datasetsDigest(
    datasets: ReadonlyArray<ICatalogDateDataset | undefined>,
): ReadonlyArray<string | undefined> {
    return datasets.map((d) => d?.dataSet.title);
}

describe("query insight date datasets", () => {
    let Tester: DashboardTester;
    beforeEach(preloadedTesterFactory((tester) => (Tester = tester), EmptyDashboardIdentifier));

    it("should return date datasets for insight with date attributes in buckets", async () => {
        await Tester.dispatchAndWaitFor(
            addLayoutSection(-1, TestSectionHeader, [
                createTestInsightItem(TreemapWithOneMeasureAndViewByDateAndSegmentByDate),
            ]),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        );

        const result: InsightDateDatasets = await Tester.query(
            queryDateDatasetsForInsight(insightRef(TreemapWithOneMeasureAndViewByDateAndSegmentByDate)),
        );

        expect(result.usedInAttributes.length).toEqual(2);
        expect(result.usedInDateFilters).toEqual([]);
        expect(result.usedInAttributeFilters).toEqual([]);
        expect(result.mostImportantFromInsight).toEqual(result.usedInAttributes[0]);

        expect(datasetsDigest(result.usedInAttributes)).toMatchSnapshot();
    });
});
