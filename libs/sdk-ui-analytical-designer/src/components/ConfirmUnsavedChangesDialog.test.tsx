// (C) 2020-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createLeaveAnywayButtonClickedAction } from "../actions/confirm_unsaved_changes_actions.js";
import { hideConfirmUnsavedChangesDialog } from "../actions/dialogs_actions.js";
import { saveReportCheck } from "../actions/save_actions.js";
import { type confirmUnsavedChangesDialogSelector } from "../selectors/confirm_unsaved_changes_dialog_selector.js";
import { withIntl } from "../utils/with_intl.js";
import { withRedux } from "../utils/with_redux.js";

import { ConfirmUnsavedChangesDialog } from "./ConfirmUnsavedChangesDialog.js";

type DialogState = ReturnType<typeof confirmUnsavedChangesDialogSelector>;

vi.hoisted(() => {
    vi.resetModules();
});

const useSelectorMock = vi.hoisted(() => vi.fn());
const dispatchMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: unknown) => useSelectorMock(selector),
        useDispatch: () => dispatchMock,
    };
});

describe("confirm unsaved changes dialog", () => {
    const defaultState: DialogState = {
        visible: false,
        isSavedReport: false,
        isSaveDisabled: false,
        data: {},
        canSaveReport: true,
        isMetricEditorUnsaved: false,
    };

    beforeEach(() => {
        useSelectorMock.mockReset();
        dispatchMock.mockReset();
    });

    function renderComponent(state: Partial<DialogState>) {
        useSelectorMock.mockImplementation(() => ({ ...defaultState, ...state }));
        const Wrapped = withRedux(withIntl(ConfirmUnsavedChangesDialog));
        return render(<Wrapped />);
    }

    it.each([
        ["should not", false, 0],
        ["should", true, 1],
    ])("%s display unsaved changes dialog", (_s: string, visible: boolean, expected: number) => {
        renderComponent({ visible });
        expect(document.querySelectorAll(".gd-dialog.s-unsave-change-confirmation-dialog")).toHaveLength(
            expected,
        );
    });

    it("should close unsaved changes dialog", () => {
        renderComponent({ visible: true });
        const unsavedChangesDialog = document.querySelector(".gd-dialog.s-unsave-change-confirmation-dialog");
        const closeButton = unsavedChangesDialog.querySelector("button.gd-icon-cross");
        fireEvent.click(closeButton);

        expect(dispatchMock).toBeCalledWith(hideConfirmUnsavedChangesDialog());
    });

    it("should dismiss the dialog and keep the unsaved changes when user presses Escape", () => {
        renderComponent({ visible: true });
        const unsavedChangesDialog = document.querySelector(".gd-dialog.s-unsave-change-confirmation-dialog");
        fireEvent.keyDown(unsavedChangesDialog, { key: "Escape" });

        expect(dispatchMock).toBeCalledWith(hideConfirmUnsavedChangesDialog());
        expect(dispatchMock).not.toBeCalledWith(createLeaveAnywayButtonClickedAction({}));
    });

    it("should go to page when user click on leave anyway button", () => {
        renderComponent({
            visible: true,
            data: {
                goToPage: "/#s=/gdc/projects/pid|dataPage|",
            },
        });
        const unsavedChangesDialog = document.querySelector(".gd-dialog.s-unsave-change-confirmation-dialog");
        const leaveAwayButton = unsavedChangesDialog.querySelector("button.s-leave_anyway");
        fireEvent.click(leaveAwayButton);

        expect(dispatchMock).toBeCalledWith(
            createLeaveAnywayButtonClickedAction({
                goToPage: "/#s=/gdc/projects/pid|dataPage|",
            }),
        );
    });

    it.each([
        ["should", true, true],
        ["should not", false, false],
    ])("%s disable save button", (_s: string, isSaveDisabled: boolean, expected: boolean) => {
        renderComponent({ visible: true, isSaveDisabled });
        const unsavedChangesDialog = document.querySelector(".gd-dialog.s-unsave-change-confirmation-dialog");
        const saveButton = unsavedChangesDialog.querySelector("button.s-save");

        expect(saveButton.classList.contains("disabled")).toBe(expected);
    });

    it("should dispatch saveReportCheck with false when user click on save button", () => {
        renderComponent({
            visible: true,
            isSavedReport: true,
            isSaveDisabled: false,
        });
        const unsavedChangesDialog = document.querySelector(".gd-dialog.s-unsave-change-confirmation-dialog");
        const saveButton = unsavedChangesDialog.querySelector(".s-save");
        fireEvent.click(saveButton);

        expect(dispatchMock).toBeCalledWith(saveReportCheck(false));
    });

    it("should dispatch saveReportCheck with true when user click on save as new button", () => {
        renderComponent({
            visible: true,
            isSavedReport: true,
            isSaveDisabled: false,
            canSaveReport: false,
        });
        const unsavedChangesDialog = document.querySelector(".gd-dialog.s-unsave-change-confirmation-dialog");
        const saveButton = unsavedChangesDialog.querySelector("button.s-save_as_new");
        fireEvent.click(saveButton);

        expect(dispatchMock).toBeCalledWith(saveReportCheck(true));
    });
});
