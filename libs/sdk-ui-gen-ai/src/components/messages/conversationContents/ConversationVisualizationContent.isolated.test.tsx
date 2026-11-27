// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { defaultImport } from "default-import";
import type { PropsWithChildren, ReactElement } from "react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import createSagaMiddleware from "redux-saga";
import { takeEvery } from "redux-saga/effects";
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
import {
    messagesSliceName,
    messagesSliceReducer,
    saveVisualisationRenderStatusAction,
} from "../../../store/messages/messagesSlice.js";
import { onVisualisationRender } from "../../../store/sideEffects/onVisualisationRender.js";
import { ConfigProvider, type LinkHandlerEvent } from "../../ConfigContext.js";
import { CustomizationProvider } from "../../CustomizationProvider.js";
import {
    type IGenAIAssistantConversationVisualisationProps,
    type IGenAIAssistantSlots,
    type IGenAIAssistantVisualizationMenuProps,
} from "../../customized/types.js";

import { ConversationVisualizationContent } from "./ConversationVisualizationContent.js";

const messages = Object.fromEntries(Object.entries(en_US).map(([id, message]) => [id, message.text]));

const visualisationMock = vi.hoisted(() => ({
    props: undefined as
        | {
              enableChangeAnalysis?: boolean;
              settings?: IUserWorkspaceSettings;
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

    it.each([undefined, { locale: "en-US", enableNewPivotTable: true } as IUserWorkspaceSettings])(
        "passes workspace settings to the renderer without an opt-in",
        (settings) => {
            renderWithStore(
                <ConversationVisualizationContent
                    message={mockMessage}
                    part={mockPart}
                    visualization={mockVisualization}
                />,
                { settings },
            );

            expect(screen.getByTestId("mock-conversation-vis")).toBeInTheDocument();
            expect(visualisationMock.props?.settings).toEqual(settings);
        },
    );

    it("should disable change analysis when KeyDriverAnalysis is not mounted", () => {
        renderWithStore(
            <ConversationVisualizationContent
                message={mockMessage}
                part={mockPart}
                visualization={mockVisualization}
            />,
            {
                isKeyDriverAnalysisMounted: false,
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
            },
        );

        const vis = screen.getByTestId("mock-conversation-vis");
        expect(vis.getAttribute("data-enable-change-analysis")).toBe("true");
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
        part = mockPart,
    }: {
        slots?: IGenAIAssistantSlots;
        canAnalyze?: boolean;
        linkHandler?: (event: LinkHandlerEvent) => string | undefined;
        part?: IChatConversationMultipartLocalPart;
    }) {
        const conversation = {
            id: "conversation-1",
            localId: "conversation-1",
            title: "Restored conversation",
            createdAt: new Date(0).toISOString(),
            updatedAt: new Date(0).toISOString(),
        };
        const message = { ...mockMessage, content: { type: "multipart" as const, parts: [part] } };
        const sagaMiddleware = defaultImport(createSagaMiddleware)();
        const store = configureStore({
            reducer: {
                [chatWindowSliceName]: chatWindowSliceReducer,
                [messagesSliceName]: messagesSliceReducer,
            },
            preloadedState: {
                [chatWindowSliceName]: getInitialChatWindowState(),
                [messagesSliceName]: {
                    ...messagesSliceReducer(undefined, { type: "test/init" }),
                    currentConversation: conversation,
                    conversationsData: {
                        [conversation.localId]: {
                            order: [message.localId],
                            items: { [message.localId]: message },
                        },
                    },
                },
            },
            middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
        });
        sagaMiddleware.run(function* () {
            yield takeEvery(saveVisualisationRenderStatusAction, onVisualisationRender);
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

        return {
            ...render(
                <ConversationVisualizationContent
                    message={mockMessage}
                    part={part}
                    visualization={mockVisualization}
                />,
                { wrapper: Wrapper },
            ),
            store,
            conversation,
        };
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
        visualisationMock.props = undefined;
    });

    describe("ConversationVisualizationBody slot", () => {
        it("renders the SDK body when no slot is supplied", () => {
            renderContent({});

            expect(screen.getByTestId("mock-conversation-vis")).toBeInTheDocument();
            expect(visualisationMock.props).toMatchObject({
                message: mockMessage,
                visualization: mockVisualization,
                isTable: false,
            });
        });

        it("replaces only the body without mounting the SDK visualization", () => {
            renderContent({
                slots: { ConversationVisualizationBody: () => <div>Custom chart</div> },
            });

            expect(screen.getByTestId("gen-ai-conversation-visualization")).toContainElement(
                screen.getByText("Custom chart"),
            );
            expect(screen.getByText(mockVisualization.insight.title)).toBeInTheDocument();
            expect(screen.getByTestId("gen-ai-visualization-toggle-button")).toBeInTheDocument();
            expect(screen.queryByTestId("mock-conversation-vis")).not.toBeInTheDocument();
            expect(visualisationMock.props).toBeUndefined();
            openMenu();
            expect(menuItemTitles()).toEqual(["Save visualization", "Open in Analyze"]);
        });

        it("bypasses the custom body in table mode and restores it when switching back", () => {
            const received: IGenAIAssistantConversationVisualisationProps[] = [];
            renderContent({
                slots: {
                    ConversationVisualizationBody: ({ defaultProps }) => {
                        received.push(defaultProps);
                        return <div>Custom chart</div>;
                    },
                },
            });

            expect(received.at(-1)).toMatchObject({
                message: mockMessage,
                visualization: mockVisualization,
                isTable: false,
                enableDrilling: true,
                onDrillFired: expect.any(Function),
                onVisualisationError: expect.any(Function),
                onVisualisationSuccess: expect.any(Function),
            });
            const customRenderCount = received.length;
            fireEvent.click(screen.getByTestId("gen-ai-visualization-toggle-button"));

            expect(received).toHaveLength(customRenderCount);
            expect(visualisationMock.props).toMatchObject({ isTable: true });
            expect(screen.getByTestId("mock-conversation-vis")).toBeInTheDocument();
            expect(screen.queryByText("Custom chart")).not.toBeInTheDocument();

            fireEvent.click(screen.getByTestId("gen-ai-visualization-toggle-button"));

            expect(received.at(-1)?.isTable).toBe(false);
            expect(screen.getByText("Custom chart")).toBeInTheDocument();
            expect(screen.queryByTestId("mock-conversation-vis")).not.toBeInTheDocument();
        });

        it("keeps error reporting and recovery connected to the custom body", () => {
            let bodyProps: IGenAIAssistantConversationVisualisationProps | undefined;
            renderContent({
                slots: {
                    ConversationVisualizationBody: ({ defaultProps }) => {
                        bodyProps = defaultProps;
                        return <div>Custom chart</div>;
                    },
                },
            });

            act(() => bodyProps?.onVisualisationError?.(new NegativeValuesSdkError()));
            expect(screen.getByText("Negative values found in visualization.")).toBeInTheDocument();

            act(() => bodyProps?.onVisualisationSuccess?.());
            expect(screen.queryByText("Negative values found in visualization.")).not.toBeInTheDocument();

            act(() => bodyProps?.onVisualisationError?.(new UnexpectedSdkError()));
            expect(screen.queryByTestId("gen-ai-visualization-menu-button")).not.toBeInTheDocument();
            expect(screen.queryByTestId("gen-ai-visualization-toggle-button")).not.toBeInTheDocument();

            act(() => bodyProps?.onVisualisationSuccess?.());
            expect(screen.getByTestId("gen-ai-visualization-menu-button")).toBeInTheDocument();
            expect(screen.getByTestId("gen-ai-visualization-toggle-button")).toBeInTheDocument();
        });

        it.each([
            ["success", false],
            ["error", false],
            ["success", true],
            ["error", true],
        ] as const)(
            "clears a restored chart's reporting state on %s (delegating to Default: %s)",
            (result, delegateDefault) => {
                const part = { ...mockPart, reporting: true };
                let bodyProps: IGenAIAssistantConversationVisualisationProps | undefined;
                const { store, rerender, conversation } = renderContent({
                    part,
                    slots: {
                        ConversationVisualizationBody: ({ Default, defaultProps }) => {
                            bodyProps = defaultProps;
                            return delegateDefault ? <Default {...defaultProps} /> : <div>Custom chart</div>;
                        },
                    },
                });
                expect(screen.getByTestId("gen-ai-visualization-menu-button")).toBeDisabled();

                const renderCallbacks = delegateDefault ? visualisationMock.props : bodyProps;
                act(() => {
                    if (result === "success") {
                        renderCallbacks?.onVisualisationSuccess?.();
                    } else {
                        renderCallbacks?.onVisualisationError?.(new NegativeValuesSdkError());
                    }
                });

                const restoredMessage =
                    store.getState().messages.conversationsData[conversation.localId].items[
                        mockMessage.localId
                    ];
                expect(restoredMessage.content.type).toBe("multipart");
                if (restoredMessage.content.type !== "multipart") {
                    throw new Error("Expected a multipart message");
                }
                const restoredPart = restoredMessage.content.parts[0] as IChatConversationMultipartLocalPart;
                expect(restoredPart.reporting).toBeUndefined();
                rerender(
                    <ConversationVisualizationContent
                        message={restoredMessage}
                        part={restoredPart}
                        visualization={mockVisualization}
                    />,
                );

                expect(screen.getByTestId("gen-ai-visualization-menu-button")).not.toBeDisabled();
                expect(screen.queryAllByTestId("mock-conversation-vis")).toHaveLength(
                    delegateDefault ? 1 : 0,
                );
                expect(visualisationMock.props !== undefined).toBe(delegateDefault);
                expect(screen.queryAllByText("Negative values found in visualization.")).toHaveLength(
                    result === "error" ? 1 : 0,
                );
            },
        );

        it.each(["Save visualization", "Open in Analyze"])(
            "keeps the %s dialog with a custom body",
            async (menuTitle) => {
                renderContent({
                    slots: { ConversationVisualizationBody: () => <div>Custom chart</div> },
                });
                openMenu();
                fireEvent.click(screen.getByText(menuTitle));

                expect(await screen.findByRole("textbox")).toHaveValue(mockVisualization.insight.title);
                expect(screen.getByText("Custom chart")).toBeInTheDocument();
                expect(visualisationMock.props).toBeUndefined();
            },
        );
    });

    describe.each([
        { mode: "save", menuTitle: "Save visualization", submitText: messages["gd.gen-ai.button.save"] },
        {
            mode: "explore",
            menuTitle: "Open in Analyze",
            submitText: messages["gd.gen-ai.button.save_and_explore"],
        },
    ])("$mode dialog", ({ menuTitle, submitText }) => {
        it.each(["message", "part", "visualization"] as const)(
            "preserves the entered title and focus when %s changes",
            async (changedProp) => {
                const { rerender } = renderContent({});
                openMenu();
                fireEvent.click(screen.getByText(menuTitle));

                const input = await screen.findByRole("textbox");
                fireEvent.change(input, { target: { value: "My custom visualization" } });
                input.focus();
                expect(input).toHaveValue("My custom visualization");
                expect(input).toHaveFocus();

                rerender(
                    <ConversationVisualizationContent
                        message={changedProp === "message" ? { ...mockMessage } : mockMessage}
                        part={changedProp === "part" ? { ...mockPart, reporting: true } : mockPart}
                        visualization={
                            changedProp === "visualization"
                                ? {
                                      ...mockVisualization,
                                      insight: { ...mockVisualization.insight, title: "Updated title" },
                                  }
                                : mockVisualization
                        }
                    />,
                );

                expect(await screen.findByRole("textbox")).toHaveValue("My custom visualization");
                expect(screen.getByRole("textbox")).toBe(input);
                expect(input).toHaveFocus();
                expect(screen.getByRole("button", { name: submitText })).toBeInTheDocument();
                expect(input).toHaveAttribute(
                    "placeholder",
                    changedProp === "visualization" ? "Updated title" : mockVisualization.insight.title,
                );
            },
        );

        it("can be canceled and reopened with the original title", async () => {
            renderContent({});
            expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
            openMenu();
            fireEvent.click(screen.getByText(menuTitle));
            await screen.findByRole("textbox");
            expect(screen.getByRole("button", { name: submitText })).toBeInTheDocument();
            fireEvent.change(screen.getByRole("textbox"), { target: { value: "Discard this title" } });

            fireEvent.click(screen.getByRole("button", { name: messages["gd.gen-ai.button.cancel"] }));

            expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
            openMenu();
            fireEvent.click(screen.getByText(menuTitle));
            expect(await screen.findByRole("textbox")).toHaveValue(mockVisualization.insight.title);
            expect(screen.getByRole("button", { name: submitText })).toBeInTheDocument();
        });
    });

    it("renders the built-in menu items by default", () => {
        renderContent({});
        openMenu();

        expect(menuItemTitles()).toEqual(["Save visualization", "Open in Analyze"]);
    });

    it.each(["save check", "conversation part"])(
        "keeps open and copy actions after a fatal error when saved via %s",
        (savedVia) => {
            saveCheck.visualisationSaved = savedVia === "save check";
            renderContent({
                part: {
                    ...mockPart,
                    saved:
                        savedVia === "conversation part" ? mockVisualization.insight.identifier : undefined,
                },
            });
            expect(screen.getByTestId("gen-ai-visualization-toggle-button")).toBeInTheDocument();

            act(() => visualisationMock.props?.onVisualisationError?.(new UnexpectedSdkError()));
            openMenu();

            expect(menuItemTitles()).toEqual(["Open in Analyze", COPY_LINK_TITLE]);
            expect(screen.queryByTestId("gen-ai-visualization-toggle-button")).not.toBeInTheDocument();
        },
    );

    it("hides the menu and table toggle after a fatal error for an unsaved visualization", () => {
        renderContent({});

        act(() => visualisationMock.props?.onVisualisationError?.(new UnexpectedSdkError()));

        expect(screen.queryByTestId("gen-ai-visualization-menu-button")).not.toBeInTheDocument();
        expect(screen.queryByTestId("gen-ai-visualization-toggle-button")).not.toBeInTheDocument();
    });

    it("hides saved visualization actions after a fatal error without analyze permission", () => {
        saveCheck.visualisationSaved = true;
        renderContent({ canAnalyze: false });

        act(() => visualisationMock.props?.onVisualisationError?.(new UnexpectedSdkError()));

        expect(screen.queryByTestId("gen-ai-visualization-menu-button")).not.toBeInTheDocument();
        expect(screen.queryByTestId("gen-ai-visualization-toggle-button")).not.toBeInTheDocument();
    });

    it.each([
        { action: "open", title: "Open in Analyze" },
        { action: "copy", title: COPY_LINK_TITLE },
    ])("handles $action for a saved visualization after a fatal error", ({ action, title }) => {
        saveCheck.visualisationSaved = true;
        const linkHandler = vi.fn();
        renderContent({ linkHandler });

        act(() => visualisationMock.props?.onVisualisationError?.(new UnexpectedSdkError()));
        openMenu();
        fireEvent.click(screen.getByText(title));

        expect(linkHandler).toHaveBeenCalledTimes(1);
        expect(linkHandler).toHaveBeenCalledWith(expect.objectContaining({ action }));
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
