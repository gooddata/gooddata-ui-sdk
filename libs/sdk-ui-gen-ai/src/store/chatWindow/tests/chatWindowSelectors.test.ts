// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type IGenAIUserContext, idRef } from "@gooddata/sdk-model";

import { messagesSliceReducer } from "../../messages/messagesSlice.js";
import { type RootState } from "../../types.js";
import {
    agentSwitchingActiveSelector,
    isPreviewSelector,
    userContextSelector,
} from "../chatWindowSelectors.js";
import {
    addContextReferenceAction,
    chatWindowSliceName,
    chatWindowSliceReducer,
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
        expect(userContextSelector(stateWith({ type: "test/init" }))).toBeUndefined();
    });

    it("should return the ambient context when no one-shot context is set", () => {
        const state = stateWith(setAmbientUserContextAction({ userContext: ambientContext }));

        expect(userContextSelector(state)).toEqual(ambientContext);
    });

    it("should prefer the one-shot context over the ambient context", () => {
        const state = stateWith(
            setAmbientUserContextAction({ userContext: ambientContext }),
            setUserContextAction({ userContext: oneShotContext }),
        );

        expect(userContextSelector(state)).toEqual(oneShotContext);
    });

    it("should clear the ambient context when the host reports undefined", () => {
        const state = stateWith(
            setAmbientUserContextAction({ userContext: ambientContext }),
            setAmbientUserContextAction({ userContext: undefined }),
        );

        // ambient was merged into active, so clearing ambient doesn't clear active by default
        // unless it's explicitly cleared or changed.
        // In current implementation, setAmbientUserContextAction(undefined) sets state.context.ambient to undefined
        // but doesn't touch active.
        expect(userContextSelector(state)).toEqual(ambientContext);
    });

    it("should update active context via addContextReferenceAction when it matches ambient", () => {
        const state = stateWith(
            setAmbientUserContextAction({ userContext: ambientContext }),
            addContextReferenceAction({
                object: {
                    id: "ambient",
                    ref: idRef("ambient", "analyticalDashboard"),
                    title: "Revenue Dashboard",
                    type: "dashboard",
                    where: "view.dashboard",
                    nesting: 0,
                },
            }),
        );

        expect(userContextSelector(state)).toEqual(ambientContext);
    });
});
