// (C) 2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardAttributeFilterConfigModeValues, idRef, serializeObjRef } from "@gooddata/sdk-model";

import { TestCorrelation } from "../../../../tests/Dashboard.test.helpers.js";
import { SimpleDashboardIdentifier } from "../../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard } from "../../../commands/dashboard.js";
import { addMeasureValueFilter } from "../../../commands/filters.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../DashboardTester.js";
import { type IDashboardCommandFailed } from "../../../events/general.js";
import { selectCatalogFilterParameters } from "../../../store/catalog/catalogSelectors.js";
import { selectMeasureValueFilterConfigsModeMap } from "../../../store/tabs/measureValueFilterConfigs/measureValueFilterConfigsSelectors.js";

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

    it("should register the parameter dependencies of the added filter's metric", async () => {
        await preloadedTesterFactory(
            (tester) => {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            {
                initCommand: initializeDashboard({ settings: { enableParameters: true } }),
                backendConfig: { useRefType: "id" },
            },
        );
        const metricKey = serializeObjRef(measureRef);
        expect(selectCatalogFilterParameters(Tester.state())).not.toHaveProperty(metricKey);

        await Tester.dispatchAndWaitFor(
            addMeasureValueFilter(measureRef, 0, TestCorrelation, "test-mvf"),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        // the worker registers after the write; the recorded backend answers with an empty graph, so
        // the metric ends up known with no parameters
        await vi.waitFor(() =>
            expect(selectCatalogFilterParameters(Tester.state())).toHaveProperty(metricKey, []),
        );
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
