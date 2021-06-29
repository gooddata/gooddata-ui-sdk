// (C) 2021 GoodData Corporation
import { DashboardTester, preloadedTesterFactory } from "../../tests/DashboardTester";
import {
    createTestInsightItem,
    EmptyDashboardIdentifier,
    PivotTableWithRowAndColumnAttributes,
    TestSectionHeader,
    TreemapWithOneMeasureAndViewByDateAndSegmentByDate,
    TreemapWithSingleMeasureAndViewByFilteredToOneElement,
} from "../../tests/Dashboard.fixtures";
import { addLayoutSection } from "../../commands";
import { InsightAttributesMeta, queryInsightAttributesMeta } from "../../queries";
import { insightRef } from "@gooddata/sdk-model";

describe("query insight attributes meta", () => {
    let Tester: DashboardTester;
    beforeEach(preloadedTesterFactory((tester) => (Tester = tester), EmptyDashboardIdentifier));

    it("should return metadata for insight with multiple attributes in buckets", async () => {
        await Tester.dispatchAndWaitFor(
            addLayoutSection(-1, TestSectionHeader, [
                createTestInsightItem(PivotTableWithRowAndColumnAttributes),
            ]),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        );

        const result: InsightAttributesMeta = await Tester.query(
            queryInsightAttributesMeta(insightRef(PivotTableWithRowAndColumnAttributes)),
        );

        expect(result.displayForms.length).toEqual(4);
        expect(result.attributes.length).toEqual(4);
        expect(result).toMatchSnapshot();
    });

    it("should return metadata for insight with attribute filter", async () => {
        await Tester.dispatchAndWaitFor(
            addLayoutSection(-1, TestSectionHeader, [
                createTestInsightItem(TreemapWithSingleMeasureAndViewByFilteredToOneElement),
            ]),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        );

        const result: InsightAttributesMeta = await Tester.query(
            queryInsightAttributesMeta(insightRef(TreemapWithSingleMeasureAndViewByFilteredToOneElement)),
        );

        expect(result.displayForms.length).toEqual(1);
        expect(result.attributes.length).toEqual(1);
        expect(result).toMatchSnapshot();
    });

    it("should return metadata for insight with date attributes in buckets", async () => {
        await Tester.dispatchAndWaitFor(
            addLayoutSection(-1, TestSectionHeader, [
                createTestInsightItem(TreemapWithOneMeasureAndViewByDateAndSegmentByDate),
            ]),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        );

        const result: InsightAttributesMeta = await Tester.query(
            queryInsightAttributesMeta(insightRef(TreemapWithOneMeasureAndViewByDateAndSegmentByDate)),
        );

        expect(result.displayForms.length).toEqual(2);
        expect(result.attributes.length).toEqual(2);
        expect(result).toMatchSnapshot();
    });
});
