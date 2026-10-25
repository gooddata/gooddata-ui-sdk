// (C) 2026 GoodData Corporation

import { type Action } from "redux";
import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { appFinishedLoading, refreshSessionId, setLocale } from "../actions/app_context_actions.js";
import { setEmbedded } from "../actions/embedded_actions.js";
import { openAsReportToggled, visualizationPropertiesInitialized } from "../actions/properties_actions.js";
import { resetForPluggableMount } from "../actions/reset_for_pluggable_mount_actions.js";
import { shortcutSetDroppedItem } from "../actions/shortcuts_actions.js";
import { INITIAL_MODEL as BUCKET_INITIAL_MODEL } from "../models/bucket_item.js";
import { validateVisualizationProperties } from "../services/buckets_service.js";
import {
    attributeElementsUpdate,
    attributeElementsUpdated,
} from "../store/attribute_elements/attribute_elements_store_actions.js";
import { setRemovedItems } from "../store/bucket_notifications/bucket_notifications_actions.js";
import { locationChanged } from "../store/router/router_actions.js";
import { type IAppState } from "../store/types.js";
import { getInitializedState } from "../tests/state.test.helpers.js";

import { initialState } from "./initial_state.js";
import { rootReducer } from "./root_reducer.js";

/**
 * THE ROOT CONTRACT. What it pins:
 *
 * 1. the pristine state is the reducer's OWN default build — the combined root self-initializes
 *    every owned key from the leaves' own initial states, the genuinely-optional keys hold NULL
 *    at rest, and a key nobody owns does not exist;
 * 2. the container contracts: the root, its three branches and every stored value are plain
 *    objects, with the plain `INITIAL_MODEL` buckets leaf shared by IDENTITY between
 *    `data.buckets` and `referencePoint.buckets`;
 * 3. cross-domain values survive unrelated dispatches — each is owned by exactly one reducer,
 *    so nothing can drop it;
 * 4. RESET_FOR_PLUGGABLE_MOUNT returns a FRESH pristine build no matter what ran before, and a
 *    second reset is unaffected by work done after the first;
 * 5. reducer flows never mutate the state object in place (deep-freeze tripwire).
 */

// The seed values the pristine build must produce from the leaves' own initial states. Each entry
// READS the leaf through typed property access and names it for the assertion label, so a renamed
// branch key breaks the table at compile time instead of silently reading undefined.
const PRISTINE_SEED_VALUES: Array<[name: string, read: (state: IAppState) => unknown, value: unknown]> = [
    ["appState.renamingBucketItem", (state) => state.appState.renamingBucketItem, false],
    ["appState.locationRedirectLock", (state) => state.appState.locationRedirectLock, false],
    ["data.measuresDateDatasets", (state) => state.data.measuresDateDatasets, {}],
    [
        "data.referencePoint",
        (state) => state.data.referencePoint,
        {
            filters: { localIdentifier: "filters", items: [] },
            dateDataSet: { uri: null },
            reportNotFound: false,
            properties: {},
            buckets: [],
        },
    ],
    ["data.isVisualizationMdObjectValid", (state) => state.data.isVisualizationMdObjectValid, true],
    ["data.buckets", (state) => state.data.buckets, []],
    ["data.bucketsMeta", (state) => state.data.bucketsMeta, { autoCreated: {}, modified: {}, collapsed: {} }],
    [
        "data.pluggableVisualization",
        (state) => state.data.pluggableVisualization,
        { newDerivedBucketItems: [] },
    ],
];

// Genuinely-optional keys: NULL at rest on the pristine state (`nullableLeaf` mounts — redux's
// strict combineReducers rejects undefined), read as undefined through their input selectors.
const PRISTINE_NULL_READERS: Array<[name: string, read: (state: IAppState) => unknown]> = [
    ["appState.sessionId", (state) => state.appState.sessionId],
    ["data.extendedReferencePoint", (state) => state.data.extendedReferencePoint],
    ["data.postponedAction", (state) => state.data.postponedAction],
    ["data.shortcut.shortcutDroppedItem", (state) => state.data.shortcut.shortcutDroppedItem],
    ["route", (state) => state.route],
    ["previousRoute", (state) => state.previousRoute],
];

// Keys NO reducer owns: under the strict root they do not exist at all (the undo/redo flags are
// derived from the timeTravel stack lengths). The indexed reads are the point — the strict root type
// has no such properties, so there is nothing to reach for with property access.
const PRISTINE_ABSENT_READERS: Array<[name: string, read: (state: IAppState) => unknown]> = [
    ["appState.undo", (state) => (state.appState as unknown as Record<string, unknown>)["undo"]],
    ["appState.redo", (state) => (state.appState as unknown as Record<string, unknown>)["redo"]],
];

