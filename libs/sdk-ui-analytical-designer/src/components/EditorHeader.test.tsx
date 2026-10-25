// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    displayedActions,
    hiddenActions,
    isEditorHeaderResetDisabled,
    isEmbedButtonVisible,
    isOptionsMenuEnabled,
    isRedoDisabled,
    isSaveAsVisible,
    isSaveVisible,
    isUndoDisabled,
} from "../selectors/editor_header_selector.js";
import { enableEnhancedInsightPicker } from "../selectors/feature_flag_selector.js";
import { reportDescriptionSelector } from "../selectors/report_description_selector.js";
import { reportTitleSelector } from "../selectors/report_title_selector.js";
import { isEditFromKD, isExploreFromKD } from "../selectors/route_selector.js";
import { type IAppState } from "../store/types.js";
import {
    setupAppStateWithDateDatasetMeta,
    tableVisualizationClass,
} from "../tests/constants.test.helpers.js";
import { withData, withRoot } from "../tests/state_builder.test.helpers.js";
import { withIntl } from "../utils/with_intl.js";
import { withRedux } from "../utils/with_redux.js";

import { EditorHeader } from "./EditorHeader.js";

vi.hoisted(() => {
    vi.resetModules();
});

const useSelectorMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: unknown) => useSelectorMock(selector),
    };
});

vi.mock("./header/VisualizationsDropdown", () => {
    function VisualizationsDropdown() {
        return <div data-testid="mock-visualizations-dropdown" />;
    }
    return {
        __esModule: true,
        VisualizationsDropdown,
    };
});

interface IEditorHeaderSelectorValues {
    isUndoDisabled: boolean;
    isRedoDisabled: boolean;
    isResetDisabled: boolean;
    isOptionsMenuEnabled: boolean;
    isEditFromKD: boolean;
    isEnhancedInsightPickerEnabled: boolean;
    isExploreFromKD: boolean;
    hiddenActions: string[];
    displayedActions: string[];
    isSaveVisible: boolean;
    isSaveAsVisible: boolean;
    isEmbedButtonVisible: boolean;
}

