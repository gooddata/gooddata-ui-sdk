// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IBootstrapData } from "../actions/app_context_actions.js";
import { initialState } from "../reducers/initial_state.js";
import { type IChartSortState, defaultChartSortState } from "../store/chart_sort/chart_sort_state.js";
import { type IReferencePointState } from "../store/reference_point/reference_point_state.js";
import { withData, withRoot } from "../tests/state_builder.test.helpers.js";
import { type PartialRecursive } from "../typings/type_utils.js";

import { getConfig, getDecoratedReferencePoint } from "./report_visualization_selector.js";

describe("reportVisualizationSelector", () => {
    let state;

    describe("getConfig", () => {
        it("should be empty by default", () => {
            expect(getConfig(initialState)).toEqual({});
        });

        it("should contain separators when set", () => {
            const separators = {
                thousand: ",",
                decimal: ".",
            };
            const bootstrapResource: PartialRecursive<IBootstrapData> = {
                user: {
                    separators,
                },
            };
            state = withRoot(initialState, { bootstrapData: bootstrapResource as unknown as IBootstrapData });
            expect(getConfig(state)).toEqual({
                separators,
            });
        });

        it("should expose maxZoomLevel from bootstrap data", () => {
            const bootstrapState = withRoot(initialState, {
                bootstrapData: { ...initialState.bootstrapData, maxZoomLevel: 7 },
            });

            expect(getConfig(bootstrapState)).toEqual({
                maxZoomLevel: 7,
            });
        });
    });
});

/**
 * The reference point handed to every pluggable visualization (`props.referencePoint`). The selector
 * makes no defensive copy — every pluggable visualization `cloneDeep`s it on entry — so these specs
 * also pin that the STORED subtree is never written.
 */
describe("the decorated reference point", () => {
    const bucketsMeta = {
        autoCreated: { "attr.country.id": true, "attr.product.id": true },
        modified: { "attr.product.id": true },
        collapsed: {},
    };

    const appliedSort = [{ attributeSortItem: { attributeIdentifier: "a1", direction: "asc" } }];

    // the extended reference point is seeded PRESENT by default: while it is ABSENT the chain
    // deliberately applies the custom sort on the FF alone (switching visualization types, where
    // the target's sort support is not known yet), which is its own spec below
    const seed = (
        referencePoint: unknown,
        sortConfigSupported = false,
        extendedReferencePoint: unknown = {
            uiConfig: { buckets: {} },
        },
    ) =>
        withData(
            withData(
                withData(
                    withData(initialState, {
                        referencePoint: referencePoint as unknown as IReferencePointState,
                    }),
                    {
                        bucketsMeta: bucketsMeta,
                    },
                ),
                { extendedReferencePoint: extendedReferencePoint },
            ),
            {
                chartSort: {
                    sortConfig: { ...defaultChartSortState.sortConfig, supported: sortConfigSupported },
                    appliedSort,
                } as unknown as IChartSortState,
            },
        );

    it("grafts the visualization properties on without touching the stored reference point", () => {
        const stored: IReferencePointState = {
            buckets: [],
            filters: { localIdentifier: "filters", items: [] },
        };
        const state = withData(seed(stored), { visualizationProperties: { controls: { legend: "top" } } });

        const referencePoint = getDecoratedReferencePoint(state);

        expect(referencePoint.properties).toEqual({ controls: { legend: "top" } });
        expect(state.data.referencePoint).toBe(stored);
        expect(stored).toEqual({ buckets: [], filters: { localIdentifier: "filters", items: [] } });
    });

    it("grafts the applied sort and availableSorts when the visualization supports custom sort", () => {
        const referencePoint = getDecoratedReferencePoint(seed({ buckets: [] }, true));

        expect(referencePoint.properties.sortItems).toEqual(appliedSort);
        expect(referencePoint.availableSorts).toEqual([]);
    });

    it("grafts the applied sort while no extended reference point has been reported yet", () => {
        // switching visualization types: the target's sort support is unknown, so the decision
        // falls back to the feature flag — an EMPTY extended reference point counts as "not yet"
        const referencePoint = getDecoratedReferencePoint(seed({ buckets: [] }, false, {}));

        expect(referencePoint.properties.sortItems).toEqual(appliedSort);
    });

    it("marks a filter autoCreated only when it is auto-created AND unmodified", () => {
        const state = seed({
            buckets: [],
            filters: {
                localIdentifier: "filters",
                items: [
                    { localIdentifier: "f1", attribute: "attr.country.id", autoCreated: false, filters: [] },
                    { localIdentifier: "f2", attribute: "attr.product.id", autoCreated: true, filters: [] },
                    { localIdentifier: "f3", attribute: "attr.other.id", autoCreated: true, filters: [] },
                ],
            },
        });

        const referencePoint = getDecoratedReferencePoint(state);

        expect(
            referencePoint.filters.items.map((item: { autoCreated: boolean }) => item.autoCreated),
        ).toEqual([true, false, false]);
    });

    it("passes a reference point with no filters bucket through unchanged", () => {
        const referencePoint = getDecoratedReferencePoint(seed({ buckets: [] }));

        expect(referencePoint.filters).toBeUndefined();
        expect(referencePoint.buckets).toEqual([]);
    });
});
