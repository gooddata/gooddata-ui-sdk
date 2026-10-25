// (C) 2026 GoodData Corporation

import { type UnknownAction } from "redux";
import { describe, expect, it } from "vitest";

import { GdcAdCommandType } from "@gooddata/sdk-embedding";

import { setFeatureFlagsItems } from "../../actions/featureFlags_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { getIsEmbedded } from "../../selectors/meta_selector.js";
import { type IAppState } from "../../store/types.js";
import { userSettings } from "../../tests/feature_flags.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { setPostMessageContext } from "../actions/set_post_message_context_actions.js";

import {
    availableCommandsSelector,
    availableCommandsStateSelector,
    getPostMessageContext,
} from "./selectors/post_message_context_selector.js";

/**
 * Characterization suite for the postMessage domain: the context slice and the availableCommands
 * selector chain. Every test drives the FULL root chain (rootReducer), so if one of these
 * assertions has to move, that is a deliberate, reviewed behavior change.
 */

const dispatch = (state: IAppState, action: UnknownAction): IAppState => rootReducer(state, action);

describe("postMessage domain", () => {
    describe("SET_POST_MESSAGE_CONTEXT write", () => {
        it("stores the context content at appState.meta.postMessageContext", () => {
            const next = dispatch(getInitializedState(), setPostMessageContext("ctx-42"));

            expect(next.appState.meta.postMessageContext).toEqual({ contextId: "ctx-42" });
        });

        it("getPostMessageContext returns the stored content wrapped in the payload shape", () => {
            const next = dispatch(getInitializedState(), setPostMessageContext("ctx-42"));

            expect(getPostMessageContext(next)).toEqual({
                postMessageContext: { contextId: "ctx-42" },
            });
        });

        it("a second write replaces the previous context", () => {
            const first = dispatch(getInitializedState(), setPostMessageContext("ctx-1"));
            const second = dispatch(first, setPostMessageContext("ctx-2"));

            expect(getPostMessageContext(second)).toEqual({
                postMessageContext: { contextId: "ctx-2" },
            });
        });

        it("does not disturb the sibling meta leaves (meta is never overwritten wholesale)", () => {
            const state = getInitializedState();
            const before = getIsEmbedded(state);

            const next = dispatch(state, setPostMessageContext("ctx-42"));

            expect(getIsEmbedded(next)).toBe(before);
        });
    });

    describe("pristine and reset fallbacks", () => {
        it("getPostMessageContext falls back to an undefined contextId on the pristine state", () => {
            expect(getPostMessageContext(getInitializedState())).toEqual({
                postMessageContext: { contextId: undefined },
            });
        });

        it("RESET_FOR_PLUGGABLE_MOUNT drops the stored context back to the pristine fallback", () => {
            const written = dispatch(getInitializedState(), setPostMessageContext("ctx-42"));
            const reset = dispatch(written, { type: ActionTypeKeys.RESET_FOR_PLUGGABLE_MOUNT });

            expect(getPostMessageContext(reset)).toEqual({
                postMessageContext: { contextId: undefined },
            });
        });
    });

    describe("availableCommandsStateSelector reference stability", () => {
        it("returns the SAME reference when a dispatch changes no input (controls subscription must not storm)", () => {
            const state = getInitializedState();
            const before = availableCommandsStateSelector(state);

            // changes appState.meta.postMessageContext — a new root, but no selector input
            const next = dispatch(state, setPostMessageContext("ctx-42"));

            expect(next).not.toBe(state);
            expect(availableCommandsStateSelector(next)).toBe(before);
        });

        it("returns a NEW reference with the new value when an input changes", () => {
            const state = getInitializedState();
            const before = availableCommandsStateSelector(state);
            expect(before.isEnableTimezoneChange).toBe(false);

            const next = dispatch(state, setFeatureFlagsItems(userSettings({ enableTimezoneChange: true })));

            const after = availableCommandsStateSelector(next);
            expect(after).not.toBe(before);
            expect(after.isEnableTimezoneChange).toBe(true);
        });
    });

    describe("availableCommandsSelector", () => {
        it("always offers the unconditional commands and gates SetTimezone on the timezone change enabled", () => {
            const state = getInitializedState();

            const commands = availableCommandsSelector(state);
            expect(commands).toContain(GdcAdCommandType.DrillableItems);
            expect(commands).toContain(GdcAdCommandType.OpenInsight);
            expect(commands).not.toContain(GdcAdCommandType.SetTimezone);

            const withTimezone = dispatch(
                state,
                setFeatureFlagsItems(userSettings({ enableTimezoneChange: true })),
            );
            expect(availableCommandsSelector(withTimezone)).toContain(GdcAdCommandType.SetTimezone);
        });

        it("is reference-stable while its state input is", () => {
            const state = getInitializedState();
            const before = availableCommandsSelector(state);

            const next = dispatch(state, setPostMessageContext("ctx-42"));

            expect(availableCommandsSelector(next)).toBe(before);
        });
    });
});
