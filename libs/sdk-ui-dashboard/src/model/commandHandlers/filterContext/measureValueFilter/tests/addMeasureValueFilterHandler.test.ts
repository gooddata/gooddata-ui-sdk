// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { DashboardAttributeFilterConfigModeValues, idRef } from "@gooddata/sdk-model";

import { addMeasureValueFilter } from "../../../../commands/filters.js";
import { type IDashboardCommandFailed } from "../../../../events/general.js";
import { selectMeasureValueFilterConfigsModeMap } from "../../../../store/tabs/measureValueFilterConfigs/measureValueFilterConfigsSelectors.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../../tests/fixtures/Dashboard.fixtures.js";
import { SimpleDashboardIdentifier } from "../../../../tests/fixtures/SimpleDashboard.fixtures.js";

describe("addMeasureValueFilterHandler", () => {
    let Tester: DashboardTester;
    const measureRef = idRef("87a053b0-3947-49f3-b0c5-de53fd01f050", "measure");
    const anotherMeasureRef = idRef("768414e1-4bbe-4f01-b125-0cdc6305dc76", "measure");

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("should set the measure value filter mode", async () => {
        await preloadedTesterFactory(
            (tester) => {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            {
                customCapabilities: {
                    supportsHiddenAndLockedFiltersOnUI: true,
                },
            },
        );

        await Tester.dispatchAndWaitFor(
            addMeasureValueFilter(
                measureRef,
                0,
                TestCorrelation,
                "test-mvf",
                undefined,
                DashboardAttributeFilterConfigModeValues.READONLY,
            ),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        const measureValueFilterConfigsModeMap = selectMeasureValueFilterConfigsModeMap(Tester.state());

        expect(Array.from(measureValueFilterConfigsModeMap.values())).toEqual([
            DashboardAttributeFilterConfigModeValues.READONLY,
        ]);
    });

    it("should not set measure value filter mode when supportsHiddenAndLockedFiltersOnUI is false", async () => {
        await preloadedTesterFactory(
            (tester) => {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            {
                customCapabilities: {
                    supportsHiddenAndLockedFiltersOnUI: false,
                },
            },
        );

        await Tester.dispatchAndWaitFor(
            addMeasureValueFilter(
                measureRef,
                0,
                TestCorrelation,
                "test-mvf",
                undefined,
                DashboardAttributeFilterConfigModeValues.READONLY,
            ),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        const measureValueFilterConfigsModeMap = selectMeasureValueFilterConfigsModeMap(Tester.state());
        expect(Array.from(measureValueFilterConfigsModeMap.values())).toEqual([]);
    });

    it("should not set measure value filter mode when mode is empty", async () => {
        await preloadedTesterFactory(
            (tester) => {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            {
                customCapabilities: {
                    supportsHiddenAndLockedFiltersOnUI: true,
                },
            },
        );

        await Tester.dispatchAndWaitFor(
            addMeasureValueFilter(measureRef, 0, TestCorrelation, "test-mvf"),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        const measureValueFilterConfigsModeMap = selectMeasureValueFilterConfigsModeMap(Tester.state());
        expect(Array.from(measureValueFilterConfigsModeMap.values())).toEqual([]);
    });

    it("should fail when localIdentifier is already used by another filter", async () => {
        await Tester.dispatchAndWaitFor(
            addMeasureValueFilter(measureRef, 0, TestCorrelation, "test-mvf"),
            "GDC.DASH/EVT.FILTER_CONTEXT.MEASURE_VALUE_FILTER.ADDED",
        );

        const event: IDashboardCommandFailed = await Tester.dispatchAndWaitFor(
            addMeasureValueFilter(anotherMeasureRef, 1, TestCorrelation, "test-mvf"),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(event.payload.message).toBe(
            "Filter with localIdentifier test-mvf already exists in the filter context.",
        );
    });
});
