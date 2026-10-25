// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { initialState } from "../reducers/initial_state.js";
import { type IDialogsState, dialogsInitialState } from "../store/dialogs/dialogs_state.js";
import { withAppState } from "../tests/state_builder.test.helpers.js";

import {
    deleteReportDialogSelector,
    openReportDialogSelector,
    saveReportDialogSelector,
} from "./dialogs_selector.js";

const withDialogs = (dialogs: Partial<IDialogsState>) =>
    withAppState(initialState, { dialogs: { ...dialogsInitialState, ...dialogs } });

describe("dialogs selectors", () => {
    it("should return openReportDialog flag false if open report dialog is not active", () => {
        expect(openReportDialogSelector(initialState).openReportDialog).toEqual({
            active: false,
            data: null,
        });
    });

    it("should return saving untitled dialog when no title present", () => {
        const updatedState = withDialogs({
            savingUntitledReport: { active: true, data: { saveAsNew: true } },
        });
        expect(saveReportDialogSelector(updatedState).savingUntitledReportDialog).toEqual({
            active: true,
            data: { saveAsNew: true },
        });
    });

    it("should return deleteReportDialog flag false if delete report dialog is not active", () => {
        expect(deleteReportDialogSelector(initialState).deleteReportDialog).toEqual({
            active: false,
            data: null,
        });
    });
});
