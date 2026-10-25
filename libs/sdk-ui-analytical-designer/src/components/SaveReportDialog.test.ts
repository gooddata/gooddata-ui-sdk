// (C) 2007-2026 GoodData Corporation

import { fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { hideConfirmUnsavedChangesDialog, hideSaveReportDialog } from "../actions/dialogs_actions.js";
import { createEmbedDialogOpenAction } from "../actions/embed_dialog_actions.js";
import { reportTitleChange } from "../actions/report_actions.js";
import { saveReportRequested } from "../actions/save_actions.js";
import { type ISavingUntitledReportState } from "../store/dialogs/dialogs_state.js";

import {
    type IDialogRenderResult,
    createRendererFor,
    dialogClickCancel,
    dialogClickSubmit,
    dialogEnterSubmit,
    getDialogSubmitButton,
} from "./dialog_utils.js";
import { SaveReportDialog } from "./SaveReportDialog.js";

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

function getInput(dialog: Element): HTMLInputElement {
    return dialog.querySelector(".s-name-insight-dialog-input");
}

function setInput(dialog: Element, text: string) {
    fireEvent.change(getInput(dialog), { target: { value: text } });
}

function isSubmitDisabled(dialog: Element): boolean {
    return getDialogSubmitButton(dialog).getAttribute("aria-disabled") === "true";
}

describe("SaveReportDialog", () => {
    const renderer = createRendererFor(SaveReportDialog);

    const setDialogState = (savingUntitledReportDialog: ISavingUntitledReportState) => {
        useSelectorMock.mockImplementation(() => ({ savingUntitledReportDialog }));
    };

    const renderDialog = (savingUntitledReportDialog: ISavingUntitledReportState): IDialogRenderResult => {
        setDialogState(savingUntitledReportDialog);
        return renderer({});
    };

    let dialog: Element;

    beforeEach(() => {
        dispatchMock.mockClear();
        dialog = renderDialog({ active: true }).container;
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("should handle save click when title not empty", () => {
        setInput(dialog, "Test");

        dialogClickSubmit(dialog);

        expect(dispatchMock).toHaveBeenCalledWith(reportTitleChange("Test"));
        // The dialog is rendered without `data`, so the absent `saveAsNew` must normalize to `false`
        // rather than reach the store as `undefined`.
        expect(dispatchMock).toHaveBeenCalledWith(saveReportRequested(false, false, null, false));
    });

    it("should NOT handle save click when title empty", () => {
        dialogClickSubmit(dialog);

        expect(dispatchMock).not.toHaveBeenCalled();
    });

    it("should NOT be able to submit with enter when title empty", () => {
        dialogEnterSubmit(dialog);

        expect(dispatchMock).not.toHaveBeenCalled();
    });

    it("should be able to submit with enter when title not empty", () => {
        setInput(dialog, "Test");

        dialogEnterSubmit(dialog);

        expect(dispatchMock).toHaveBeenCalledWith(reportTitleChange("Test"));
    });

    it("should handle cancel click", () => {
        dialogClickCancel(dialog);

        expect(dispatchMock).toHaveBeenCalledWith(hideSaveReportDialog());
        expect(dispatchMock).toHaveBeenCalledWith(hideConfirmUnsavedChangesDialog());
    });

    it("should re-open the embed dialog when cancel button click", () => {
        dialog = renderDialog({ active: true, data: { reOpenEmbedDialog: true } }).container;

        dialogClickCancel(dialog);

        expect(dispatchMock).toHaveBeenCalledWith(createEmbedDialogOpenAction());
    });

    it("should send the re-open flag when submit the insight", () => {
        dialog = renderDialog({
            active: true,
            data: { saveAsNew: false, reOpenEmbedDialog: true },
        }).container;

        setInput(dialog, "Test");
        dialogClickSubmit(dialog);

        expect(dispatchMock).toHaveBeenCalledWith(saveReportRequested(false, false, null, true));
    });

    it("should keep the whitespace typed inside the title", () => {
        setInput(dialog, "Insight A");

        expect(getInput(dialog).value).toBe("Insight A");
    });

    it("should trim the title before saving it", () => {
        setInput(dialog, "  Insight A  ");

        dialogClickSubmit(dialog);

        expect(dispatchMock).toHaveBeenCalledWith(reportTitleChange("Insight A"));
    });

    it("should NOT handle save click when title is whitespace only", () => {
        setInput(dialog, "   ");

        expect(isSubmitDisabled(dialog)).toBe(true);

        dialogClickSubmit(dialog);

        expect(dispatchMock).not.toHaveBeenCalled();
    });

    it("should start empty when re-opened after a successful save", () => {
        const { container, rerenderSame } = renderDialog({ active: true, data: { saveAsNew: true } });

        setInput(container, "Insight A");
        dialogClickSubmit(container);
        expect(dispatchMock).toHaveBeenCalledWith(reportTitleChange("Insight A"));

        // the dialog hides and is opened again while the component stays mounted
        setDialogState({ active: false });
        rerenderSame();
        setDialogState({ active: true, data: { saveAsNew: true } });
        rerenderSame();
        dispatchMock.mockClear();

        expect(getInput(container).value).toBe("");
        expect(isSubmitDisabled(container)).toBe(true);

        dialogClickSubmit(container);

        expect(dispatchMock).not.toHaveBeenCalled();
    });

    it("should start empty when re-opened after a cancel", () => {
        const { container, rerenderSame } = renderDialog({ active: true });

        setInput(container, "Insight A");
        dialogClickCancel(container);

        setDialogState({ active: false });
        rerenderSame();
        setDialogState({ active: true });
        rerenderSame();

        expect(getInput(container).value).toBe("");
        expect(isSubmitDisabled(container)).toBe(true);
    });
});
