// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IChatConversationVisualisationContent,
    type IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import { NegativeValuesSdkError, UnexpectedSdkError, WorkspaceProvider } from "@gooddata/sdk-ui";

import { en_US } from "../../../localization/bundles/en-US.localization-bundle.js";
import { type IChatConversationLocalItem, type IChatConversationMultipartLocalPart } from "../../../model.js";
import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    getInitialChatWindowState,
} from "../../../store/chatWindow/chatWindowSlice.js";
import { messagesSliceName, messagesSliceReducer } from "../../../store/messages/messagesSlice.js";
import { ConfigProvider } from "../../ConfigContext.js";

import { ConversationVisualizationContent } from "./ConversationVisualizationContent.js";

const messages = Object.fromEntries(Object.entries(en_US).map(([id, message]) => [id, message.text]));

const visualisationMock = vi.hoisted(() => ({
    props: undefined as
        | {
              enableChangeAnalysis?: boolean;
              onVisualisationError?: (error: Error) => void;
              onVisualisationSuccess?: () => void;
          }
        | undefined,
}));

vi.mock("./ConversationVisualisation.js", () => ({
    ConversationVisualisation: (props: NonNullable<typeof visualisationMock.props>) => {
        visualisationMock.props = props;
        return (
            <div
                data-testid="mock-conversation-vis"
                data-enable-change-analysis={String(props.enableChangeAnalysis)}
            />
        );
    },
}));

vi.mock("./useSaveCheck.js", () => ({
    useInsightSaveCheck: () => ({
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

        function Wrapper({ children }: PropsWithChildren) {
            return (
                <Provider store={store}>
                    <WorkspaceProvider workspace="test-workspace">
                        <ConfigProvider canAnalyze>
                            <IntlProvider locale="en" messages={messages}>
                                {children}
                            </IntlProvider>
                        </ConfigProvider>
                    </WorkspaceProvider>
                </Provider>
            );
        }

        return render(ui, { wrapper: Wrapper });
    };

    beforeEach(() => {
        visualisationMock.props = undefined;
    });

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

    it("clears the visualization error when switching between chart and table", () => {
        renderWithStore(
            <ConversationVisualizationContent
                message={mockMessage}
                part={mockPart}
                visualization={mockVisualization}
            />,
        );

        act(() => visualisationMock.props?.onVisualisationError?.(new NegativeValuesSdkError()));
        expect(screen.getByText("Negative values found in visualization.")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("gen-ai-visualization-toggle-button"));

        expect(screen.queryByText("Negative values found in visualization.")).not.toBeInTheDocument();
    });

    it("clears the visualization error when the active insight changes", () => {
        const { rerender } = renderWithStore(
            <ConversationVisualizationContent
                message={mockMessage}
                part={mockPart}
                visualization={mockVisualization}
            />,
        );
        const nextVisualization = {
            ...mockVisualization,
            insight: {
                ...mockVisualization.insight,
                identifier: "vis2",
                uri: "/vis2",
            },
        };

        act(() => visualisationMock.props?.onVisualisationError?.(new NegativeValuesSdkError()));
        rerender(
            <ConversationVisualizationContent
                message={mockMessage}
                part={mockPart}
                visualization={nextVisualization}
            />,
        );

        expect(screen.queryByText("Negative values found in visualization.")).not.toBeInTheDocument();
    });

    it("clears the visualization error after a successful render", () => {
        renderWithStore(
            <ConversationVisualizationContent
                message={mockMessage}
                part={mockPart}
                visualization={mockVisualization}
            />,
        );

        act(() => visualisationMock.props?.onVisualisationError?.(new NegativeValuesSdkError()));
        act(() => visualisationMock.props?.onVisualisationSuccess?.());

        expect(screen.queryByText("Negative values found in visualization.")).not.toBeInTheDocument();
    });

    it("records a later visualization error after an earlier error", () => {
        renderWithStore(
            <ConversationVisualizationContent
                message={mockMessage}
                part={mockPart}
                visualization={mockVisualization}
            />,
        );

        act(() => visualisationMock.props?.onVisualisationError?.(new NegativeValuesSdkError()));
        act(() => visualisationMock.props?.onVisualisationError?.(new UnexpectedSdkError()));

        expect(screen.queryByText("Negative values found in visualization.")).not.toBeInTheDocument();
    });
});
