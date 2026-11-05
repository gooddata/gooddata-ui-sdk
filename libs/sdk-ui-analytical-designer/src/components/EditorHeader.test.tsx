// (C) 2007-2026 GoodData Corporation

import { type ReactNode, useEffect, useState } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { type UnknownAction } from "redux";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import {
    type ISlotProps,
    type IUiResizableSidebarState,
    UiResizableSidebarProvider,
} from "@gooddata/sdk-ui-kit";

import { resetApplication } from "../actions/app_context_actions.js";
import { cancelEditFromKDAction } from "../actions/cancel_edit_from_kd_actions.js";
import { openReport } from "../actions/open_actions.js";
import { undo } from "../actions/time_travel_actions.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { createStore } from "../create_store.js";
import {
    type AnalyticalDesignerOptionsItem,
    type IAnalyticalDesignerClearProps,
    type IAnalyticalDesignerEditorHeaderProps,
    type IAnalyticalDesignerOpenProps,
    type IAnalyticalDesignerOptionsProps,
    type IAnalyticalDesignerSaveProps,
    type IAnalyticalDesignerUndoRedoProps,
    type IAnalyticalDesignerVisualizationAccessProps,
    type IAnalyticalDesignerVisualizationInfoProps,
} from "../embedding/editorHeaderSlotTypes.js";
import { AdSlotsProvider, type IAnalyticalDesignerSlots } from "../embedding/slots.js";
import { rootReducer } from "../reducers/root_reducer.js";
import { supportsExportToXlsx } from "../selectors/backend_capabilities_selector.js";
import {
    hiddenActions,
    isCancelVisible,
    isEmbedButtonVisible,
    isOpenVisible,
    isOptionsMenuEnabled,
    isSaveAsVisible,
    isSaveVisible,
} from "../selectors/editor_header_selector.js";
import { isEnableTimezoneChange } from "../selectors/feature_flag_selector.js";
import { canManageInsightAccess, insightAccessTarget } from "../selectors/insight_access_selector.js";
import { getExportVisible, getIsExportXLSXDisabled } from "../selectors/options_menu_selector.js";
import { isEnabledInsightUsageOnDashboards } from "../selectors/report_selector.js";
import { reportTitleSelector } from "../selectors/report_title_selector.js";
import { type IAppState, type ITimeTravelEntry } from "../store/types.js";
import { withReport, withRoot } from "../tests/state_builder.test.helpers.js";
import { getIntlOptions } from "../utils/with_intl.js";

import { STATIC_CATALOG_SIDEBAR } from "./catalogSidebar/useCatalogSidebarState.js";
import { EditorHeader } from "./EditorHeader.js";

vi.hoisted(() => {
    vi.resetModules();
});

// Selector values a test forces; every other selector reads the real store.
const selectorOverrides = vi.hoisted(() => new Map<unknown, unknown>());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    const { useSelector: useActualSelector } = actual as {
        useSelector: (selector: (state: unknown) => unknown) => unknown;
    };
    return {
        ...actual,
        useSelector: (selector: (state: unknown) => unknown) => {
            const value = useActualSelector(selector);
            return selectorOverrides.has(selector) ? selectorOverrides.get(selector) : value;
        },
    };
});

vi.mock("./header/VisualizationsDropdown.js", () => ({
    VisualizationsDropdown: ({ label }: { label: string }) => (
        <div className="s-report_select" data-testid="mock-visualizations-dropdown">
            {label}
        </div>
    ),
}));

afterAll(() => {
    // Drop this file's mocks from the shared (isolate:false) registry so they do not leak into sibling files.
    vi.resetModules();
});

const getAccessList = vi.fn(() => Promise.resolve([]));
const testBackend = {
    workspace: () => ({ objectPermissions: () => ({ getAccessList }) }),
    currentUser: () => ({ getUser: () => Promise.resolve({ login: "me" }) }),
} as unknown as IAnalyticalBackend;

interface IRenderOptions {
    slots?: IAnalyticalDesignerSlots;
    prepareState?: (state: IAppState) => IAppState;
    sidebar?: IUiResizableSidebarState;
}

