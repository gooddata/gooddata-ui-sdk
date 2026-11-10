// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type IDashboard, idRef } from "@gooddata/sdk-model";
import { WorkspaceProvider } from "@gooddata/sdk-ui";

import { DEFAULT_MESSAGES } from "../../../localization/translations.js";
import { type IChatConversationMultipartLocalPart, makeAssistantItem } from "../../../model.js";
import { messagesSliceReducer, setCurrentConversationAction } from "../../../store/messages/messagesSlice.js";
import { createEmptyConversation } from "../../../store/utils.js";
import { ConfigProvider } from "../../ConfigContext.js";

import { ConversationDashboardContent } from "./ConversationDashboardContent.js";

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("./useSaveCheck.js", () => ({
    useDashboardSaveCheck: () => ({ dashboardCheckLoading: false, dashboardSaved: false }),
}));

const dashboard: IDashboard = {
    type: "IDashboard",
    ref: idRef("budget-dashboard"),
    uri: "/dashboard/budget-dashboard",
    identifier: "budget-dashboard",
    title: "Budget dashboard",
    description: "",
    created: "2026-01-01",
    updated: "2026-01-01",
    tags: [],
    shareStatus: "private",
};

const originalLocation = Object.getOwnPropertyDescriptor(window, "location");

afterEach(() => {
    cleanup();
    if (originalLocation) {
        Object.defineProperty(window, "location", originalLocation);
    }
});

function renderCard(allowNativeLinks: boolean) {
    const store = configureStore({ reducer: { messages: messagesSliceReducer } });
    store.dispatch(
        setCurrentConversationAction({
            conversation: {
                ...createEmptyConversation(),
                id: "server-conversation-id",
                localId: "temporary-conversation-id",
            },
        }),
    );
    const linkHandler = vi.fn();
    const location = { href: "" };
    Object.defineProperty(window, "location", { configurable: true, value: location });
    const part: IChatConversationMultipartLocalPart = { type: "dashboard", dashboard, insights: [] };

    render(
        <Provider store={store}>
            <IntlProvider locale="en-US" messages={DEFAULT_MESSAGES["en-US"]}>
                <WorkspaceProvider workspace="workspace-1">
                    <ConfigProvider allowNativeLinks={allowNativeLinks} linkHandler={linkHandler}>
                        <ConversationDashboardContent
                            dashboard={dashboard}
                            part={part}
                            message={makeAssistantItem()}
                        />
                    </ConfigProvider>
                </WorkspaceProvider>
            </IntlProvider>
        </Provider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    return { linkHandler, location };
}

const expectedUrl =
    "/workspace/workspace-1/dashboards/#/new-dashboard/?aibuilder=budget-dashboard&conversationId=server-conversation-id";

describe("ConversationDashboardContent", () => {
    it("uses the persistent conversation ID for native navigation", () => {
        const { location, linkHandler } = renderCard(true);

        expect(location.href).toBe(expectedUrl);
        expect(linkHandler).not.toHaveBeenCalled();
    });

    it("keeps local and backend IDs separate in delegated links while using the backend ID in the URL", () => {
        const { linkHandler } = renderCard(false);

        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                itemUrl: expectedUrl,
                conversationId: "temporary-conversation-id",
                threadId: "server-conversation-id",
            }),
        );
    });
});
