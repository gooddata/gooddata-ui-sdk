// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type IGenAIUserContext, idRef } from "@gooddata/sdk-model";

import { messagesSliceReducer } from "../../messages/messagesSlice.js";
import { type RootState } from "../../types.js";
import {
    agentSwitchingActiveSelector,
    effectiveContextSelector,
    isPreviewSelector,
} from "../chatWindowSelectors.js";
import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    clearUserContextAction,
    getInitialChatWindowState,
    setAmbientUserContextAction,
    setUserContextAction,
} from "../chatWindowSlice.js";

const agentSwitchingSettings = {
    enableGenAiAgentSwitching: true,
} as IUserWorkspaceSettings;

const makeState = (isPreview?: boolean): RootState => ({
    messages: messagesSliceReducer(undefined, { type: "test/init" }),
    [chatWindowSliceName]: {
        ...getInitialChatWindowState({ isPreview }),
        settings: agentSwitchingSettings,
    },
});

describe("chatWindowSelectors", () => {
    it("should initialize preview mode before side effects read selectors", () => {
        const state = makeState(true);

        expect(isPreviewSelector(state)).toBe(true);
        expect(agentSwitchingActiveSelector(state)).toBe(false);
    });

    it("should keep agent switching active outside of preview mode", () => {
        expect(agentSwitchingActiveSelector(makeState(false))).toBe(true);
    });
});

describe("effectiveUserContextSelector", () => {
    const oneShotContext: IGenAIUserContext = {
        view: { dashboard: { ref: idRef("one-shot", "analyticalDashboard"), widgets: [] } },
    };
    const ambientContext: IGenAIUserContext = {
        view: {
            dashboard: {
                ref: idRef("ambient", "analyticalDashboard"),
                title: "Revenue Dashboard",
                widgets: [],
                filters: [
                    {
                        type: "attribute_filter",
                        using: "label.region",
                        state: { include: ["Europe"] },
                        title: "Region",
                    },
                ],
            },
        },
    };

    const stateWith = (...actions: Parameters<typeof chatWindowSliceReducer>[1][]): RootState => ({
        messages: messagesSliceReducer(undefined, { type: "test/init" }),
        [chatWindowSliceName]: actions.reduce(chatWindowSliceReducer, {
            ...getInitialChatWindowState(),
            settings: {
                enableAiContextSetup: true,
            } as IUserWorkspaceSettings,
        }),
    });

    it("should return undefined without any context", () => {
        expect(effectiveContextSelector(stateWith({ type: "test/init" })).ambient).toBeUndefined();
        expect(effectiveContextSelector(stateWith({ type: "test/init" })).user).toBeUndefined();
    });

    it("should return the ambient context when no one-shot context is set", () => {
        const state = stateWith(setAmbientUserContextAction({ userContext: ambientContext }));

        expect(effectiveContextSelector(state).ambient).toBe(ambientContext);
        expect(effectiveContextSelector(state).user).toBeUndefined();
    });

    it("should prefer the one-shot context over the ambient context", () => {
        const state = stateWith(
            setAmbientUserContextAction({ userContext: ambientContext }),
            setUserContextAction({ userContext: oneShotContext }),
        );

        expect(effectiveContextSelector(state).user).toBe(oneShotContext);
        expect(effectiveContextSelector(state).ambient).toBe(ambientContext);
    });

    it("should fall back to the ambient context after the one-shot context is cleared", () => {
        const state = stateWith(
            setAmbientUserContextAction({ userContext: ambientContext }),
            setUserContextAction({ userContext: oneShotContext }),
            clearUserContextAction(),
        );

        expect(effectiveContextSelector(state).ambient).toBe(ambientContext);
        expect(effectiveContextSelector(state).user).toBeUndefined();
    });

    it("should clear the ambient context when the host reports undefined", () => {
        const state = stateWith(
            setAmbientUserContextAction({ userContext: ambientContext }),
            setAmbientUserContextAction({ userContext: undefined }),
        );

        expect(effectiveContextSelector(state).ambient).toBeUndefined();
    });
});
