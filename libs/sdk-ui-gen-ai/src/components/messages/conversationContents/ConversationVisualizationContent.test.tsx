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
import { type ISlotProps } from "@gooddata/sdk-ui-kit";

import { en_US } from "../../../localization/bundles/en-US.localization-bundle.js";
import { type IChatConversationLocalItem, type IChatConversationMultipartLocalPart } from "../../../model.js";
import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    getInitialChatWindowState,
} from "../../../store/chatWindow/chatWindowSlice.js";
import { messagesSliceName, messagesSliceReducer } from "../../../store/messages/messagesSlice.js";
import { ConfigProvider, type LinkHandlerEvent } from "../../ConfigContext.js";
import { CustomizationProvider } from "../../CustomizationProvider.js";
import {
    type IGenAIAssistantSlots,
    type IGenAIAssistantVisualizationMenuProps,
} from "../../customized/types.js";

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

const saveCheck = vi.hoisted(() => ({ visualisationSaved: false }));

vi.mock("./useSaveCheck.js", () => ({
    useInsightSaveCheck: () => ({
        visualisationCheckLoading: false,
        visualisationSaved: saveCheck.visualisationSaved,
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
                                <CustomizationProvider>{children}</CustomizationProvider>
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

describe("ConversationVisualizationContent - VisualizationMenu slot", () => {
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

    function renderContent({
        slots,
        canAnalyze = true,
        linkHandler,
    }: {
        slots?: IGenAIAssistantSlots;
        canAnalyze?: boolean;
        linkHandler?: (event: LinkHandlerEvent) => string | undefined;
    }) {
        const store = configureStore({
            reducer: {
                [chatWindowSliceName]: chatWindowSliceReducer,
                [messagesSliceName]: messagesSliceReducer,
            },
            preloadedState: {
                [chatWindowSliceName]: getInitialChatWindowState(),
            },
        });

        function Wrapper({ children }: PropsWithChildren) {
            return (
                <Provider store={store}>
                    <WorkspaceProvider workspace="test-workspace">
                        <ConfigProvider canAnalyze={canAnalyze} linkHandler={linkHandler}>
                            <IntlProvider locale="en" messages={messages}>
                                <CustomizationProvider slots={slots}>{children}</CustomizationProvider>
                            </IntlProvider>
                        </ConfigProvider>
                    </WorkspaceProvider>
                </Provider>
            );
        }

        return render(
            <ConversationVisualizationContent
                message={mockMessage}
                part={mockPart}
                visualization={mockVisualization}
            />,
            { wrapper: Wrapper },
        );
    }

    const COPY_LINK_TITLE = messages["gd.gen-ai.visualisation.menu.button.copy_visualisation_link"];

    function openMenu() {
        fireEvent.click(screen.getByTestId("gen-ai-visualization-menu-button"));
    }

    function menuItemTitles() {
        const items = screen
            .getByTestId("gen-ai-visualization-menu-list")
            .querySelectorAll("[role='menuitem']");
        return Array.from(items, (item) => item.textContent);
    }

    beforeEach(() => {
        saveCheck.visualisationSaved = false;
    });

    it("renders the built-in menu items by default", () => {
        renderContent({});
        openMenu();

        expect(menuItemTitles()).toEqual(["Save visualization", "Open in Analyze"]);
    });

    it("renders a custom item and closes the menu after it is selected", () => {
        const onSelect = vi.fn();
        const slots: IGenAIAssistantSlots = {
            VisualizationMenu: ({ Default, defaultProps }) => (
                <Default
                    {...defaultProps}
                    items={[...defaultProps.items, { id: "custom", title: "Send to Slack", onSelect }]}
                />
            ),
        };

        renderContent({ slots });
        openMenu();

        expect(menuItemTitles()).toEqual(["Save visualization", "Open in Analyze", "Send to Slack"]);

        fireEvent.click(screen.getByText("Send to Slack"));

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId("gen-ai-visualization-menu-list")).toBeNull();
    });

    it("removes built-in items filtered out by the slot", () => {
        const slots: IGenAIAssistantSlots = {
            VisualizationMenu: ({ Default, defaultProps }) => (
                <Default
                    {...defaultProps}
                    items={defaultProps.items.filter((item) => item.id !== "button-save")}
                />
            ),
        };

        renderContent({ slots });
        openMenu();

        expect(menuItemTitles()).toEqual(["Open in Analyze"]);
    });

    it("hides the menu button when the slot removes all items", () => {
        const slots: IGenAIAssistantSlots = {
            VisualizationMenu: ({ Default, defaultProps }) => <Default {...defaultProps} items={[]} />,
        };

        renderContent({ slots });

        expect(screen.queryByTestId("gen-ai-visualization-menu-button")).toBeNull();
    });

    it("passes the visualization context to the slot", () => {
        const received: IGenAIAssistantVisualizationMenuProps[] = [];
        function CaptureSlot({ Default, defaultProps }: ISlotProps<IGenAIAssistantVisualizationMenuProps>) {
            received.push(defaultProps);
            return <Default {...defaultProps} />;
        }

        renderContent({ slots: { VisualizationMenu: CaptureSlot } });

        expect(received.at(-1)).toMatchObject({
            message: mockMessage,
            part: mockPart,
            visualization: mockVisualization,
            isVisualizationSaved: false,
        });
    });

    it("offers only custom items without analyze permission", () => {
        const slots: IGenAIAssistantSlots = {
            VisualizationMenu: ({ Default, defaultProps }) => (
                <Default
                    {...defaultProps}
                    items={[
                        ...defaultProps.items,
                        { id: "custom", title: "Send to Slack", onSelect: vi.fn() },
                    ]}
                />
            ),
        };

        renderContent({ slots, canAnalyze: false });
        openMenu();

        expect(menuItemTitles()).toEqual(["Send to Slack"]);
    });

    it("opens a saved visualization in Analyze through the link handler", () => {
        saveCheck.visualisationSaved = true;
        const linkHandler = vi.fn();
        renderContent({ linkHandler });
        openMenu();

        fireEvent.click(screen.getByText("Open in Analyze"));

        expect(linkHandler).toHaveBeenCalledTimes(1);
        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({ action: "open", visualizationStatus: "saved" }),
        );
    });

    it("copies the link of a saved visualization through the link handler", () => {
        saveCheck.visualisationSaved = true;
        const linkHandler = vi.fn();
        renderContent({ linkHandler });
        openMenu();

        fireEvent.click(screen.getByText(COPY_LINK_TITLE));

        expect(linkHandler).toHaveBeenCalledTimes(1);
        expect(linkHandler).toHaveBeenCalledWith(expect.objectContaining({ action: "copy" }));
    });

    it("does not call the link handler when an unsaved visualization is opened", () => {
        const linkHandler = vi.fn();
        renderContent({ linkHandler });
        openMenu();

        fireEvent.click(screen.getByText("Open in Analyze"));

        expect(linkHandler).not.toHaveBeenCalled();
    });

    it("tells the slot that the visualization is saved", () => {
        saveCheck.visualisationSaved = true;
        const received: IGenAIAssistantVisualizationMenuProps[] = [];
        function CaptureSlot({ Default, defaultProps }: ISlotProps<IGenAIAssistantVisualizationMenuProps>) {
            received.push(defaultProps);
            return <Default {...defaultProps} />;
        }

        renderContent({ slots: { VisualizationMenu: CaptureSlot } });

        expect(received.at(-1)?.isVisualizationSaved).toBe(true);
    });
});
