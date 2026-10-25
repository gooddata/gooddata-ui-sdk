// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { reportTitleChange } from "./actions/report_actions.js";
import { redo, undo } from "./actions/time_travel_actions.js";
import { createStore } from "./create_store.js";
import { redoPossible, undoPossible } from "./selectors/editor_header_selector.js";
import { setHighlightedBucketItems } from "./store/highlighting/highlighting_actions.js";
import { getHighlightedBucketItems } from "./store/highlighting/highlighting_selector.js";
import { type AppDispatch, type IAppState } from "./store/types.js";

describe("createStore (configureStore over the plain root)", () => {
    it("should initialize with a plain root state", () => {
        const state = createStore().store.getState() as unknown as Record<string, unknown>;

        expect(Object.getPrototypeOf(state)).toBe(Object.prototype);
        expect("getIn" in state).toBe(false);
    });

    it("should give every store its own root instance (pluggable remounts must not share state)", () => {
        const first = createStore().store.getState();
        const second = createStore().store.getState();

        expect(first).not.toBe(second);
    });

    it("should reduce dispatched actions through the root reducer", () => {
        const { store } = createStore();

        store.dispatch(reportTitleChange("my title"));

        expect((store.getState() as IAppState).data.title).toEqual("my title");
    });

    /**
     * `AppDispatch` (store/types.ts) must match the dispatch this store infers. Both halves are
     * compile-time checks living in a runtime test so they cannot rot: an unused
     * `@ts-expect-error` is itself a compile error.
     */
    describe("dispatch typing", () => {
        it("keeps AppDispatch aligned with the store's inferred dispatch", () => {
            const { store } = createStore();

            // Both directions. If a future middleware WIDENS dispatch (a thunk, a listener) or
            // AppDispatch drifts away from it, this stops compiling instead of quietly lying.
            const asAppDispatch: AppDispatch = store.dispatch;
            const asStoreDispatch: typeof store.dispatch = asAppDispatch;

            expect(asStoreDispatch).toBe(store.dispatch);
        });

        it("should reject an action that is not UnknownAction-shaped", () => {
            const { store } = createStore();

            interface IHandWrittenAction {
                type: "TEST/HAND_WRITTEN";
                payload: { title: string };
            }
            const handWritten: IHandWrittenAction = {
                type: "TEST/HAND_WRITTEN",
                payload: { title: "x" },
            };

            // @ts-expect-error -- an INTERFACE gets no implicit index signature, so it is not
            // assignable to UnknownAction. The directive going unused would mean dispatch has
            // gone permissive.
            store.dispatch(handWritten);

            expect(store.getState()).toBeDefined();
        });
    });

    it("should serve RTK slice state through the lifted highlighting slice", () => {
        const { store } = createStore();

        store.dispatch(setHighlightedBucketItems(["m1"]));

        expect(getHighlightedBucketItems(store.getState() as IAppState)).toEqual(["m1"]);
    });

    /**
     * The undo history lives IN the store, so these are the only tests that exercise
     * it the way the app does — through configureStore, with the dev checks (immutableCheck /
     * serializableCheck) armed. They are the regression net for the wiring the reducer-level suites
     * cannot see: `store/_infra/test/time_travel.test.ts` covers the mechanics.
     */
    describe("undo history", () => {
        it("should undo and redo a dispatched edit", () => {
            const { store } = createStore();

            store.dispatch(reportTitleChange("first"));
            store.dispatch(reportTitleChange("second"));
            expect(undoPossible(store.getState() as IAppState)).toBe(true);

            store.dispatch(undo());
            expect((store.getState() as IAppState).data.title).toEqual("first");
            expect(redoPossible(store.getState() as IAppState)).toBe(true);

            store.dispatch(redo());
            expect((store.getState() as IAppState).data.title).toEqual("second");
        });

        it("should give every store its own history (the module-level stacks were shared)", () => {
            const first = createStore().store;
            const second = createStore().store;

            first.dispatch(reportTitleChange("only in the first store"));

            expect(undoPossible(first.getState() as IAppState)).toBe(true);
            expect(undoPossible(second.getState() as IAppState)).toBe(false);
        });

        it("should not trip the RTK dev checks while the history grows", () => {
            // the snapshots share references with the live state; a reducer mutating a captured
            // branch in place would surface here as an immutableCheck error and nowhere else
            const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

            try {
                const { store } = createStore();

                for (let i = 0; i < 10; i += 1) {
                    store.dispatch(reportTitleChange(`title ${i}`));
                }
                store.dispatch(undo());
                store.dispatch(redo());

                expect(consoleError).not.toHaveBeenCalled();
            } finally {
                consoleError.mockRestore();
            }
        });
    });
});