function renderHeader({ slots = {}, prepareState = (state) => state, sidebar }: IRenderOptions = {}) {
    const { store } = createStore((state: IAppState, action: UnknownAction) =>
        prepareState(rootReducer(state, action)),
    );
    const dispatched: UnknownAction[] = [];
    // record what the header asks for without running it
    vi.spyOn(store, "dispatch").mockImplementation((action: UnknownAction) => {
        dispatched.push(action);
        return action;
    });

    function Wrapper({
        sidebarState,
        children,
    }: {
        sidebarState?: IUiResizableSidebarState;
        children: ReactNode;
    }) {
        return (
            <Provider store={store}>
                <IntlProvider {...getIntlOptions()}>
                    <BackendProvider backend={testBackend}>
                        <WorkspaceProvider workspace="workspace">
                            <UiResizableSidebarProvider value={sidebarState ?? STATIC_CATALOG_SIDEBAR}>
                                <AdSlotsProvider value={slots}>{children}</AdSlotsProvider>
                            </UiResizableSidebarProvider>
                        </WorkspaceProvider>
                    </BackendProvider>
                </IntlProvider>
            </Provider>
        );
    }

    const result = render(
        <Wrapper sidebarState={sidebar}>
            <EditorHeader />
        </Wrapper>,
    );
    const rerenderWithSidebar = (sidebarState: IUiResizableSidebarState) =>
        result.rerender(
            <Wrapper sidebarState={sidebarState}>
                <EditorHeader />
            </Wrapper>,
        );

    return { ...result, store, dispatched, rerenderWithSidebar };
}

const dispatchedTypes = (dispatched: UnknownAction[]) => dispatched.map((action) => action.type);

function setOverrides(values: Array<[unknown, unknown]>) {
    values.forEach(([selector, value]) => selectorOverrides.set(selector, value));
}

