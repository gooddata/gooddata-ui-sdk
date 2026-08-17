// (C) 2026 GoodData Corporation

import { type PropsWithChildren, useRef } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()).
//
// Only the staleness check is mocked. The state model runs for real: whether a keystroke reaches
// the non-draft contexts is the question.
// ---------------------------------------------------------------------------

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
import { ScheduledEmailDialogStateProvider } from "../ScheduledEmailDialogStateProvider.js";
import { useScheduledExportActions } from "../ScheduledExportActionsContext.js";
import { useScheduledExportData } from "../ScheduledExportDataContext.js";
import { useScheduledExportDraft } from "../ScheduledExportDraftContext.js";
import { useScheduledExportFilters } from "../ScheduledExportFiltersContext.js";

import { AUTOMATIONS_CONTEXT, SCHEDULED_EMAIL_DIALOG_CONTEXT } from "./fixtures.js";

const KEYSTROKES = 5;

beforeEach(() => {
    vi.clearAllMocks();
    mockUseValidateExistingAutomationFilters.mockReturnValue({ isValid: true, filtersAreStale: false });
});

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

function TitleTypist() {
    const { onTitleChange } = useScheduledExportActions();
    const keystrokeCount = useRef(0);

    return (
        <button
            data-testid="type-title"
            onClick={() => {
                keystrokeCount.current += 1;
                onTitleChange(`draft-title-${keystrokeCount.current}`);
            }}
        >
            type
        </button>
    );
}

function DraftTitleProbe() {
    const { editedAutomation } = useScheduledExportDraft();

    return <div data-testid="draft-title">{editedAutomation.title ?? "NO_TITLE"}</div>;
}

/**
 * A mutate-only consumer: the shape a Level-2 block that only writes takes. It must not re-render
 * while the draft changes, which is what the actions handlers' stable identity buys.
 */
function ActionsConsumer({ onRender }: { onRender: () => void }) {
    useScheduledExportActions();
    onRender();

    return null;
}

function DataConsumer({ onRender }: { onRender: () => void }) {
    useScheduledExportData();
    onRender();

    return null;
}

/**
 * A filters-only consumer: the shape a filters panel block takes. The filter model never reads the
 * draft, so nothing it returns changes when a title is typed.
 */
function FiltersConsumer({ onRender }: { onRender: () => void }) {
    useScheduledExportFilters();
    onRender();

    return null;
}

describe("scheduled-export state render count — the non-draft contexts do not churn on a keystroke", () => {
    it("renders the actions, data and filters consumers once, unaffected by draft title keystrokes", () => {
        const onActionsRender = vi.fn();
        const onDataRender = vi.fn();
        const onFiltersRender = vi.fn();

        render(
            <Wrapper>
                <TitleTypist />
                <DraftTitleProbe />
                <ActionsConsumer onRender={onActionsRender} />
                <DataConsumer onRender={onDataRender} />
                <FiltersConsumer onRender={onFiltersRender} />
            </Wrapper>,
        );

        expect(onActionsRender).toHaveBeenCalledTimes(1);
        expect(onDataRender).toHaveBeenCalledTimes(1);
        expect(onFiltersRender).toHaveBeenCalledTimes(1);

        for (let keystroke = 0; keystroke < KEYSTROKES; keystroke++) {
            fireEvent.click(screen.getByTestId("type-title"));
        }

        // The keystrokes landed — otherwise the counts below would prove nothing.
        expect(screen.getByTestId("draft-title")).toHaveTextContent(`draft-title-${KEYSTROKES}`);

        expect(onActionsRender).toHaveBeenCalledTimes(1);
        expect(onDataRender).toHaveBeenCalledTimes(1);
        expect(onFiltersRender).toHaveBeenCalledTimes(1);
    });
});
