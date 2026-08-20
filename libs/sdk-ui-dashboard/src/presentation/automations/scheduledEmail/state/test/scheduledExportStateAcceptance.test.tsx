// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()).
//
// Only the staleness check is mocked: it computes against the dashboard's current filters and no
// assertion below reads it. `useAutomationFiltersSelect`, `useScheduledEmailFormState`,
// `useScheduledEmailFiltersModel` and `useAutomationExportParameters` all run for real — the whole
// point of this file is that a second call site reading through an accessor sees the same state a
// mutator wrote, and a mock standing in for any of them would settle exactly that question.
// ---------------------------------------------------------------------------

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

const { mockUseValidateExistingAutomationFilters } = vi.hoisted(() => ({
    mockUseValidateExistingAutomationFilters: vi.fn(),
}));

vi.mock("../../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import { IntlWrapper } from "../../../../localization/IntlWrapper.js";
import { AutomationsContextProvider } from "../../../contexts/AutomationsContext.js";
import { ScheduledEmailDialogContextProvider } from "../../../contexts/ScheduledEmailDialogContext.js";
import { useAutomationFiltersSelect } from "../../../shared/automationFilters/useAutomationFiltersSelect.js";
import { ScheduledEmailDialogStateProvider } from "../ScheduledEmailDialogStateProvider.js";
import { useScheduledExportActions } from "../ScheduledExportActionsContext.js";
import { useScheduledExportDraft } from "../ScheduledExportDraftContext.js";
import { useScheduledExportFilters } from "../ScheduledExportFiltersContext.js";
import { useScheduledExportAttachments } from "../useScheduledExportAttachments.js";

import { AUTOMATIONS_CONTEXT, NEXT_FILTER, SCHEDULED_EMAIL_DIALOG_CONTEXT } from "./fixtures.js";

beforeEach(() => {
    vi.clearAllMocks();
    mockUseValidateExistingAutomationFilters.mockReturnValue({ isValid: true, filtersAreStale: false });
});

// ---------------------------------------------------------------------------
// The fake customer shell — two sibling blocks reading and writing through the same accessors a
// real replacement slot would use, mounted under the real state provider.
// ---------------------------------------------------------------------------

function Wrapper({ children }: PropsWithChildren) {
    return (
        <IntlWrapper>
            <AutomationsContextProvider value={AUTOMATIONS_CONTEXT}>
                <ScheduledEmailDialogContextProvider value={SCHEDULED_EMAIL_DIALOG_CONTEXT}>
                    <ScheduledEmailDialogStateProvider>{children}</ScheduledEmailDialogStateProvider>
                </ScheduledEmailDialogContextProvider>
            </AutomationsContextProvider>
        </IntlWrapper>
    );
}

function BlockA() {
    const { onFiltersChange } = useScheduledExportFilters();
    const { setEditedAutomation, onDashboardAttachmentsChange } = useScheduledExportActions();

    return (
        <>
            <button data-testid="block-a-change-filters" onClick={() => onFiltersChange([NEXT_FILTER])}>
                change filters
            </button>
            <button
                data-testid="block-a-rename"
                onClick={() =>
                    setEditedAutomation((current) => ({ ...current, title: "renamed by block A" }))
                }
            >
                rename
            </button>
            <button data-testid="block-a-select-xlsx" onClick={() => onDashboardAttachmentsChange(["XLSX"])}>
                select xlsx
            </button>
        </>
    );
}

function BlockB() {
    const { selectedFilters } = useScheduledExportFilters();
    const { editedAutomation } = useScheduledExportDraft();
    const { selectedAttachments } = useScheduledExportAttachments();

    return (
        <>
            <div data-testid="block-b-filter-count">{selectedFilters.length}</div>
            <div data-testid="block-b-title">{editedAutomation.title ?? "NO_TITLE"}</div>
            <div data-testid="block-b-attachments">{selectedAttachments.join(",") || "NONE"}</div>
        </>
    );
}

/**
 * The forked variant: block B derives the filter selection itself instead of reading the accessor,
 * which is the shape the state elevation removes.
 */
function ForkedBlockB() {
    const { editedAutomationFilters } = useAutomationFiltersSelect({
        automationToEdit: undefined,
        widget: undefined,
    });

    return <div data-testid="block-b-filter-count">{editedAutomationFilters.length}</div>;
}

describe("scheduled-export state acceptance — a second call site sees what the mutator wrote", () => {
    it("propagates a filter selection block A wrote to block B, both reading useScheduledExportFilters()", () => {
        render(
            <Wrapper>
                <BlockA />
                <BlockB />
            </Wrapper>,
        );

        expect(screen.getByTestId("block-b-filter-count")).toHaveTextContent("0");

        fireEvent.click(screen.getByTestId("block-a-change-filters"));

        expect(screen.getByTestId("block-b-filter-count")).toHaveTextContent("1");
    });

    it("does not propagate it when block B derives the selection itself", () => {
        render(
            <Wrapper>
                <BlockA />
                <ForkedBlockB />
            </Wrapper>,
        );

        fireEvent.click(screen.getByTestId("block-a-change-filters"));

        // The two copies diverge: block A's edit reached its own state, not block B's. This is the
        // defect the state elevation removes, and the reason the assertion above means anything.
        expect(screen.getByTestId("block-b-filter-count")).toHaveTextContent("0");
    });

    it("propagates a draft write from useScheduledExportActions() into block B's draft read", () => {
        render(
            <Wrapper>
                <BlockA />
                <BlockB />
            </Wrapper>,
        );

        fireEvent.click(screen.getByTestId("block-a-rename"));

        expect(screen.getByTestId("block-b-title")).toHaveTextContent("renamed by block A");
    });

    it("crosses contexts: an attachment change in block A reaches block B's derived attachments", () => {
        render(
            <Wrapper>
                <BlockA />
                <BlockB />
            </Wrapper>,
        );

        fireEvent.click(screen.getByTestId("block-a-select-xlsx"));

        expect(screen.getByTestId("block-b-attachments")).toHaveTextContent("XLSX");
    });
});
