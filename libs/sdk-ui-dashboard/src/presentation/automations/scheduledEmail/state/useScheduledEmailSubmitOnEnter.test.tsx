// (C) 2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../contexts/AutomationsContext.js";
import { AUTOMATIONS_CONTEXT } from "../tests/scheduledEmail.test.helpers.js";

import { type IScheduledExportDialogValidity } from "./types.js";
import { useScheduledEmailSubmitOnEnter } from "./useScheduledEmailSubmitOnEnter.js";

vi.hoisted(() => {
    vi.resetModules();
});

// The guard's validity input is the hook's own contract; the form rules behind it have their own suite.
const { mockUseScheduledExportDialogValidity } = vi.hoisted(() => ({
    mockUseScheduledExportDialogValidity: vi.fn(),
}));

vi.mock("./useScheduledExportDialogValidity.js", () => ({
    useScheduledExportDialogValidity: mockUseScheduledExportDialogValidity,
}));

const VALID: IScheduledExportDialogValidity = {
    isSubmitDisabled: false,
    validationErrorMessage: undefined,
    isParentValid: true,
    allowExternalRecipients: true,
    allowOnlyLoggedUserRecipients: false,
};

beforeEach(() => {
    vi.clearAllMocks();
    mockUseScheduledExportDialogValidity.mockReturnValue(VALID);
});

function Probe({ onSubmit, isSaving }: { onSubmit: () => void; isSaving: boolean }) {
    const onKeyDown = useScheduledEmailSubmitOnEnter({ onSubmit, isSaving });
    return <input data-testid="probe" onKeyDown={onKeyDown} />;
}

function renderProbe(
    props: { onSubmit: () => void; isSaving: boolean },
    automationsContext: IAutomationsContextValue = AUTOMATIONS_CONTEXT,
) {
    const view = render(
        <AutomationsContextProvider value={automationsContext}>
            <Probe {...props} />
        </AutomationsContextProvider>,
    );
    return view.getByTestId("probe");
}

describe("useScheduledEmailSubmitOnEnter", () => {
    it("submits on Enter when the submit button would be enabled", () => {
        const onSubmit = vi.fn();
        fireEvent.keyDown(renderProbe({ onSubmit, isSaving: false }), { key: "Enter" });
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("ignores other keys", () => {
        const onSubmit = vi.fn();
        fireEvent.keyDown(renderProbe({ onSubmit, isSaving: false }), { key: "a" });
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("does nothing while a save is in flight", () => {
        const onSubmit = vi.fn();
        fireEvent.keyDown(renderProbe({ onSubmit, isSaving: true }), { key: "Enter" });
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("does nothing while the form is invalid", () => {
        mockUseScheduledExportDialogValidity.mockReturnValue({ ...VALID, isSubmitDisabled: true });
        const onSubmit = vi.fn();
        fireEvent.keyDown(renderProbe({ onSubmit, isSaving: false }), { key: "Enter" });
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("does nothing in execution-timestamp mode", () => {
        const onSubmit = vi.fn();
        fireEvent.keyDown(
            renderProbe(
                { onSubmit, isSaving: false },
                { ...AUTOMATIONS_CONTEXT, isExecutionTimestampMode: true },
            ),
            { key: "Enter" },
        );
        expect(onSubmit).not.toHaveBeenCalled();
    });
});
