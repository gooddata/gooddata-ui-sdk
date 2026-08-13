// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()).
//
// The wrapped hook is mocked so this file asserts the threading, not the validation rules -
// those have their own test. The two dialog contexts are supplied by their real providers.
// ---------------------------------------------------------------------------

const { mockUseScheduledEmailFormValidity } = vi.hoisted(() => ({
    mockUseScheduledEmailFormValidity: vi.fn(),
}));

vi.mock("../useScheduledEmailFormValidity.js", () => ({
    useScheduledEmailFormValidity: mockUseScheduledEmailFormValidity,
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../../contexts/AutomationsContext.js";
import {
    type IScheduledEmailDialogContextValue,
    ScheduledEmailDialogContextProvider,
} from "../../../contexts/ScheduledEmailDialogContext.js";
import { ScheduledExportDataContextProvider } from "../ScheduledExportDataContext.js";
import { ScheduledExportDraftContextProvider } from "../ScheduledExportDraftContext.js";
import { useScheduledExportDialogValidity } from "../useScheduledExportDialogValidity.js";

import {
    AUTOMATIONS_CONTEXT,
    DATA_FIXTURE,
    DRAFT_FIXTURE,
    SCHEDULED_EMAIL_DIALOG_CONTEXT,
} from "./fixtures.js";

const VALIDITY_RESULT = {
    isSubmitDisabled: true,
    validationErrorMessage: "the widget is gone",
    isParentValid: false,
    allowExternalRecipients: true,
    allowOnlyLoggedUserRecipients: false,
};

beforeEach(() => {
    vi.clearAllMocks();
    mockUseScheduledEmailFormValidity.mockReturnValue(VALIDITY_RESULT);
});

function renderValidityHook(
    dialogOverrides: Partial<IScheduledEmailDialogContextValue> = {},
    automationsOverrides: Partial<IAutomationsContextValue> = {},
) {
    function wrapper({ children }: PropsWithChildren) {
        return (
            <AutomationsContextProvider value={{ ...AUTOMATIONS_CONTEXT, ...automationsOverrides }}>
                <ScheduledEmailDialogContextProvider
                    value={{ ...SCHEDULED_EMAIL_DIALOG_CONTEXT, ...dialogOverrides }}
                >
                    <ScheduledExportDraftContextProvider value={DRAFT_FIXTURE}>
                        <ScheduledExportDataContextProvider value={DATA_FIXTURE}>
                            {children}
                        </ScheduledExportDataContextProvider>
                    </ScheduledExportDraftContextProvider>
                </ScheduledEmailDialogContextProvider>
            </AutomationsContextProvider>
        );
    }

    return renderHook(() => useScheduledExportDialogValidity(), { wrapper });
}

describe("useScheduledExportDialogValidity", () => {
    it("threads the draft, data and dialog-context values into useScheduledEmailFormValidity", () => {
        const scheduledExportToEdit = { title: "saved" } as IAutomationMetadataObject;

        renderValidityHook({ scheduledExportToEdit });

        // Every threaded input is asserted: four of them are booleans of the same type, so a
        // mis-sourced pair would type-check and silently change the submit gate.
        expect(mockUseScheduledEmailFormValidity).toHaveBeenCalledWith({
            editedAutomation: DRAFT_FIXTURE.editedAutomation,
            originalAutomation: DRAFT_FIXTURE.originalAutomation,
            isCronValid: DRAFT_FIXTURE.isCronValid,
            isTitleValid: DRAFT_FIXTURE.isTitleValid,
            isSubjectValid: DRAFT_FIXTURE.isSubjectValid,
            isOnMessageValid: DRAFT_FIXTURE.isOnMessageValid,
            defaultRecipient: DATA_FIXTURE.defaultRecipient,
            scheduledExportToEdit,
            notificationChannels: SCHEDULED_EMAIL_DIALOG_CONTEXT.notificationChannels,
            maxAutomationsRecipients: AUTOMATIONS_CONTEXT.maxAutomationsRecipients,
        });
    });

    it("reads maxAutomationsRecipients from the automations context rather than a prop", () => {
        renderValidityHook({}, { maxAutomationsRecipients: 42 });

        expect(mockUseScheduledEmailFormValidity).toHaveBeenCalledWith(
            expect.objectContaining({ maxAutomationsRecipients: 42 }),
        );
    });

    it("returns the validity hook's five members unchanged", () => {
        const { result } = renderValidityHook();

        expect(result.current).toEqual(VALIDITY_RESULT);
    });

    it("throws outside the draft provider, because the draft is what it validates", () => {
        function wrapper({ children }: PropsWithChildren) {
            return (
                <AutomationsContextProvider value={AUTOMATIONS_CONTEXT}>
                    <ScheduledEmailDialogContextProvider value={SCHEDULED_EMAIL_DIALOG_CONTEXT}>
                        {children}
                    </ScheduledEmailDialogContextProvider>
                </AutomationsContextProvider>
            );
        }

        expect(() => renderHook(() => useScheduledExportDialogValidity(), { wrapper })).toThrow(
            /useScheduledExportDraft must be used within ScheduledEmailDialogStateProvider/,
        );
    });
});
