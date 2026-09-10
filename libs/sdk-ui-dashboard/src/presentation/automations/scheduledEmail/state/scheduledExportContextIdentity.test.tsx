// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IUser, idRef } from "@gooddata/sdk-model";

// ---------------------------------------------------------------------------
// Two-direction identity proof for the three scheduled-export state contexts converted to
// `useShallowStable` (draft, actions, data — the filters context already goes through
// `useShallowStable` inside `useScheduledEmailFiltersModel`, whose own return-identity tests are
// its regression net). A consumer-observed identity stays put across a rerender that moves
// nothing, and goes fresh the moment a real member changes.
//
// Same mocking rationale as `scheduledExportStateRenderCount.test.tsx`: only the staleness check
// is mocked, everything else runs for real.
// ---------------------------------------------------------------------------

vi.hoisted(() => {
    vi.resetModules();
});

const { mockUseValidateExistingAutomationFilters } = vi.hoisted(() => ({
    mockUseValidateExistingAutomationFilters: vi.fn<typeof useValidateExistingAutomationFilters>(),
}));

vi.mock("../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../contexts/AutomationsContext.js";
import { ScheduledEmailDialogContextProvider } from "../../contexts/ScheduledEmailDialogContext.js";
import { type useValidateExistingAutomationFilters } from "../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js";
import { AUTOMATIONS_CONTEXT, SCHEDULED_EMAIL_DIALOG_CONTEXT } from "../tests/scheduledEmail.test.helpers.js";
import { VALID_FILTERS_RESULT } from "../tests/scheduledEmailBlocks.test.helpers.js";

import { ScheduledEmailDialogStateProvider } from "./ScheduledEmailDialogStateProvider.js";
import { useScheduledExportActions } from "./ScheduledExportActionsContext.js";
import { useScheduledExportData } from "./ScheduledExportDataContext.js";
import { useScheduledExportDraft } from "./ScheduledExportDraftContext.js";
import {
    type IScheduledExportActionsContextValue,
    type IScheduledExportDataContextValue,
    type IScheduledExportDraftContextValue,
} from "./types.js";

// A different `currentUser` and `timezone` — the only props this suite ever varies across a
// rerender. `currentUser` reaches `formState.defaultUser`/`defaultRecipient` (data context);
// `timezone` reaches `onRecurrenceChange`'s dependency array (actions context). One prop change
// per test drives the fresh-direction proof without touching the draft at all.
const OTHER_USER: IUser = {
    ref: idRef("user-2"),
    login: "user2@example.com",
    email: "user2@example.com",
};
const OTHER_AUTOMATIONS_CONTEXT: IAutomationsContextValue = {
    ...AUTOMATIONS_CONTEXT,
    currentUser: OTHER_USER,
    timezone: "America/New_York",
};

beforeEach(() => {
    vi.clearAllMocks();
    mockUseValidateExistingAutomationFilters.mockReturnValue(VALID_FILTERS_RESULT);
});

function Wrapper({
    children,
    automationsContext = AUTOMATIONS_CONTEXT,
}: PropsWithChildren<{ automationsContext?: IAutomationsContextValue }>) {
    return (
        <IntlWrapper>
            <AutomationsContextProvider value={automationsContext}>
                <ScheduledEmailDialogContextProvider value={SCHEDULED_EMAIL_DIALOG_CONTEXT}>
                    <ScheduledEmailDialogStateProvider>{children}</ScheduledEmailDialogStateProvider>
                </ScheduledEmailDialogContextProvider>
            </AutomationsContextProvider>
        </IntlWrapper>
    );
}

// ---------------------------------------------------------------------------
// Capture components: each calls exactly one context hook and forwards the observed value on
// every render, so a test can compare the value across renders by reference.
// ---------------------------------------------------------------------------

function DraftCapture({ onValue }: { onValue: (v: IScheduledExportDraftContextValue) => void }) {
    onValue(useScheduledExportDraft());
    return null;
}

function ActionsCapture({ onValue }: { onValue: (v: IScheduledExportActionsContextValue) => void }) {
    onValue(useScheduledExportActions());
    return null;
}

function DataCapture({ onValue }: { onValue: (v: IScheduledExportDataContextValue) => void }) {
    onValue(useScheduledExportData());
    return null;
}

// Driver: fires one real member change through the actions context, the same way a consumer would.

function TitleEditor() {
    const { onTitleChange } = useScheduledExportActions();
    return (
        <button data-testid="edit-title" onClick={() => onTitleChange("changed-title")}>
            edit title
        </button>
    );
}

describe("scheduled-export context identity — draft", () => {
    // `startDate` is rebuilt by `toNormalizedStartDate` (a fresh `parseISO` `Date`) on every call
    // to `useScheduledEmailFormState`, uncorrelated with whether `editedAutomation` actually
    // changed — pre-existing, independent of `useShallowStable` vs. the prior `useMemo` (a `Date`
    // dependency fails `Object.is` on every render either way). It keeps the draft object itself
    // from surviving a no-op rerender, unlike every other alerting/scheduled-export context. The
    // other members are still held stable member-wise, which this asserts directly.
    it("keeps every member but startDate stable across a rerender that changes nothing", () => {
        const values: IScheduledExportDraftContextValue[] = [];
        const onValue = (v: IScheduledExportDraftContextValue) => values.push(v);

        const { rerender } = render(
            <Wrapper>
                <DraftCapture onValue={onValue} />
            </Wrapper>,
        );
        const first = values.at(-1)!;

        rerender(
            <Wrapper>
                <DraftCapture onValue={onValue} />
            </Wrapper>,
        );
        const second = values.at(-1)!;

        expect(second.editedAutomation).toBe(first.editedAutomation);
        expect(second.originalAutomation).toBe(first.originalAutomation);
        expect(second.isCronValid).toBe(first.isCronValid);
        expect(second.isTitleValid).toBe(first.isTitleValid);
        expect(second.isSubjectValid).toBe(first.isSubjectValid);
        expect(second.isOnMessageValid).toBe(first.isOnMessageValid);
        expect(second.isTimezoneFeatureEnabled).toBe(first.isTimezoneFeatureEnabled);
        expect(second.canSelectScheduleTimezone).toBe(first.canSelectScheduleTimezone);
        expect(second.scheduleTimezoneSelection).toBe(first.scheduleTimezoneSelection);
        expect(second.defaultResolvedTimezone).toBe(first.defaultResolvedTimezone);
        expect(second.scheduleTimezoneIsStale).toBe(first.scheduleTimezoneIsStale);
    });

    it("returns a fresh object when the draft title changes", () => {
        const values: IScheduledExportDraftContextValue[] = [];
        const onValue = (v: IScheduledExportDraftContextValue) => values.push(v);

        render(
            <Wrapper>
                <TitleEditor />
                <DraftCapture onValue={onValue} />
            </Wrapper>,
        );
        const first = values.at(-1)!;

        fireEvent.click(screen.getByTestId("edit-title"));

        expect(values.at(-1)).not.toBe(first);
        expect(values.at(-1)!.editedAutomation.title).toBe("changed-title");
    });
});

describe("scheduled-export context identity — actions", () => {
    it("keeps the same object across a rerender that changes nothing", () => {
        const values: IScheduledExportActionsContextValue[] = [];
        const onValue = (v: IScheduledExportActionsContextValue) => values.push(v);

        const { rerender } = render(
            <Wrapper>
                <ActionsCapture onValue={onValue} />
            </Wrapper>,
        );
        const first = values.at(-1)!;

        rerender(
            <Wrapper>
                <ActionsCapture onValue={onValue} />
            </Wrapper>,
        );

        expect(values.at(-1)).toBe(first);
    });

    it("returns a fresh object when the timezone changes (onRecurrenceChange's identity moves)", () => {
        const values: IScheduledExportActionsContextValue[] = [];
        const onValue = (v: IScheduledExportActionsContextValue) => values.push(v);

        const { rerender } = render(
            <Wrapper>
                <ActionsCapture onValue={onValue} />
            </Wrapper>,
        );
        const first = values.at(-1)!;

        rerender(
            <Wrapper automationsContext={OTHER_AUTOMATIONS_CONTEXT}>
                <ActionsCapture onValue={onValue} />
            </Wrapper>,
        );

        expect(values.at(-1)).not.toBe(first);
        expect(values.at(-1)!.onRecurrenceChange).not.toBe(first.onRecurrenceChange);
    });
});

describe("scheduled-export context identity — data", () => {
    it("keeps the same object across a rerender that changes nothing", () => {
        const values: IScheduledExportDataContextValue[] = [];
        const onValue = (v: IScheduledExportDataContextValue) => values.push(v);

        const { rerender } = render(
            <Wrapper>
                <DataCapture onValue={onValue} />
            </Wrapper>,
        );
        const first = values.at(-1)!;

        rerender(
            <Wrapper>
                <DataCapture onValue={onValue} />
            </Wrapper>,
        );

        expect(values.at(-1)).toBe(first);
    });

    it("returns a fresh object when the current user changes", () => {
        const values: IScheduledExportDataContextValue[] = [];
        const onValue = (v: IScheduledExportDataContextValue) => values.push(v);

        const { rerender } = render(
            <Wrapper>
                <DataCapture onValue={onValue} />
            </Wrapper>,
        );
        const first = values.at(-1)!;

        rerender(
            <Wrapper automationsContext={OTHER_AUTOMATIONS_CONTEXT}>
                <DataCapture onValue={onValue} />
            </Wrapper>,
        );

        expect(values.at(-1)).not.toBe(first);
        expect(values.at(-1)!.defaultUser.id).not.toBe(first.defaultUser.id);
    });
});
