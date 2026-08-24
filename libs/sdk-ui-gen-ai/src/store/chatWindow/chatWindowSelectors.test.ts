// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type IGenAIUserContext, idRef } from "@gooddata/sdk-model";

import { messagesSliceReducer } from "../messages/messagesSlice.js";
import { type RootState } from "../types.js";

import {
    agentSwitchingActiveSelector,
    allowInteractionIntelligenceSelector,
    hasPinnedContextSelector,
    interactionIntelligenceEnabledSelector,
    isPreviewSelector,
    userContextSelector,
} from "./chatWindowSelectors.js";
import {
    addContextReferenceAction,
    chatWindowSliceName,
    chatWindowSliceReducer,
    getInitialChatWindowState,
    setAmbientUserContextAction,
    setUserContextAction,
} from "./chatWindowSlice.js";

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

describe("interactionIntelligenceEnabledSelector", () => {
    const stateWith = (
        allowInteractionIntelligence: boolean | undefined,
        settings: IUserWorkspaceSettings,
    ): RootState => ({
        messages: messagesSliceReducer(undefined, { type: "test/init" }),
        // The prop seeds the store at creation rather than being dispatched — it is a mount-time
        // switch between two usages of the assistant, not something that changes.
        [chatWindowSliceName]: {
            ...getInitialChatWindowState({ allowInteractionIntelligence }),
            settings,
        },
    });

    it("should be disabled when the prop is off and the flag is on", () => {
        const state = stateWith(false, {
            enableGenAiInteractionIntelligence: true,
        } as IUserWorkspaceSettings);

        expect(allowInteractionIntelligenceSelector(state)).toBe(false);
        expect(interactionIntelligenceEnabledSelector(state)).toBe(false);
    });

    it("should be disabled when the prop is on and the flag is off", () => {
        const state = stateWith(true, {
            enableGenAiInteractionIntelligence: false,
        } as IUserWorkspaceSettings);

        expect(allowInteractionIntelligenceSelector(state)).toBe(true);
        expect(interactionIntelligenceEnabledSelector(state)).toBe(false);
    });

    it("should be disabled when both the prop and the flag are off", () => {
        const state = stateWith(false, {
            enableGenAiInteractionIntelligence: false,
        } as IUserWorkspaceSettings);

        expect(interactionIntelligenceEnabledSelector(state)).toBe(false);
    });

    it("should be enabled only when both the prop and the flag are on", () => {
        const state = stateWith(true, { enableGenAiInteractionIntelligence: true } as IUserWorkspaceSettings);

        expect(interactionIntelligenceEnabledSelector(state)).toBe(true);
    });

    it("should treat an unset prop as disabled", () => {
        const state = stateWith(undefined, {
            enableGenAiInteractionIntelligence: true,
        } as IUserWorkspaceSettings);

        expect(allowInteractionIntelligenceSelector(state)).toBe(false);
        expect(interactionIntelligenceEnabledSelector(state)).toBe(false);
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

        // The ambient context was merged into the active one, so clearing it has to subtract it
        // again - otherwise the dashboard the user just left keeps being sent with every request.
        expect(userContextSelector(state)).toBeUndefined();
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

describe("hasPinnedContextSelector", () => {
    const ambientContext: IGenAIUserContext = {
        view: { dashboard: { ref: idRef("ambient", "analyticalDashboard"), title: "2. Sales", widgets: [] } },
    };

    const stateWith = (
        settings: Partial<IUserWorkspaceSettings>,
        ...actions: Parameters<typeof chatWindowSliceReducer>[1][]
    ): RootState => ({
        messages: messagesSliceReducer(undefined, { type: "test/init" }),
        [chatWindowSliceName]: actions.reduce(chatWindowSliceReducer, {
            ...getInitialChatWindowState(),
            settings: settings as IUserWorkspaceSettings,
        }),
    });

    it("should be false without any context", () => {
        expect(hasPinnedContextSelector(stateWith({ enableAiContextSetup: true }))).toBe(false);
    });

    it("should be false for the ambient context alone", () => {
        const state = stateWith(
            { enableAiContextSetup: true },
            setAmbientUserContextAction({ userContext: ambientContext }),
        );

        expect(hasPinnedContextSelector(state)).toBe(false);
    });

    it("should be true for an object pinned from the ambient dashboard", () => {
        const state = stateWith(
            { enableAiContextSetup: true },
            setAmbientUserContextAction({ userContext: ambientContext }),
            addContextReferenceAction({
                object: {
                    id: "net-sales",
                    ref: idRef("net-sales", "insight"),
                    title: "Net Sales Over Time",
                    type: "widget",
                    where: "referencedObjects",
                    context: {
                        ref: idRef("ambient", "analyticalDashboard"),
                        title: "2. Sales",
                        type: "DASHBOARD",
                    },
                    nesting: 1,
                },
            }),
        );

        expect(hasPinnedContextSelector(state)).toBe(true);
    });

    it("should be true for a context attached while the chips are hidden", () => {
        const state = stateWith(
            { enableAiContextSetup: false },
            setUserContextAction({ userContext: ambientContext }),
        );

        expect(hasPinnedContextSelector(state)).toBe(true);
    });
});
