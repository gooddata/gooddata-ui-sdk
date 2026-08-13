// (C) 2026 GoodData Corporation

import { Component, type ReactNode } from "react";

import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type FilterContextItem,
    idRef,
    isExportDefinitionDashboardRequestPayload,
} from "@gooddata/sdk-model";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()).
//
// `ScheduledEmailDialog` is exercised for real — the mount site under test is there — with a stub
// registered as its `ScheduledEmailDialogComponent` slot, the same way a customer replacement
// would be. The two dialog contexts are mocked so `isLoading` can be flipped between renders, and
// the three store-backed read hooks because none of them is wired to a real dashboard store here.
// `useScheduledEmailFormState` runs for real inside the real provider: the seeding behaviour under
// test lives there.
// ---------------------------------------------------------------------------

const {
    mockUseAutomationsContext,
    mockUseScheduledEmailDialogContext,
    mockUseAutomationFiltersSelect,
    mockUseValidateExistingAutomationFilters,
    mockUseAutomationExportParameters,
} = vi.hoisted(() => ({
    mockUseAutomationsContext: vi.fn(),
    mockUseScheduledEmailDialogContext: vi.fn(),
    mockUseAutomationFiltersSelect: vi.fn(),
    mockUseValidateExistingAutomationFilters: vi.fn(),
    mockUseAutomationExportParameters: vi.fn(),
}));

vi.mock("../../../contexts/AutomationsContext.js", () => ({
    useAutomationsContext: mockUseAutomationsContext,
}));

vi.mock("../../../contexts/ScheduledEmailDialogContext.js", () => ({
    useScheduledEmailDialogContext: mockUseScheduledEmailDialogContext,
}));

vi.mock("../../../shared/automationFilters/useAutomationFiltersSelect.js", () => ({
    useAutomationFiltersSelect: mockUseAutomationFiltersSelect,
}));

