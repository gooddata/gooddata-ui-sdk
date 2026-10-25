// (C) 2007-2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { hideDialog } from "../actions/dialogs_actions.js";
import { openReport } from "../actions/open_actions.js";
import { openReportDialogSelector } from "../selectors/dialogs_selector.js";
import { mockIntlProp } from "../utils/with_intl.js";

import { createRendererFor, dialogClickCancel, dialogClickSubmit } from "./dialog_utils.js";
import { OpenReportDialog } from "./OpenReportDialog.js";

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

describe("OpenReportDialog", () => {
    const render = createRendererFor(OpenReportDialog);
    const intl = mockIntlProp();
    const insightRef = idRef("insight-id", "insight");

    const setOpenReportDialog = (openReportDialog: { active: boolean; data: ReturnType<typeof idRef> }) => {
        useSelectorMock.mockImplementation((selector: unknown) =>
            selector === openReportDialogSelector ? { openReportDialog } : undefined,
        );
    };

    it("should handle confirm click", () => {
        dispatchMock.mockReset();
        setOpenReportDialog({ active: true, data: insightRef });

        const dialog = render({ intl });

        dialogClickSubmit(dialog.container);

        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith(openReport(insightRef, true));
    });

    it("should handle cancel click", () => {
        dispatchMock.mockReset();
        setOpenReportDialog({ active: true, data: insightRef });

        const dialog = render({ intl });

        dialogClickCancel(dialog.container);

        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith(hideDialog());
    });
});
