// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import {
    type IDashboardAttributeFilterParent,
    type IDrillToCustomUrl,
    idRef,
    newDefForItems,
} from "@gooddata/sdk-model";
import { getDashboardAttributeFilterPlaceholdersFromUrl } from "@gooddata/sdk-model/internal";

import {
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetRef,
} from "../../../tests/SimpleDashboard.test.helpers.js";
import { type IDashboardDrillEvent } from "../../../types.js";
import { drillToCustomUrl } from "../../commands/drill.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { isDashboardDrillToCustomUrlResolved } from "../../events/drill.js";
import { isDashboardCommandFailed } from "../../events/general.js";
import { selectAllCatalogDisplayFormsMap } from "../../store/catalog/catalogSelectors.js";
import { selectRestrictedDashboardFilterLocalIdentifiers } from "../../store/filtering/dashboardFilterSelectors.js";
import { selectAttributeFilterConfigsOverrides } from "../../store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectFilterContextAttributeFilterItems } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { unavailableObjectsActions } from "../../store/unavailableObjects/index.js";

import { findDashboardAttributeFilterPlaceholderMatch } from "./resolveDrillToCustomUrl.js";

describe("dashboard filter placeholders of a custom URL drill", () => {
    const READABLE_LABEL = "f_owner.department_id";
    const RESTRICTED_PARENT_LABEL = "f_owner.region_id";
    const CHILD_LABEL = "label.f_product.product.name";
    const PRODUCT_LABEL = "attr.f_product.product";
    const READABLE_METRIC = "87a053b0-3947-49f3-b0c5-de53fd01f050";
    const OTHER_READABLE_METRIC = "e519fa2a-86c3-4e32-8313-0c03062348j3";

    const drillEvent: IDashboardDrillEvent = {
        dataView: dummyDataView(newDefForItems("reference-workspace", [])),
        drillContext: { type: "table", element: "cell", intersection: [] },
        drillDefinitions: [],
        widgetRef: SimpleSortedTableWidgetRef,
    };

    const customUrlDrill = (url: string): IDrillToCustomUrl => ({
        type: "drillToCustomUrl",
        transition: "new-window",
        origin: { type: "drillFromMeasure", measure: { localIdentifier: "m1" } },
        target: { url },
    });

    const resolveUrl = async (url: string) => {
        const event: unknown = await Tester.dispatchAndWaitFor(
            drillToCustomUrl(customUrlDrill(url), drillEvent),
            "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.RESOLVED",
        );
        if (!isDashboardDrillToCustomUrlResolved(event)) {
            throw new Error("The custom URL drill did not resolve.");
        }
        return decodeURIComponent(event.payload.url);
    };

    // The child filter keeps a readable label and the restricted measure value filter a readable metric:
    // each is restricted only through another object, so its placeholder still resolves.
    let Tester: DashboardTester;
    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
        Tester.dispatch(
            unavailableObjectsActions.setUnavailableObjects([
                {
                    ref: idRef(RESTRICTED_PARENT_LABEL, "displayForm"),
                    type: "displayForm",
                    reason: "forbidden",
                },
            ]),
        );
        Tester.dispatch(
            tabsActions.addAttributeFilter({
                displayForm: idRef(READABLE_LABEL, "displayForm"),
                index: 0,
                initialSelection: { values: ["Direct Sales"] },
                localIdentifier: "readable",
            }),
        );
        Tester.dispatch(
            tabsActions.addAttributeFilter({
                displayForm: idRef(RESTRICTED_PARENT_LABEL, "displayForm"),
                index: 1,
                initialSelection: { values: ["East Coast"] },
                localIdentifier: "parent",
            }),
        );
        Tester.dispatch(
            tabsActions.addAttributeFilter({
                displayForm: idRef(CHILD_LABEL, "displayForm"),
                index: 2,
                parentFilters: [{ filterLocalIdentifier: "parent", over: { attributes: [] } }],
                initialSelection: { values: ["Explorer"] },
                localIdentifier: "child",
            }),
        );
        for (const [localIdentifier, metric] of [
            ["readable-mvf", READABLE_METRIC],
            ["restricted-mvf", OTHER_READABLE_METRIC],
        ]) {
            Tester.dispatch(
                tabsActions.addMeasureValueFilter({
                    measure: idRef(metric, "measure"),
                    localIdentifier,
                    index: -1,
                }),
            );
            Tester.dispatch(
                tabsActions.changeMeasureValueFilterCondition({
                    localIdentifier,
                    conditions: [{ comparison: { operator: "GREATER_THAN", value: 1 } }],
                }),
            );
        }
        Tester.dispatch(
            tabsActions.setMeasureValueFilterDimensionality({
                localIdentifier: "restricted-mvf",
                dimensionality: [idRef(RESTRICTED_PARENT_LABEL, "displayForm")],
            }),
        );
    });

    it("resolves a restricted attribute filter as all values, a readable one as its selection", async () => {
        const url = await resolveUrl(
            `https://example.com/?dep={dash_attribute_filter_selection(${READABLE_LABEL})}&product={dash_attribute_filter_selection(${CHILD_LABEL})}`,
        );

        expect(url).toBe('https://example.com/?dep=IN["Direct Sales"]&product=NOT_IN[]');
    });

    it("matches a label placeholder to a readable filter displayed by the label before a restricted one", () => {
        // Both filters show the child label instead of their own, and the restricted one's config comes
        // first. A displayed filter loads its element titles, which the recorded backend cannot, so the
        // match is checked rather than the resolved URL.
        const shownFilters: Array<{
            localIdentifier: string;
            parentFilters?: IDashboardAttributeFilterParent[];
        }> = [
            {
                localIdentifier: "restricted-shown",
                parentFilters: [{ filterLocalIdentifier: "parent", over: { attributes: [] } }],
            },
            { localIdentifier: "readable-shown" },
        ];
        for (const { localIdentifier, parentFilters } of shownFilters) {
            Tester.dispatch(
                tabsActions.addAttributeFilter({
                    displayForm: idRef(PRODUCT_LABEL, "displayForm"),
                    index: -1,
                    parentFilters,
                    initialSelection: { values: ["Explorer"] },
                    localIdentifier,
                }),
            );
            Tester.dispatch(
                tabsActions.changeDisplayAsLabel({
                    localIdentifier,
                    displayAsLabel: idRef(CHILD_LABEL, "displayForm"),
                }),
            );
        }
        const [placeholder] = getDashboardAttributeFilterPlaceholdersFromUrl(
            `https://example.com/?product={dash_attribute_filter_selection(${CHILD_LABEL})}`,
        );
        const state = Tester.state();

        const match = findDashboardAttributeFilterPlaceholderMatch(
            placeholder.ref,
            selectFilterContextAttributeFilterItems(state),
            selectRestrictedDashboardFilterLocalIdentifiers(state),
            selectAllCatalogDisplayFormsMap(state),
            selectAttributeFilterConfigsOverrides(state),
        );

        expect(match?.type === "displayAsLabel" && match.filter.attributeFilter.localIdentifier).toBe(
            "readable-shown",
        );
    });

    it("resolves a restricted measure value filter as ALL, a readable one as its condition", async () => {
        const url = await resolveUrl(
            `https://example.com/?a={dash_mvf_condition(${READABLE_METRIC})}&b={dash_mvf_condition(${OTHER_READABLE_METRIC})}`,
        );

        expect(url).toBe("https://example.com/?a=GREATER_THAN(1)&b=ALL");
    });

    it.each([
        ["an attribute filter", "{dash_attribute_filter_selection(missing_label)}"],
        ["a measure value filter", "{dash_mvf_condition(missing_metric)}"],
    ])("rejects a drill whose placeholder names %s missing from the dashboard", async (_, placeholder) => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        try {
            const event: unknown = await Tester.dispatchAndWaitFor(
                drillToCustomUrl(customUrlDrill(`https://example.com/?a=${placeholder}`), drillEvent),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(isDashboardCommandFailed(event) && event.payload.reason).toBe("USER_ERROR");
            expect(warnSpy).toHaveBeenCalledExactlyOnceWith(expect.stringContaining(placeholder));
        } finally {
            warnSpy.mockRestore();
        }
    });
});