vi.mock("../../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

vi.mock("../../../shared/automationFilters/useAutomationExportParameters.js", () => ({
    useAutomationExportParameters: mockUseAutomationExportParameters,
}));

vi.mock("../../../../dashboardContexts/DashboardComponentsContext.js", () => ({
    useDashboardComponentsContext: () => ({ ScheduledEmailDialogComponent: resolvedSlotComponent }),
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import { IntlWrapper } from "../../../../localization/IntlWrapper.js";
import { useScheduledEmailDialogContext } from "../../../contexts/ScheduledEmailDialogContext.js";
import { ScheduledEmailDialog } from "../../ScheduledEmailDialog.js";
import { useScheduledExportActions } from "../ScheduledExportActionsContext.js";
import { useScheduledExportData } from "../ScheduledExportDataContext.js";
import { useScheduledExportDraft } from "../ScheduledExportDraftContext.js";
import { useScheduledExportFilters } from "../ScheduledExportFiltersContext.js";

import { AUTOMATIONS_CONTEXT, CURRENT_USER, SCHEDULED_EMAIL_DIALOG_CONTEXT } from "./fixtures.js";

const SEEDED_FILTER: FilterContextItem = {
    attributeFilter: {
        localIdentifier: "f1",
        displayForm: idRef("df1"),
        negativeSelection: false,
        attributeElements: { uris: ["/e1"] },
    },
};

/**
 * Stands in for the resolved slot component. Reads the dialog state unconditionally, the way a
 * replacement that ignores the documented `isLoading` check would, so the accessors' throw is
 * observable through the boundary below.
 */
function StubScheduledEmailDialogComponent() {
    return (
        <>
            <DraftProbe />
            <TitleEditor />
            <AccessorProbe />
        </>
    );
}

/**
 * The other resolved-slot shape: a replacement that honours the accessors' documented contract by
 * checking `isLoading` before reading the state. It survives the flip, so the same mounted tree can
 * be observed on both sides of it.
 */
function GuardedStubScheduledEmailDialogComponent() {
    const { isLoading: dialogIsLoading } = useScheduledEmailDialogContext();

    if (dialogIsLoading) {
        return <div data-testid="guarded-state">LOADING</div>;
    }

    return (
        <div data-testid="guarded-state">
            <DraftProbe />
        </div>
    );
}

function DraftProbe() {
    const { editedAutomation } = useScheduledExportDraft();
    const exportDefinition = editedAutomation.exportDefinitions?.[0];
    const seededFilters =
        exportDefinition && isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload)
            ? exportDefinition.requestPayload.content.filters
            : undefined;

    return (
        <>
            <div data-testid="draft-channel">{editedAutomation.notificationChannel ?? "NO_CHANNEL"}</div>
            <div data-testid="draft-seeded-filters">{seededFilters?.length ?? 0}</div>
            <div data-testid="draft-title">{editedAutomation.title ?? "NO_TITLE"}</div>
            <div data-testid="draft-recipient">{editedAutomation.recipients?.[0]?.id ?? "NO_RECIPIENT"}</div>
        </>
    );
}

function TitleEditor() {
    const { onTitleChange } = useScheduledExportActions();

    return (
        <button data-testid="edit-title" onClick={() => onTitleChange("edited", true)}>
            edit title
        </button>
    );
}

/**
 * Reads all four accessors, so a missing provider surfaces regardless of which one is asked first.
 */
function AccessorProbe() {
    useScheduledExportActions();
    useScheduledExportData();
    useScheduledExportFilters();

    return <div data-testid="accessors-ok">ok</div>;
}

class StateBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { failed: false };
    }

    static getDerivedStateFromError() {
        return { failed: true };
    }

    override render() {
        return this.state.failed ? <div data-testid="no-provider">NO_PROVIDER</div> : this.props.children;
    }
}

let isLoading = false;
let editedAutomationFilters: FilterContextItem[] = [];
let resolvedSlotComponent: () => ReactNode = StubScheduledEmailDialogComponent;

function mockContexts() {
    mockUseAutomationsContext.mockImplementation(() => AUTOMATIONS_CONTEXT);
    mockUseScheduledEmailDialogContext.mockImplementation(() => ({
        ...SCHEDULED_EMAIL_DIALOG_CONTEXT,
        isLoading,
    }));
    mockUseAutomationFiltersSelect.mockImplementation(() => ({
        editedAutomationFilters,
        setEditedAutomationFilters: vi.fn(),
        storeFilters: true,
        setStoreFilters: vi.fn(),
        availableFilters: [],
        availableFiltersAsVisibleFilters: undefined,
        filtersForNewAutomation: [],
        filtersByTab: undefined,
        editedAutomationFiltersByTab: undefined,
        setEditedAutomationFiltersByTab: vi.fn(),
        availableFiltersAsVisibleFiltersByTab: undefined,
    }));
}

beforeEach(() => {
    vi.clearAllMocks();
    // React logs the boundary-caught error; the throw is the assertion, not a failure.
    vi.spyOn(console, "error").mockImplementation(() => {});
    isLoading = false;
    editedAutomationFilters = [];
    resolvedSlotComponent = StubScheduledEmailDialogComponent;
    mockContexts();
    mockUseValidateExistingAutomationFilters.mockReturnValue({ isValid: true, filtersAreStale: false });
    mockUseAutomationExportParameters.mockReturnValue({
        parametersEnabled: false,
        visibleParametersByTab: {},
        availableParametersByTab: {},
        flatTabId: undefined,
        onParameterAdd: vi.fn(),
        onParameterChange: vi.fn(),
        onParameterDelete: vi.fn(),
        onParameterAddByTab: vi.fn(),
        onParameterChangeByTab: vi.fn(),
        onParameterDeleteByTab: vi.fn(),
        applyLatest: vi.fn(),
        onStoreParametersChange: vi.fn(),
    });
});

function renderDialog() {
    return render(
        <IntlWrapper>
            <StateBoundary>
                <ScheduledEmailDialog onCancel={vi.fn()} />
            </StateBoundary>
        </IntlWrapper>,
    );
}

describe("ScheduledEmailDialogStateProvider — the loading gate", () => {
    it("does not mount the state model while isLoading", () => {
        isLoading = true;

        const { getByTestId } = renderDialog();

        expect(getByTestId("no-provider")).toBeInTheDocument();
    });

    it("seeds the draft from loaded data when isLoading flips under a mounted tree", () => {
        // The live path on this tree: a widget export opens while its filters load, so the filters
        // arrive under the already-mounted dialog. The draft's seeding useState initializer never
        // re-runs, so a state model mounted before the flip would freeze the empty seed and keep it.
        // The slot component here honours the accessors' documented isLoading check, so the same
        // tree can be observed on both sides of the flip.
        resolvedSlotComponent = GuardedStubScheduledEmailDialogComponent;
        isLoading = true;
        editedAutomationFilters = [];

        const { getByTestId, rerender } = renderDialog();
        expect(getByTestId("guarded-state")).toHaveTextContent("LOADING");

        isLoading = false;
        editedAutomationFilters = [SEEDED_FILTER];
        rerender(
            <IntlWrapper>
                <StateBoundary>
                    <ScheduledEmailDialog onCancel={vi.fn()} />
                </StateBoundary>
            </IntlWrapper>,
        );

        expect(getByTestId("draft-seeded-filters")).toHaveTextContent("1");
        expect(getByTestId("draft-channel")).toHaveTextContent(
            SCHEDULED_EMAIL_DIALOG_CONTEXT.notificationChannels[0].id,
        );
    });

    it("reaches every provider input through context, taking no props", () => {
        const { getByTestId } = renderDialog();

        // The recipient comes from the automations context's current user, and the channel from the
        // dialog context: the three inputs the dialog state used to receive as threaded props.
        expect(getByTestId("draft-recipient")).toHaveTextContent(CURRENT_USER.login);
        expect(getByTestId("draft-channel")).toHaveTextContent("channel-1");
    });
});

describe("ScheduledEmailDialogStateProvider — the mounted state model", () => {
    it("serves all four accessors to the resolved slot component", () => {
        const { getByTestId } = renderDialog();

        expect(getByTestId("accessors-ok")).toBeInTheDocument();
    });

    it("keeps a draft edit across a rerender that does not flip isLoading", () => {
        const { getByTestId, rerender } = renderDialog();

        fireEvent.click(getByTestId("edit-title"));
        expect(getByTestId("draft-title")).toHaveTextContent("edited");

        rerender(
            <IntlWrapper>
                <StateBoundary>
                    <ScheduledEmailDialog onCancel={vi.fn()} />
                </StateBoundary>
            </IntlWrapper>,
        );

        expect(getByTestId("draft-title")).toHaveTextContent("edited");
    });
});
