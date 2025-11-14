// (C) 2021-2025 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { DashboardAttributeFilterConfigModeValues, uriRef } from "@gooddata/sdk-model";

import { addAttributeFilter } from "../../../../commands/index.js";
import { DashboardCommandFailed } from "../../../../events/index.js";
import { selectAttributeFilterConfigsModeMap } from "../../../../store/index.js";
import {
    selectAttributeFilterDisplayFormsMap,
    selectFilterContextAttributeFilters,
} from "../../../../store/tabs/filterContext/filterContextSelectors.js";
import { DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../../tests/fixtures/Dashboard.fixtures.js";
import { SimpleDashboardIdentifier } from "../../../../tests/fixtures/SimpleDashboard.fixtures.js";

describe("addAttributeFilterHandler", () => {
    let Tester: DashboardTester;
    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("should emit the appropriate events for added attribute filter", async () => {
        await Tester.dispatchAndWaitFor(
            addAttributeFilter(ReferenceMd.Product.Name.attribute.displayForm, 0, TestCorrelation),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the attribute filter in state when it is added", async () => {
        await Tester.dispatchAndWaitFor(
            addAttributeFilter(ReferenceMd.Product.Name.attribute.displayForm, 0, TestCorrelation),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        expect(selectFilterContextAttributeFilters(Tester.state())[0]).toMatchSnapshot({
            attributeFilter: {
                localIdentifier: expect.any(String),
            },
        });
        const displayFormMap = selectAttributeFilterDisplayFormsMap(Tester.state());
        expect(displayFormMap.has(ReferenceMd.Product.Name.attribute.displayForm)).toBeTruthy();
    });

    it("should emit the appropriate events when trying to add a duplicate attribute filter", async () => {
        const event: DashboardCommandFailed = await Tester.dispatchAndWaitFor(
            addAttributeFilter(ReferenceMd.Department.Default.attribute.displayForm, 0, TestCorrelation),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
    });

    it("should fail if adding filter for invalid display form", async () => {
        const event: DashboardCommandFailed = await Tester.dispatchAndWaitFor(
            addAttributeFilter(uriRef("does-not-exit"), 0, TestCorrelation),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
    });

    it("should NOT alter the attribute filter state when trying to add a duplicate attribute filter", async () => {
        const originalFilters = selectFilterContextAttributeFilters(Tester.state());

        await Tester.dispatchAndWaitFor(
            addAttributeFilter(ReferenceMd.Department.Default.attribute.displayForm, 0, TestCorrelation),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(selectFilterContextAttributeFilters(Tester.state())).toEqual(originalFilters);
    });

    it("should set the attribute filter mode", async () => {
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
            addAttributeFilter(
                ReferenceMd.Product.Name.attribute.displayForm,
                0,
                TestCorrelation,
                "single",
                DashboardAttributeFilterConfigModeValues.READONLY,
            ),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        const attributeFilterConfigsModeMap = selectAttributeFilterConfigsModeMap(Tester.state());

        expect(Array.from(attributeFilterConfigsModeMap.values())).toEqual([
            DashboardAttributeFilterConfigModeValues.READONLY,
        ]);
    });

    it("should not set attribute filter mode when supportsHiddenAndLockedFiltersOnUI is false", async () => {
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
            addAttributeFilter(
                ReferenceMd.Product.Name.attribute.displayForm,
                0,
                TestCorrelation,
                "single",
                DashboardAttributeFilterConfigModeValues.READONLY,
            ),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        const attributeFilterConfigsModeMap = selectAttributeFilterConfigsModeMap(Tester.state());
        expect(Object.values(attributeFilterConfigsModeMap)).toEqual([]);
    });

    it("should not set attribute filter mode when mode is empty", async () => {
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
            addAttributeFilter(ReferenceMd.Product.Name.attribute.displayForm, 0, TestCorrelation, "single"),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        const attributeFilterConfigsModeMap = selectAttributeFilterConfigsModeMap(Tester.state());
        expect(Object.values(attributeFilterConfigsModeMap)).toEqual([]);
    });
});
