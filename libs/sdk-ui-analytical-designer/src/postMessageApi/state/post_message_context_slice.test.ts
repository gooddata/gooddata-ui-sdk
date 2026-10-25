// (C) 2026 GoodData Corporation

import { type UnknownAction } from "redux";
import { describe, expect, it } from "vitest";

import { rootReducer } from "../../reducers/root_reducer.js";
import { setHighlightedFilterItem } from "../../store/highlighting/highlighting_actions.js";
import { type IAppState } from "../../store/types.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { setPostMessageContext } from "../actions/set_post_message_context_actions.js";

import { postMessageContextSliceReducer } from "./post_message_context_slice.js";
import { getPostMessageContext } from "./selectors/post_message_context_selector.js";

const dispatch = (state: IAppState, action: UnknownAction): IAppState => rootReducer(state, action);

describe("postMessageContext slice", () => {
    it("self-initializes to null (no initial_state.ts seed)", () => {
        expect(postMessageContextSliceReducer(undefined, { type: "@@INIT" })).toBeNull();
    });

    it("stores the context content verbatim", () => {
        const next = dispatch(getInitializedState(), setPostMessageContext("ctx-42"));

        const stored = next.appState.meta.postMessageContext;
        expect(stored).toEqual({ contextId: "ctx-42" });
    });

    describe("write idempotence — identity, not values", () => {
        it("replaying the SAME contextId returns the same root", () => {
            const written = dispatch(getInitializedState(), setPostMessageContext("ctx-42"));

            expect(dispatch(written, setPostMessageContext("ctx-42"))).toBe(written);
        });

        it("a DIFFERENT contextId produces a new root with the new content", () => {
            const written = dispatch(getInitializedState(), setPostMessageContext("ctx-1"));
            const next = dispatch(written, setPostMessageContext("ctx-2"));

            expect(next).not.toBe(written);
            expect(next.appState.meta.postMessageContext).toEqual({ contextId: "ctx-2" });
        });
    });

    describe("getPostMessageContext memoization (5.2)", () => {
        it("serves the same reference while the subtree is unchanged", () => {
            const written = dispatch(getInitializedState(), setPostMessageContext("ctx-42"));
            const before = getPostMessageContext(written);

            // an action that really moves the ROOT while leaving this subtree alone — it must
            // write a foreign branch, since an unhandled action short-circuits the whole chain
            // to the same root (liftSlice returns `root` unchanged) and would make this vacuous
            const next = dispatch(written, setHighlightedFilterItem("filter-1"));

            expect(next).not.toBe(written);
            expect(getPostMessageContext(next)).toBe(before);
        });

        it("reflects a new write with a new reference", () => {
            const written = dispatch(getInitializedState(), setPostMessageContext("ctx-1"));
            const before = getPostMessageContext(written);

            const next = dispatch(written, setPostMessageContext("ctx-2"));

            const after = getPostMessageContext(next);
            expect(after).not.toBe(before);
            expect(after).toEqual({ postMessageContext: { contextId: "ctx-2" } });
        });
    });
});
