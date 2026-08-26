// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IDashboardExportParameter,
    idRef,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()).
//
// Only the staleness check is mocked. The parameter model, the attachment handlers and the wire ref
// itself all run for real: whether one wire instance serves every consumer is the question.
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
import {
    type IScheduledEmailDialogContextValue,
    ScheduledEmailDialogContextProvider,
} from "../../contexts/ScheduledEmailDialogContext.js";
import { dashboardParameter } from "../../tests/parameterFixtures.test.helpers.js";
import {
    AUTOMATIONS_CONTEXT,
    SCHEDULED_EMAIL_DIALOG_CONTEXT,
    SENTINEL_INSIGHT,
    SENTINEL_WIDGET,
    WORKSPACE_PARAMETER,
} from "../tests/scheduledEmail.test.helpers.js";

import { ScheduledEmailDialogStateProvider } from "./ScheduledEmailDialogStateProvider.js";
import { useScheduledExportActions } from "./ScheduledExportActionsContext.js";
import { useScheduledExportDraft } from "./ScheduledExportDraftContext.js";
import { useScheduledExportFilters } from "./ScheduledExportFiltersContext.js";

const TAB_ID = "tab-1";
const PARAMETER_REF = idRef("param-1", "parameter");
const OVERRIDE_VALUE = "override-value";

// A widget schedule whose widget maps to a tab that has one dashboard parameter, which is what gives
// the flat parameter handlers a tab to write into and the catalog an entry that resolves.
const AUTOMATIONS_CONTEXT_WITH_PARAMETERS: IAutomationsContextValue = {
    ...AUTOMATIONS_CONTEXT,
    tabIds: [TAB_ID],
    widgetLocalIdToTabIdMap: { [SENTINEL_WIDGET.localIdentifier!]: TAB_ID },
    parameters: {
        ...AUTOMATIONS_CONTEXT.parameters,
        catalog: [WORKSPACE_PARAMETER],
        dashboardParametersByTab: {
            [TAB_ID]: [dashboardParameter("param-1", { parameterType: "STRING" })],
        },
    },
};

const WIDGET_DIALOG_CONTEXT: IScheduledEmailDialogContextValue = {
    ...SCHEDULED_EMAIL_DIALOG_CONTEXT,
    widget: SENTINEL_WIDGET,
    insight: SENTINEL_INSIGHT,
    // Seeds the working set with the chip the test then edits; without an entry for this tab there is
    // nothing for the flat parameter handler to patch.
    exportParametersByTab: {
        [TAB_ID]: [{ id: "param-1", value: "seed-value", title: "Param 1", parameterType: "STRING" }],
    },
};

beforeEach(() => {
    vi.clearAllMocks();
    mockUseValidateExistingAutomationFilters.mockReturnValue({ isValid: true, filtersAreStale: false });
});

function Wrapper({ children }: PropsWithChildren) {
    return (
        <IntlWrapper>
            <AutomationsContextProvider value={AUTOMATIONS_CONTEXT_WITH_PARAMETERS}>
                <ScheduledEmailDialogContextProvider value={WIDGET_DIALOG_CONTEXT}>
                    <ScheduledEmailDialogStateProvider>{children}</ScheduledEmailDialogStateProvider>
                </ScheduledEmailDialogContextProvider>
            </AutomationsContextProvider>
        </IntlWrapper>
    );
}

/** Clears every export definition, then writes a parameter value — the wire's only production path. */
function WritingBlock() {
    const { onWidgetAttachmentsChange } = useScheduledExportActions();
    const { onParameterChange } = useScheduledExportFilters();

    return (
        <>
            <button data-testid="clear-attachments" onClick={() => onWidgetAttachmentsChange([])}>
                clear attachments
            </button>
            <button
                data-testid="write-parameter"
                onClick={() => onParameterChange(PARAMETER_REF, OVERRIDE_VALUE)}
            >
                write parameter
            </button>
        </>
    );
}

/** Rebuilds the export definitions from the other consumer, and reports the wire that survived. */
function RebuildingBlock() {
    const { onWidgetAttachmentsChange } = useScheduledExportActions();
    const { editedAutomation } = useScheduledExportDraft();

    const wires = (editedAutomation.exportDefinitions ?? [])
        .filter((exportDefinition) =>
            isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload),
        )
        .map((exportDefinition) => exportDefinition.requestPayload.content.parametersByTab)
        .filter(Boolean) as Record<string, IDashboardExportParameter[]>[];

    return (
        <>
            <button data-testid="rebuild-attachments" onClick={() => onWidgetAttachmentsChange(["XLSX"])}>
                rebuild attachments
            </button>
            <div data-testid="rebuilt-wire">
                {wires.map((wire) => wire[TAB_ID]?.map((entry) => String(entry.value)).join("|")).join(";") ||
                    "NO_WIRE"}
            </div>
        </>
    );
}

describe("the scheduled export's parameter wire — one instance per dialog", () => {
    it("survives a rebuild driven from a different consumer than the one that wrote it", () => {
        render(
            <Wrapper>
                <WritingBlock />
                <RebuildingBlock />
            </Wrapper>,
        );

        // With no export definition left, the wire has nowhere in the automation to live; the ref is
        // what carries it, and it is the provider's, not each consumer's.
        fireEvent.click(screen.getByTestId("clear-attachments"));
        fireEvent.click(screen.getByTestId("write-parameter"));
        expect(screen.getByTestId("rebuilt-wire")).toHaveTextContent("NO_WIRE");

        fireEvent.click(screen.getByTestId("rebuild-attachments"));

        expect(screen.getByTestId("rebuilt-wire")).toHaveTextContent(OVERRIDE_VALUE);
    });

    it("keeps a wire written before the attachments were cleared", () => {
        render(
            <Wrapper>
                <WritingBlock />
                <RebuildingBlock />
            </Wrapper>,
        );

        fireEvent.click(screen.getByTestId("write-parameter"));
        fireEvent.click(screen.getByTestId("clear-attachments"));
        fireEvent.click(screen.getByTestId("rebuild-attachments"));

        expect(screen.getByTestId("rebuilt-wire")).toHaveTextContent(OVERRIDE_VALUE);
    });
});