describe("EditorHeader", () => {
    function setupAppState(state: IAppState) {
        const updatedState = withRoot(state, { projectId: "my project" });

        const changedState = withData(updatedState, { visualizationClass: tableVisualizationClass });

        return setupAppStateWithDateDatasetMeta(changedState);
    }

    function setSelectorValues(userValues: Partial<IEditorHeaderSelectorValues>) {
        const values: IEditorHeaderSelectorValues = {
            isUndoDisabled: true,
            isRedoDisabled: true,
            isResetDisabled: true,
            isEditFromKD: false,
            isExploreFromKD: false,
            hiddenActions: [],
            displayedActions: [],
            isOptionsMenuEnabled: true,
            isSaveVisible: true,
            isSaveAsVisible: true,
            isEmbedButtonVisible: false,
            isEnhancedInsightPickerEnabled: false,
            ...userValues,
        };

        const valueBySelector = new Map<unknown, unknown>([
            [isUndoDisabled, values.isUndoDisabled],
            [isRedoDisabled, values.isRedoDisabled],
            [isEditorHeaderResetDisabled, values.isResetDisabled],
            [isOptionsMenuEnabled, values.isOptionsMenuEnabled],
            [isEditFromKD, values.isEditFromKD],
            [isExploreFromKD, values.isExploreFromKD],
            [hiddenActions, values.hiddenActions],
            [displayedActions, values.displayedActions],
            [isSaveVisible, values.isSaveVisible],
            [isSaveAsVisible, values.isSaveAsVisible],
            [isEmbedButtonVisible, values.isEmbedButtonVisible],
            [enableEnhancedInsightPicker, values.isEnhancedInsightPickerEnabled],
            // the nested ReportDescription reads the store through the mocked useSelector as well
            [reportDescriptionSelector, { currentDescription: "", filters: [], separators: undefined }],
            // ... and so does the nested ReportTitle
            [
                reportTitleSelector,
                {
                    currentTitle: "",
                    currentDescription: "",
                    isTitleDefined: false,
                    isReportLocked: false,
                    canEditTitle: true,
                    isEnabledUsages: false,
                    isSaveDisabled: false,
                },
            ],
        ]);

        useSelectorMock.mockImplementation((selector: unknown) => valueBySelector.get(selector));
    }

    function renderComponent(
        userValues: Partial<IEditorHeaderSelectorValues> = {},
        prepareStateFunction = setupAppState,
    ) {
        setSelectorValues(userValues);
        const Wrapped = withRedux(withIntl(EditorHeader), prepareStateFunction);

        return render(<Wrapped />);
    }

    beforeEach(() => {
        useSelectorMock.mockReset();
    });

    describe("Wrapper", () => {
        it("should have 'without-dataset-picker' class", () => {
            renderComponent();
            expect(document.querySelectorAll(".without-dataset-picker")).toHaveLength(1);
            expect(document.querySelector(".adi-editor-header")).not.toHaveAttribute("title");
        });

        it("should not contain SaveReportButton", () => {
            renderComponent({
                isSaveVisible: false,
            });
            expect(document.querySelectorAll("button.s-save-button")).toHaveLength(0);
        });

        it("should contain SaveReportButton", () => {
            renderComponent({
                isSaveVisible: true,
            });
            expect(document.querySelectorAll("button.s-save-button")).toHaveLength(1);
        });

        it("should contain both save and save as new buttons", () => {
            renderComponent({
                isSaveVisible: true,
                isSaveAsVisible: true,
            });
            expect(document.querySelectorAll("button.s-save-button")).toHaveLength(1);
            expect(document.querySelectorAll("button.s-save-as-new-button")).toHaveLength(1);
        });
    });

    describe("Application title", () => {
        it("should contain title", () => {
            renderComponent();
            expect(document.querySelectorAll(".s-adi-application-title")).toHaveLength(1);
        });
    });

    describe("Save as new button", () => {
        it("shouldn't contain save as new button", () => {
            renderComponent({
                isSaveAsVisible: false,
            });
            expect(document.querySelectorAll(".s-save-as-new-button")).toHaveLength(0);
        });

        it("should contain save as new button", () => {
            renderComponent({
                isSaveAsVisible: true,
            });
            expect(document.querySelector(".s-save-as-new-button")).toBeDefined();
        });
    });

    describe("Open as report button", () => {
        it("should contain open as report button if isOpenAsReportVisible is true", () => {
            renderComponent();
            expect(document.querySelector(".s-open_as_report")).toBeDefined();
        });
    });

    describe("Options button", () => {
        it.each([
            [
                "shouldn't contain Option button if isOptionsMenuEnabled is false",
                { isOpenAsReportVisible: false, isOptionsMenuEnabled: false },
                0,
            ],
            [
                "should contain Option button if isOptionsMenuEnabled is true",
                { isOptionsMenuEnabled: true },
                1,
            ],
        ])("%s", (_status: string, values: Partial<IEditorHeaderSelectorValues>, length: number) => {
            renderComponent(values);
            expect(document.querySelectorAll(".s-options-button")).toHaveLength(length);
        });
    });

    describe("clear button", () => {
        it("should hide clear button when hiddenActions include clear", () => {
            renderComponent({
                hiddenActions: ["clear"],
            });
            expect(document.querySelectorAll(".s-reset-report")).toHaveLength(0);
        });
    });

    describe("undo redo button", () => {
        it("should hide undo redo button when hiddenActions include undoRedo", () => {
            renderComponent({
                hiddenActions: ["undoRedo"],
            });
            expect(document.querySelectorAll(".s-undo")).toHaveLength(0);
            expect(document.querySelectorAll(".s-redo")).toHaveLength(0);
        });
    });

    describe("open dropdown", () => {
        it("should hide Open dropdown when hiddenActions include clear", () => {
            renderComponent({
                hiddenActions: ["open"],
            });
            expect(document.querySelectorAll(".s-report_select")).toHaveLength(0);
        });

        it("should hide Open dropdown when isExploreFromKD is true", () => {
            renderComponent({
                isExploreFromKD: true,
            });
            expect(document.querySelectorAll(".s-report_select")).toHaveLength(0);
        });
    });

    describe("cancel button", () => {
        it.each([
            ["isEditFromKD is true", true, false, []],
            ["isExploreFromKD is true", false, true, []],
            ["displayedActions includes Cancel", false, false, ["cancel"]],
        ])(
            "should show Cancel button when %s",
            (_title: string, isEditFromKD: boolean, isExploreFromKD: boolean, displayedActions: string[]) => {
                renderComponent({
                    isEditFromKD,
                    isExploreFromKD,
                    displayedActions,
                });
                expect(document.querySelector(".s-cancel-edit-from-kd")).toBeInTheDocument();
            },
        );

        it("should not display Cancel button when it is not from KD and Cancel is not included in displayedActions", () => {
            renderComponent({
                isEditFromKD: false,
                isExploreFromKD: false,
                displayedActions: [],
            });
            expect(document.querySelector(".s-cancel-edit-from-kd")).not.toBeInTheDocument();
        });
    });
});
