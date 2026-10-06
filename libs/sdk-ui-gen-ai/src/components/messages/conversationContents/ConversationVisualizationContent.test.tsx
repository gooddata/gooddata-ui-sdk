// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import {
    type IChatConversationVisualisationContent,
    type IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import { WorkspaceProvider } from "@gooddata/sdk-ui";

import { en_US } from "../../../localization/bundles/en-US.localization-bundle.js";
import { type IChatConversationLocalItem, type IChatConversationMultipartLocalPart } from "../../../model.js";
import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    getInitialChatWindowState,
} from "../../../store/chatWindow/chatWindowSlice.js";
import { messagesSliceName, messagesSliceReducer } from "../../../store/messages/messagesSlice.js";

import { ConversationVisualizationContent } from "./ConversationVisualizationContent.js";

const messages = Object.fromEntries(Object.entries(en_US).map(([id, message]) => [id, message.text]));

vi.mock("./ConversationVisualisation.js", () => ({
    ConversationVisualisation: (props: { enableChangeAnalysis?: boolean }) => (
        <div
            data-testid="mock-conversation-vis"
            data-enable-change-analysis={String(props.enableChangeAnalysis)}
        />
    ),
}));

vi.mock("./useSaveCheck.js", () => ({
    useSaveCheck: () => ({
        visualisationCheckLoading: false,
        visualisationSaved: false,
    }),
}));

describe("ConversationVisualizationContent - Key Driver Analysis enablement", () => {
    const mockMessage: IChatConversationLocalItem = {
        id: "1",
        role: "assistant",
        type: "item",
        createdAt: Date.now(),
        content: { type: "multipart", parts: [] },
        localId: "1",
        responseId: "1",
    };

    const mockVisualization = {
        insight: {
            identifier: "vis1",
            uri: "/vis1",
            title: "Vis 1",
            visualizationUrl: "local:bar",
            buckets: [],
            filters: [],
            sorts: [],
            properties: {},
        },
    } as unknown as NonNullable<IChatConversationVisualisationContent["visualization"]>;

    const mockPart = {
        type: "visualization" as const,
        visualization: mockVisualization,
    } as unknown as IChatConversationMultipartLocalPart;

    const renderWithStore = (
        ui: ReactElement,
        initialState?: { isKeyDriverAnalysisMounted?: boolean; settings?: IUserWorkspaceSettings },
    ) => {
        const store = configureStore({
            reducer: {
                [chatWindowSliceName]: chatWindowSliceReducer,
                [messagesSliceName]: messagesSliceReducer,
            },
            preloadedState: {
                [chatWindowSliceName]: {
                    ...getInitialChatWindowState(),
                    isKeyDriverAnalysisMounted: initialState?.isKeyDriverAnalysisMounted ?? false,
                    settings: initialState?.settings,
                },
            },
        });

        return render(
            <Provider store={store}>
                <WorkspaceProvider workspace="test-workspace">
                    <IntlProvider locale="en" messages={messages}>
                        {ui}
                    </IntlProvider>
                </WorkspaceProvider>
            </Provider>,
        );
    };

    it("should disable change analysis when KeyDriverAnalysis is not mounted", () => {
        renderWithStore(
            <ConversationVisualizationContent
                message={mockMessage}
                part={mockPart}
                visualization={mockVisualization}
            />,
            {
                isKeyDriverAnalysisMounted: false,
                settings: { enableChangeAnalysis: true } as IUserWorkspaceSettings,
            },
        );

        const vis = screen.getByTestId("mock-conversation-vis");
        expect(vis.getAttribute("data-enable-change-analysis")).toBe("false");
    });

    it("should enable change analysis when KeyDriverAnalysis is mounted and setting is enabled", () => {
        renderWithStore(
            <ConversationVisualizationContent
                message={mockMessage}
                part={mockPart}
                visualization={mockVisualization}
            />,
            {
                isKeyDriverAnalysisMounted: true,
                settings: { enableChangeAnalysis: true } as IUserWorkspaceSettings,
            },
        );

        const vis = screen.getByTestId("mock-conversation-vis");
        expect(vis.getAttribute("data-enable-change-analysis")).toBe("true");
    });

    it("should disable change analysis when setting is disabled even if KeyDriverAnalysis is mounted", () => {
        renderWithStore(
            <ConversationVisualizationContent
                message={mockMessage}
                part={mockPart}
                visualization={mockVisualization}
            />,
            {
                isKeyDriverAnalysisMounted: true,
                settings: { enableChangeAnalysis: false } as IUserWorkspaceSettings,
            },
        );

        const vis = screen.getByTestId("mock-conversation-vis");
        expect(vis.getAttribute("data-enable-change-analysis")).toBe("false");
    });

    it("should disable change analysis when enableKeyDriverAnalysis customization prop is false", () => {
        renderWithStore(
            <ConversationVisualizationContent
                message={mockMessage}
                part={mockPart}
                visualization={mockVisualization}
                enableKeyDriverAnalysis={false}
            />,
            {
                isKeyDriverAnalysisMounted: true,
                settings: { enableChangeAnalysis: true } as IUserWorkspaceSettings,
            },
        );

        const vis = screen.getByTestId("mock-conversation-vis");
        expect(vis.getAttribute("data-enable-change-analysis")).toBe("false");
    });

    it("should enable change analysis when enableKeyDriverAnalysis customization prop is true and KeyDriverAnalysis is mounted", () => {
        renderWithStore(
            <ConversationVisualizationContent
                message={mockMessage}
                part={mockPart}
                visualization={mockVisualization}
                enableKeyDriverAnalysis
            />,
            {
                isKeyDriverAnalysisMounted: true,
                settings: { enableChangeAnalysis: false } as IUserWorkspaceSettings,
            },
        );

        const vis = screen.getByTestId("mock-conversation-vis");
        expect(vis.getAttribute("data-enable-change-analysis")).toBe("true");
    });
});
