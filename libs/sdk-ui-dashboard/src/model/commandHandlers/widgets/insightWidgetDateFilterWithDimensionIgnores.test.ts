// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { type IDashboardFilterReference, areObjRefsEqual } from "@gooddata/sdk-model";

import {
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetRef,
} from "../../../tests/SimpleDashboard.test.helpers.js";
import {
    ignoreDateFilterOnInsightWidget,
    ignoreFilterOnInsightWidget,
    unignoreDateFilterOnInsightWidget,
} from "../../commands/insight.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { selectFilterContextAttributeFilters } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectAnalyticalWidgetByRef } from "../../store/tabs/layout/layoutSelectors.js";

describe("insight widget ignores of a date filter with a dimension of the new type", () => {
    let Tester: DashboardTester;
    const dataSet = ReferenceMd.DateDatasets.Closed.ref;
    const changed = "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED";

    const ignoresDataSet = () =>
        (
            selectAnalyticalWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state())?.ignoreDashboardFilters ??
            []
        ).some(
            (reference: IDashboardFilterReference) =>
                reference.type === "dateFilterReference" && areObjRefsEqual(reference.dataSet, dataSet),
        );

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
        Tester.dispatch(tabsActions.addDateFilter({ index: -1, dateDataset: dataSet }));
        Tester.dispatch(
            tabsActions.upsertDateFilter({
                type: "absoluteGranularity",
                granularity: "GDC.time.month",
                from: "2026-03",
                to: "2026-05",
                dataSet,
            }),
        );
    });

    it("ignores it by its dataset", async () => {
        await Tester.dispatchAndWaitFor(
            ignoreDateFilterOnInsightWidget(SimpleSortedTableWidgetRef, dataSet),
            changed,
        );

        expect(ignoresDataSet()).toBe(true);
    });

    it("keeps ignoring it when an attribute filter is ignored", async () => {
        await Tester.dispatchAndWaitFor(
            ignoreDateFilterOnInsightWidget(SimpleSortedTableWidgetRef, dataSet),
            changed,
        );
        const [attributeFilter] = selectFilterContextAttributeFilters(Tester.state());

        await Tester.dispatchAndWaitFor(
            ignoreFilterOnInsightWidget(
                SimpleSortedTableWidgetRef,
                attributeFilter.attributeFilter.displayForm,
            ),
            changed,
        );

        expect(ignoresDataSet()).toBe(true);
    });

    it("stops ignoring it by its dataset", async () => {
        await Tester.dispatchAndWaitFor(
            ignoreDateFilterOnInsightWidget(SimpleSortedTableWidgetRef, dataSet),
            changed,
        );

        await Tester.dispatchAndWaitFor(
            unignoreDateFilterOnInsightWidget(SimpleSortedTableWidgetRef, dataSet),
            changed,
        );

        expect(ignoresDataSet()).toBe(false);
    });
});
