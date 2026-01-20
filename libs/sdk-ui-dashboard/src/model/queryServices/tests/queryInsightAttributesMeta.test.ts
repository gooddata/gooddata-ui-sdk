// (C) 2021-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { type IDashboard, idRef, insightRef } from "@gooddata/sdk-model";

import { createDefaultFilterContext } from "../../../_staging/dashboard/defaultFilterContext.js";
import { defaultDateFilterConfig } from "../../../_staging/dateFilterConfig/defaultConfig.js";
import { EmptyDashboardLayout } from "../../commandHandlers/dashboard/common/dashboardInitialize.js";
import { addLayoutSection } from "../../commands/index.js";
import { type IInsightAttributesMeta, queryInsightAttributesMeta } from "../../queries/index.js";
import { type DashboardTester, preloadedTesterFactory } from "../../tests/DashboardTester.js";
import {
    EmptyDashboardIdentifier,
    EmptyDashboardWithReferences,
} from "../../tests/fixtures/Dashboard.fixtures.js";
import {
    PivotTableWithRowAndColumnAttributes,
    TreemapWithOneMeasureAndViewByDateAndSegmentByDate,
    TreemapWithSingleMeasureAndViewByFilteredToOneElement,
} from "../../tests/fixtures/Insights.fixtures.js";
import { TestSectionHeader, createTestInsightItem } from "../../tests/fixtures/Layout.fixtures.js";
import { type PrivateDashboardContext } from "../../types/commonTypes.js";

describe("query insight attributes meta", () => {
    let Tester: DashboardTester;

    const dashboardWithDefaults: IDashboard = {
        ...EmptyDashboardWithReferences.dashboard,
        ref: idRef(EmptyDashboardIdentifier),
        identifier: EmptyDashboardIdentifier,
        layout: EmptyDashboardLayout,
        filterContext: createDefaultFilterContext(
            defaultDateFilterConfig,
            true,
        ) as IDashboard["filterContext"],
    };

    const customizationFnsWithPreload: PrivateDashboardContext = {
        preloadedDashboard: dashboardWithDefaults,
    };

    beforeEach(async () => {
        await preloadedTesterFactory(
            (tester) => {
                Tester = tester;
            },
            EmptyDashboardIdentifier,
            {
                customizationFns: customizationFnsWithPreload,
            },
        );
    });

    it("should return metadata for insight with multiple attributes in buckets", async () => {
        await Tester.dispatchAndWaitFor(
            addLayoutSection(-1, TestSectionHeader, [
                createTestInsightItem(PivotTableWithRowAndColumnAttributes),
            ]),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        );

        const result: IInsightAttributesMeta = await Tester.query(
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

        const result: IInsightAttributesMeta = await Tester.query(
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

        const result: IInsightAttributesMeta = await Tester.query(
            queryInsightAttributesMeta(insightRef(TreemapWithOneMeasureAndViewByDateAndSegmentByDate)),
        );

        expect(result.displayForms.length).toEqual(2);
        expect(result.attributes.length).toEqual(2);
        expect(result).toMatchSnapshot();
    });
});