// A representative spread of real dispatches that write through the root spine: appState
// mini-slices (intl, embedding, appReady), the appContext transformer's sessionId function
// path, a root-level leaf (route) and a data-branch slice (bucketNotifications).
const DIRTYING_ACTIONS: Action[] = [
    appFinishedLoading(),
    setLocale("de-DE"),
    setEmbedded(true),
    locationChanged("#/myProject/myReport/edit"),
    refreshSessionId(),
    setRemovedItems({
        measures: 2,
        measureValueFilters: 1,
        rankingFilter: true,
    }),
];

const applyAll = (state: IAppState, actions: Action[]): IAppState =>
    actions.reduce((current, action) => rootReducer(current, action), state);

// Freezes every container reachable from the state, so an in-place write inside a reducer becomes
// a TypeError (ESM test modules run in strict mode).
function deepFreezePlain<T>(value: T): T {
    if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
    }
    Object.freeze(value);
    for (const child of Object.values(value)) {
        deepFreezePlain(child);
    }
    return value;
}

describe("root contract", () => {
    describe("pristine state = the reducer's own default build", () => {
        it("builds every pristine seed value from the leaves' own initial states", () => {
            for (const [name, read, value] of PRISTINE_SEED_VALUES) {
                expect(read(initialState), name).toEqual(value);
            }
        });

        it("seeds the genuinely-optional keys as NULL until written", () => {
            for (const [name, read] of PRISTINE_NULL_READERS) {
                expect(read(initialState), name).toBeNull();
            }
        });

        it("keeps the ownerless keys absent — the strict root cannot hold a key nobody owns", () => {
            for (const [name, read] of PRISTINE_ABSENT_READERS) {
                expect(read(initialState), name).toBeUndefined();
            }
        });

        it("has no dead appState.header / appState.brandTitle seeds", () => {
            // the strict root type has no such keys; this pins that nothing seeds them at RUNTIME
            const appState = initialState.appState as unknown as Record<string, unknown>;
            expect(appState["header"]).toBeUndefined();
            expect(appState["brandTitle"]).toBeUndefined();
        });
    });

    describe("container contracts", () => {
        it("the root and its three branches are plain objects", () => {
            for (const branch of ["appState", "data", "report"] as const) {
                expect(typeof initialState?.[branch]).toBe("object");
            }
        });

        it("seeds data.referencePoint PLAIN", () => {
            // the filters bucket is the shape the pluggable visualization is handed
            expect(initialState.data.referencePoint.filters).toEqual({
                localIdentifier: "filters",
                items: [],
            });
        });

        it("seeds the buckets-cluster subtrees plain", () => {
            expect(Array.isArray(initialState.data.buckets)).toBe(true);
            expect(Array.isArray(initialState.data.referencePoint.buckets)).toBe(true);
        });

        it("seeds data.buckets and referencePoint.buckets with the buckets slice's INITIAL_MODEL identity", () => {
            // both init paths (holder seed and slice self-init) must agree on container AND
            // identity
            expect(initialState.data.buckets).toBe(BUCKET_INITIAL_MODEL);
            expect(initialState.data.referencePoint.buckets).toBe(BUCKET_INITIAL_MODEL);
        });

        /**
         * `data.extendedReferencePoint` is absent at rest, so each of these three writers
         * materializes it. All three must produce a plain container — the plug-viz round trip
         * operates on the stored value directly.
         */
        it("materializes the extended reference point as a PLAIN container on every real write path", () => {
            const toggled = rootReducer(
                getInitializedState(),
                openAsReportToggled({ supported: true, warningMessage: "" }),
            );
            expect(toggled.data.extendedReferencePoint.uiConfig.openAsReport.supported).toBe(true);

            const seeded = rootReducer(
                getInitializedState(),
                visualizationPropertiesInitialized({
                    supportedProperties: { controls: { legend: { position: "top" } } },
                }),
            );
            expect(seeded.data.extendedReferencePoint.properties).toEqual({
                controls: { legend: { position: "top" } },
            });

            // the third writer is a service transformer, not an action handler
            const validated = validateVisualizationProperties(getInitializedState());
            expect(validated.data.extendedReferencePoint.properties.sortItems).toEqual([]);
        });
    });

    describe("cross-domain keys survive the dispatch cycle (anti-key-drop contract)", () => {
        it("keeps the apply-written extendedReferencePoint across unrelated dispatches, PLAIN", () => {
            const seeded = rootReducer(
                getInitializedState(),
                visualizationPropertiesInitialized({
                    supportedProperties: { controls: { legend: { position: "top" } } },
                }),
            );

            const afterUnrelated = rootReducer(rootReducer(seeded, setLocale("de-DE")), appFinishedLoading());
            expect(afterUnrelated.data.extendedReferencePoint.properties).toBeDefined();
        });

        it("keeps the written sessionId across unrelated dispatches", () => {
            const withSession = rootReducer(getInitializedState(), refreshSessionId());
            const sessionId = withSession.appState.sessionId;
            expect(sessionId).toBeDefined();

            const afterUnrelated = rootReducer(withSession, setLocale("fr-FR"));
            expect(afterUnrelated.appState.sessionId).toBe(sessionId);
        });
    });

    /**
     * The RTK dev checks walk these subtrees, and an EMPTY subtree never trips a check — so each
     * case drives the dispatch that POPULATES the value before asserting it is plain.
     * (data.measuresDateDatasets has the same coverage in
     * store/measure_date_datasets/test/measure_date_datasets_store.test.ts.)
     */
    describe("subtrees walked by the RTK dev checks store plain values", () => {
        it("stores the parked dropped catalog item PLAIN, by reference", () => {
            const catalogItem = { identifier: "aa.close_date", type: "metric", uri: "/gdc/md/1" };
            const withDrop = rootReducer(getInitializedState(), shortcutSetDroppedItem(catalogItem));

            const dropped = withDrop.data.shortcut.shortcutDroppedItem;
            expect(dropped).toBe(catalogItem);
        });

        it("stores populated attribute elements PLAIN", () => {
            const dfRef = uriRef("/gdc/md/df/1");
            const loading = rootReducer(getInitializedState(), attributeElementsUpdate(dfRef, "", 0, 2));
            const loaded = rootReducer(
                loading,
                attributeElementsUpdated(dfRef, "", 0, 2, [{ uri: "/e/1", title: "one" }], 1),
            );

            const subtree = loaded.data.attributeElements;
            expect(Array.isArray(subtree.items)).toBe(true);
            expect(subtree.items[0]).toEqual({ uri: "/e/1", title: "one" });
        });
    });

    describe("RESET_FOR_PLUGGABLE_MOUNT", () => {
        it("returns the pristine build after real work", () => {
            const dirty = applyAll(getInitializedState(), DIRTYING_ACTIONS);
            const afterReset = rootReducer(dirty, resetForPluggableMount());

            expect(afterReset).toEqual(getInitializedState());
        });

        it("keeps the per-key container contracts on the post-reset state", () => {
            const dirty = applyAll(getInitializedState(), DIRTYING_ACTIONS);
            const afterReset = rootReducer(dirty, resetForPluggableMount());

            expect(afterReset.data.buckets).toBe(BUCKET_INITIAL_MODEL);
            expect(afterReset.data.referencePoint.buckets).toBe(BUCKET_INITIAL_MODEL);
            expect(afterReset.data.extendedReferencePoint).toBeNull();
        });

        it("a second reset is unaffected by work done after the first (pluggable remount isolation)", () => {
            const firstMount = rootReducer(
                applyAll(getInitializedState(), DIRTYING_ACTIONS),
                resetForPluggableMount(),
            );
            const secondMountDirty = applyAll(firstMount, DIRTYING_ACTIONS);
            const secondMount = rootReducer(secondMountDirty, resetForPluggableMount());

            expect(secondMount).toEqual(getInitializedState());
        });

        it("builds a FRESH pristine state per reset — the plain root must never be a shared singleton", () => {
            const state = applyAll(getInitializedState(), DIRTYING_ACTIONS);

            const first = rootReducer(state, resetForPluggableMount());
            const second = rootReducer(state, resetForPluggableMount());

            expect(first).not.toBe(initialState);
            expect(first).not.toBe(second);
        });
    });

    describe("no in-place mutation", () => {
        it("reducer flows work over a deep-frozen state and leave the pristine seeds intact", () => {
            const frozen = deepFreezePlain(rootReducer(getInitializedState(), resetForPluggableMount()));

            // any in-place write inside the exercised reducers throws here
            const worked = applyAll(frozen, DIRTYING_ACTIONS);
            expect(rootReducer(worked, resetForPluggableMount())).toEqual(getInitializedState());

            // the module-level pristine state is unharmed, including the shared buckets seed
            expect(initialState.data.buckets).toBe(BUCKET_INITIAL_MODEL);
            expect(initialState.data.bucketsMeta).toEqual({
                autoCreated: {},
                modified: {},
                collapsed: {},
            });
        });
    });
});