describe("EditorHeader", () => {
    beforeEach(() => {
        selectorOverrides.clear();
        getAccessList.mockClear();
        setOverrides([
            [isSaveVisible, true],
            [isSaveAsVisible, true],
            [isOptionsMenuEnabled, true],
            [isEmbedButtonVisible, false],
        ]);
    });

    describe("default controls", () => {
        it("renders the application title and the save buttons", () => {
            renderHeader();
            expect(document.querySelectorAll(".without-dataset-picker")).toHaveLength(1);
            expect(document.querySelectorAll(".s-adi-application-title")).toHaveLength(1);
            expect(document.querySelectorAll("button.s-save-button")).toHaveLength(1);
            expect(document.querySelectorAll("button.s-save-as-new-button")).toHaveLength(1);
        });

        it("leaves out the controls AD does not show", () => {
            setOverrides([
                [isSaveVisible, false],
                [isSaveAsVisible, false],
                [isOptionsMenuEnabled, false],
                [hiddenActions, ["clear", "undoRedo"]],
                [isOpenVisible, false],
            ]);
            renderHeader();
            expect(document.querySelectorAll(".s-save-button")).toHaveLength(0);
            expect(document.querySelectorAll(".s-save-as-new-button")).toHaveLength(0);
            expect(document.querySelectorAll(".s-options-button")).toHaveLength(0);
            expect(document.querySelectorAll(".s-reset-report")).toHaveLength(0);
            expect(document.querySelectorAll(".s-undo")).toHaveLength(0);
            expect(document.querySelectorAll(".s-report_select")).toHaveLength(0);
        });

        it.each([
            [true, 1],
            [false, 0],
        ])("renders Cancel when AD offers it: %s", (isVisible: boolean, count: number) => {
            setOverrides([[isCancelVisible, isVisible]]);
            renderHeader();
            expect(document.querySelectorAll(".s-cancel-edit-from-kd")).toHaveLength(count);
        });

        it("names the icon-only controls", () => {
            setOverrides([[isEmbedButtonVisible, true]]);
            renderHeader();
            expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Redo" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Embed" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "More options" })).toBeInTheDocument();
        });

        it("renders the title, the unsaved changes indicator and the dashboard usages", () => {
            setOverrides([
                [
                    reportTitleSelector,
                    {
                        currentTitle: "foo",
                        currentDescription: "",
                        isTitleDefined: true,
                        isReportLocked: false,
                        canEditTitle: true,
                        isEnabledUsages: true,
                        hasUnsavedChanges: true,
                    },
                ],
                [isEnabledInsightUsageOnDashboards, true],
            ]);
            renderHeader();
            expect(document.querySelector("div.s-report-title").textContent).toEqual("foo");
            expect(document.querySelectorAll(".unsaved-notification")).toHaveLength(1);
            expect(document.querySelectorAll(".s-gd-insight-usage-on-dashboards")).toHaveLength(1);
        });
    });

    describe("EditorHeader slot", () => {
        function Decorated({ Default, defaultProps }: ISlotProps<IAnalyticalDesignerEditorHeaderProps>) {
            return (
                <>
                    <div data-testid="banner" />
                    <Default {...defaultProps} />
                    <div data-testid="footer" />
                </>
            );
        }

        it("adds content above and below the default header", () => {
            renderHeader({ slots: { EditorHeader: Decorated } });
            expect(screen.getByTestId("banner")).toBeInTheDocument();
            expect(screen.getByTestId("footer")).toBeInTheDocument();
            expect(document.querySelectorAll(".adi-editor-header-row")).toHaveLength(1);
        });

        it("keeps the catalog restore control when the header content is hidden", () => {
            renderHeader({
                slots: { EditorHeader: () => null },
                sidebar: { ...STATIC_CATALOG_SIDEBAR, canCollapse: true, isCollapsed: true },
            });
            expect(document.querySelectorAll(".adi-editor-header-row")).toHaveLength(0);
            expect(document.querySelectorAll(".adi-catalog-sidebar-restore")).toHaveLength(1);
        });

        it("tells the layout mode", () => {
            const modes: string[] = [];
            function Probe({ Default, defaultProps }: ISlotProps<IAnalyticalDesignerEditorHeaderProps>) {
                modes.push(defaultProps.layout.mode);
                return <Default {...defaultProps} />;
            }
            renderHeader({
                slots: { EditorHeader: Probe },
                sidebar: { ...STATIC_CATALOG_SIDEBAR, canCollapse: true },
            });
            expect(modes.at(-1)).toBe("catalogSidebar");
        });

        it("keeps slot components mounted when the layout changes", () => {
            let mounts = 0;
            function Counter({
                Default,
                defaultProps,
            }: ISlotProps<IAnalyticalDesignerVisualizationInfoProps>) {
                const [value] = useState("kept");
                useEffect(() => {
                    mounts++;
                }, []);
                return (
                    <>
                        <span data-testid="local-state">{value}</span>
                        <Default {...defaultProps} />
                    </>
                );
            }
            const sidebar = { ...STATIC_CATALOG_SIDEBAR, canCollapse: true };
            const { rerenderWithSidebar } = renderHeader({ slots: { VisualizationInfo: Counter }, sidebar });

            rerenderWithSidebar({ ...sidebar, isCollapsed: true });
            rerenderWithSidebar({ ...sidebar, isCollapsed: false, width: 400 });

            expect(mounts).toBe(1);
            expect(screen.getByTestId("local-state").textContent).toBe("kept");
        });
    });

    describe("VisualizationInfo slot", () => {
        function WithBack({ Default, defaultProps }: ISlotProps<IAnalyticalDesignerVisualizationInfoProps>) {
            return (
                <>
                    <button disabled={defaultProps.isNavigationDisabled} onClick={defaultProps.onRequestBack}>
                        Back
                    </button>
                    <Default {...defaultProps} />
                </>
            );
        }

        it("puts Back before the title, in the information region", () => {
            renderHeader({ slots: { VisualizationInfo: WithBack } });
            const back = screen.getByRole("button", { name: "Back" });
            expect(back.closest(".left-actions-wrapper")).toBeTruthy();
            expect(back.nextElementSibling).toHaveClass("report-title-wrapper");
        });

        it("requests the cancellation flow, not a navigation", () => {
            const { dispatched } = renderHeader({ slots: { VisualizationInfo: WithBack } });
            fireEvent.click(screen.getByRole("button", { name: "Back" }));
            expect(dispatchedTypes(dispatched)).toEqual([cancelEditFromKDAction().type]);
        });

        it("refuses Back while the visualization is being saved", () => {
            let props: IAnalyticalDesignerVisualizationInfoProps;
            function Capture(slotProps: ISlotProps<IAnalyticalDesignerVisualizationInfoProps>): null {
                props = slotProps.defaultProps;
                return null;
            }
            const { dispatched } = renderHeader({
                slots: { VisualizationInfo: Capture },
                prepareState: (state) => withReport(state, { saving: true }),
            });

            expect(props.isNavigationDisabled).toBe(true);
            act(() => props.onRequestBack());
            expect(dispatched).toHaveLength(0);
        });
    });

    describe("leaf slots", () => {
        it("lets a host undo with its own control", () => {
            function MyUndoRedo({ defaultProps }: ISlotProps<IAnalyticalDesignerUndoRedoProps>) {
                return (
                    <>
                        <button disabled={defaultProps.isUndoDisabled} onClick={defaultProps.onUndo}>
                            my undo
                        </button>
                        <button onClick={defaultProps.onRedo}>my redo</button>
                    </>
                );
            }
            const { dispatched } = renderHeader({
                slots: { UndoRedo: MyUndoRedo },
                prepareState: (state) =>
                    withRoot(state, {
                        timeTravel: {
                            past: [{ state: {} as ITimeTravelEntry["state"], actionType: "x" }],
                            future: [],
                        },
                    }),
            });

            expect(document.querySelectorAll(".s-undo")).toHaveLength(0);
            fireEvent.click(screen.getByText("my undo"));
            // there is nothing to redo, so the guarded callback refuses it
            fireEvent.click(screen.getByText("my redo"));
            expect(dispatchedTypes(dispatched)).toEqual([undo().type]);
        });

        it("relabels Clear through the default and keeps its guard", () => {
            let props: IAnalyticalDesignerClearProps;
            function Relabeled({ Default, defaultProps }: ISlotProps<IAnalyticalDesignerClearProps>) {
                props = defaultProps;
                return <Default {...defaultProps} label="Reset visualization" />;
            }
            const { dispatched } = renderHeader({ slots: { Clear: Relabeled } });

            expect(document.querySelector(".s-reset-report").textContent).toBe("Reset visualization");
            // an empty visualization has nothing to clear
            expect(props.isDisabled).toBe(true);
            act(() => props.onClear());
            expect(dispatchedTypes(dispatched)).not.toContain(resetApplication().type);
        });

        it("replaces Save with a host control that uses the current label and state", () => {
            function MySave({ defaultProps }: ISlotProps<IAnalyticalDesignerSaveProps>) {
                return (
                    <button
                        data-testid="my-save"
                        data-saving={defaultProps.isSaving}
                        onClick={defaultProps.onSave}
                    >
                        {defaultProps.label}
                    </button>
                );
            }
            const { dispatched } = renderHeader({
                slots: { Save: MySave },
                prepareState: (state) => withReport(state, { saving: true }),
            });

            const button = screen.getByTestId("my-save");
            expect(document.querySelectorAll(".s-save-button")).toHaveLength(0);
            expect(button.textContent).toBe("Saving…");
            expect(button).toHaveAttribute("data-saving", "true");
            fireEvent.click(button);
            expect(dispatchedTypes(dispatched)).not.toContain(ActionTypeKeys.SAVE_REPORT_CHECK);
        });

        it("hides Embed when its slot renders nothing", () => {
            setOverrides([[isEmbedButtonVisible, true]]);
            renderHeader({ slots: { Embed: () => null } });
            expect(document.querySelectorAll("[data-testid='s-embed-button']")).toHaveLength(0);
        });

        it("replaces Open together with its picker", () => {
            let props: IAnalyticalDesignerOpenProps;
            function MyOpen({ defaultProps }: ISlotProps<IAnalyticalDesignerOpenProps>) {
                props = defaultProps;
                return <button>{defaultProps.label}</button>;
            }
            const { dispatched } = renderHeader({ slots: { Open: MyOpen } });

            expect(screen.queryByTestId("mock-visualizations-dropdown")).not.toBeInTheDocument();
            expect(props.pickerVariant).toBe("dropdown");
            act(() => props.onOpenInsight(idRef("other", "insight")));
            expect(dispatched).toEqual([openReport(idRef("other", "insight"), false)]);
        });

        it("refuses to open a visualization while one is being opened", () => {
            let props: IAnalyticalDesignerOpenProps;
            function MyOpen({ defaultProps }: ISlotProps<IAnalyticalDesignerOpenProps>): null {
                props = defaultProps;
                return null;
            }
            const { dispatched } = renderHeader({
                slots: { Open: MyOpen },
                prepareState: (state) => withReport(state, { opening: true }),
            });

            expect(props.isDisabled).toBe(true);
            act(() => props.onOpenInsight(idRef("other", "insight")));
            expect(dispatched).toHaveLength(0);
        });

        it("renders filtered and relabeled options without an orphaned section", () => {
            setOverrides([
                [isEnableTimezoneChange, true],
                [getExportVisible, true],
                [supportsExportToXlsx, true],
                [getIsExportXLSXDisabled, false],
            ]);
            function MyOptions({ Default, defaultProps }: ISlotProps<IAnalyticalDesignerOptionsProps>) {
                const items = defaultProps.items
                    // keep the export section but none of its actions
                    .filter((item) => item.type !== "action" || !item.id.startsWith("export"))
                    .map((item): AnalyticalDesignerOptionsItem =>
                        item.type === "action" && item.id === "changeTimezone"
                            ? { ...item, label: "Pick a zone" }
                            : item,
                    );
                return <Default {...defaultProps} items={items} />;
            }
            renderHeader({ slots: { Options: MyOptions } });

            fireEvent.click(screen.getByRole("button", { name: "More options" }));
            expect(screen.getByText("Pick a zone")).toBeInTheDocument();
            expect(screen.queryByText("Export data")).not.toBeInTheDocument();
            expect(
                document.querySelectorAll(".s-gd-export-menu-overlay .gd-list-item-separator"),
            ).toHaveLength(0);
        });
    });

    describe("VisualizationAccess slot", () => {
        it("renders a host control where the built-in sharing is unavailable", () => {
            let props: IAnalyticalDesignerVisualizationAccessProps;
            function Workspace({ defaultProps }: ISlotProps<IAnalyticalDesignerVisualizationAccessProps>) {
                props = defaultProps;
                return <span data-testid="host-access">Workspace</span>;
            }
            setOverrides([[canManageInsightAccess, false]]);
            renderHeader({ slots: { VisualizationAccess: Workspace } });

            expect(screen.getByTestId("host-access")).toBeInTheDocument();
            expect(props.isDefaultAvailable).toBe(false);
            expect(document.querySelectorAll(".insight-access")).toHaveLength(0);
        });

        it("reads the access level only when requested", () => {
            const target = { kind: "insight", ref: idRef("bars", "insight") } as const;
            setOverrides([
                [canManageInsightAccess, true],
                [insightAccessTarget, target],
            ]);
            renderHeader({ slots: { VisualizationAccess: () => <span>Workspace</span> } });
            expect(getAccessList).not.toHaveBeenCalled();

            function Requesting({
                defaultProps,
            }: ISlotProps<IAnalyticalDesignerVisualizationAccessProps>): null {
                useEffect(() => defaultProps.onRequestAccessSummary(), [defaultProps]);
                return null;
            }
            renderHeader({ slots: { VisualizationAccess: Requesting } });
            expect(getAccessList).toHaveBeenCalledTimes(1);
            expect(getAccessList).toHaveBeenCalledWith(target);
        });
    });
});
