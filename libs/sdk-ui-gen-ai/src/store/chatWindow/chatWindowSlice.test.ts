// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type IGenAIUserContext, idRef } from "@gooddata/sdk-model";

import { clearThreadAction, startNewConversationAction } from "../messages/messagesSlice.js";

import {
    chatWindowSliceReducer,
    getInitialChatWindowState,
    selectedContextReferencesAction,
    setAmbientUserContextAction,
    setUserContextAction,
} from "./chatWindowSlice.js";

const ambientContext: IGenAIUserContext = {
    view: {
        dashboard: {
            ref: idRef("ambient-dashboard", "analyticalDashboard"),
            title: "2. Sales",
            widgets: [],
        },
    },
};

const pinnedWidgetContext: IGenAIUserContext = {
    referencedObjects: [
        {
            context: {
                ref: idRef("ambient-dashboard", "analyticalDashboard"),
                title: "2. Sales",
                type: "DASHBOARD",
            },
            objects: [
                {
                    ref: idRef("net-sales-over-time", "insight"),
                    title: "Net Sales Over Time",
                    type: "WIDGET",
                },
            ],
        },
    ],
};

const stateWith = (
    settings: Partial<IUserWorkspaceSettings>,
    ...actions: Parameters<typeof chatWindowSliceReducer>[1][]
) =>
    actions.reduce(chatWindowSliceReducer, {
        ...getInitialChatWindowState(),
        settings: settings as IUserWorkspaceSettings,
    });

const contextSetupOn = { enableAiContextSetup: true };
const contextSetupOff = { enableAiContextSetup: false };

describe("setAmbientUserContextAction", () => {
    it("should clear summarize-seeded context when the host reports undefined with context setup disabled", () => {
        const summarizeContext: IGenAIUserContext = {
            ...ambientContext,
            referencedObjects: pinnedWidgetContext.referencedObjects,
        };

        const state = stateWith(
            contextSetupOff,
            setUserContextAction({ userContext: summarizeContext }),
            setAmbientUserContextAction({ userContext: undefined }),
        );

        expect(state.context.active).toBeUndefined();
    });
});

describe.each([
    ["startNewConversationAction", startNewConversationAction],
    ["clearThreadAction", clearThreadAction],
])("%s", (_name, action) => {
    it("should drop the explicitly pinned context and keep the ambient one", () => {
        const state = stateWith(
            contextSetupOn,
            setAmbientUserContextAction({ userContext: ambientContext }),
            setUserContextAction({ userContext: pinnedWidgetContext }),
            action(),
        );

        expect(state.context.active).toEqual(ambientContext);
        expect(state.context.ambient).toEqual(ambientContext);
    });

    it("should clear the whole active context when context setup is disabled", () => {
        const state = stateWith(
            contextSetupOff,
            setAmbientUserContextAction({ userContext: ambientContext }),
            setUserContextAction({ userContext: pinnedWidgetContext }),
            action(),
        );

        expect(state.context.active).toBeUndefined();
    });

    it("should leave an empty context empty", () => {
        const state = stateWith(contextSetupOn, action());

        expect(state.context.active).toBeUndefined();
        expect(state.context.ambient).toBeUndefined();
    });

    it("should not share references between the active and the ambient context", () => {
        const state = stateWith(
            contextSetupOn,
            setAmbientUserContextAction({ userContext: ambientContext }),
            action(),
        );

        expect(state.context.active).toEqual(ambientContext);
        expect(state.context.active).not.toBe(state.context.ambient);
        expect(state.context.active?.view).not.toBe(state.context.ambient?.view);
    });
});

describe("selectedContextReferencesAction", () => {
    it("should update selected context and update references in the store context", () => {
        const state = stateWith(
            contextSetupOn,
            setAmbientUserContextAction({ userContext: ambientContext }),
            selectedContextReferencesAction({
                activated: true,
                dashboard: {
                    id: "ambient-dashboard",
                    ref: idRef("ambient-dashboard", "analyticalDashboard"),
                    title: "2. Sales",
                    type: "dashboard",
                    where: "view.dashboard",
                    nesting: 0,
                },
            }),
        );

        expect(state.context.ambientSelected?.dashboard?.id).toBe("ambient-dashboard");
        expect(state.context.active?.view?.dashboard?.ref).toEqual(
            idRef("ambient-dashboard", "analyticalDashboard"),
        );
    });
});
