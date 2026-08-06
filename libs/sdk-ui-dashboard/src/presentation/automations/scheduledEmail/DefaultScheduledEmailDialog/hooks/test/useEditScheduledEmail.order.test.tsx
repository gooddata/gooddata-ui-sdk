// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type FilterContextItem,
    type IDashboardExportParameter,
    type IInsight,
    type INotificationChannelMetadataObject,
    type IWidget,
    type IWorkspaceUser,
    idRef,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";

import type { IAutomationFiltersTab } from "../../../../../../model/store/filtering/types.js";
import type * as AutomationFiltersSelectModule from "../../../../shared/automationFilters/useAutomationFiltersSelect.js";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()). We use
// vi.fn() inline and retrieve spies via vi.mocked() after the import statements.
//
// `useAutomationFiltersSelect`, `useValidateExistingAutomationFilters` and
// `useAutomationExportParameters` are the three shared, store-backed read hooks
// `useEditScheduledEmail` now calls directly (via `useScheduledEmailFilters` for the latter two) —
// mocked because none of them are wired up to a real dashboard Redux store in this unit test.
// `AutomationsContext` and `ScheduledEmailDialogContext` are NOT mocked: this test renders through
// their real providers, same as before this file's read-model consolidation. Everything else
// `useEditScheduledEmail` composes (`useScheduledEmailEffectiveFilters`, `useScheduledEmailFormState`,
// `useScheduledEmailExportSettings`, `useScheduledEmailFilters`'s own handlers) runs for real, because
// the first-mount test's whole point is to exercise the real seeding computation through the real hooks.
// ---------------------------------------------------------------------------

const {
    mockUseAutomationFiltersSelect,
    mockUseValidateExistingAutomationFilters,
    mockUseAutomationExportParameters,
} = vi.hoisted(() => ({
    mockUseAutomationFiltersSelect: vi.fn(),
    mockUseValidateExistingAutomationFilters: vi.fn(),
    mockUseAutomationExportParameters: vi.fn(),
}));

vi.mock("../../../../shared/automationFilters/useAutomationFiltersSelect.js", async (importOriginal) => {
    const actual = await importOriginal<typeof AutomationFiltersSelectModule>();
    return {
        ...actual,
        useAutomationFiltersSelect: mockUseAutomationFiltersSelect,
    };
});

vi.mock("../../../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

vi.mock("../../../../shared/automationFilters/useAutomationExportParameters.js", () => ({
    useAutomationExportParameters: mockUseAutomationExportParameters,
}));

vi.mock("../useScheduleValidation.js", () => ({
    useScheduleValidation: () => ({ isValid: true }),
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";
import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../../../contexts/AutomationsContext.js";
import {
    type IScheduledEmailDialogContextValue,
    ScheduledEmailDialogContextProvider,
} from "../../../../contexts/ScheduledEmailDialogContext.js";
import { useEditScheduledEmail } from "../useEditScheduledEmail.js";

const widget: IWidget = {
    type: "insight",
    insight: idRef("insight-1", "insight"),
    ignoreDashboardFilters: [],
    drills: [],
    title: "Widget",
    description: "",
    ref: idRef("w1"),
    uri: "/w1",
    identifier: "w1",
    localIdentifier: "w1",
};

const insight: IInsight = {
    insight: {
        identifier: "insight-1",
        uri: "/insight-1",
        ref: idRef("insight-1", "insight"),
        title: "Insight",
        visualizationUrl: "local:table",
        buckets: [],
        filters: [],
        sorts: [],
        properties: {},
    },
};

const addedParameters: Record<string, IDashboardExportParameter[]> = {
    tab1: [{ id: "topN", value: "5", title: "Top N" }],
};

function fakeFiltersTab(tabId: string): IAutomationFiltersTab {
    return {
        tabId,
        tabTitle: `Tab ${tabId}`,
        availableFilters: [],
        defaultSelectedFilters: [],
        lockedFilters: [],
        hiddenFilters: [],
    };
}

// The hook reads only a handful of context fields; the rest are optional-chained or `?? []`-coalesced
// inside the hook, so partial stubs cast through `unknown` are safe for these tests.
const automationsContextValue = {
    settings: undefined,
    timezone: undefined,
    currentUser: { login: "u1", email: "u1@example.com", ref: idRef("u1") },
    features: {
        enableAutomationEvaluationMode: false,
    },
} as unknown as IAutomationsContextValue;

function buildScheduledEmailDialogContextValue(): IScheduledEmailDialogContextValue {
    return {
        dashboardId: "dashboard-1",
        dashboardTitle: "Dashboard",
        hiddenFilters: [],
        commonDateFilterId: undefined,
        widgetLocalIdToTabIdMap: { w1: "tab1" },
        // The reporter's case: no effective override, so the new automation seeds no params.
        exportParametersByTab: {},
        widget,
        insight,
        users: [] as IWorkspaceUser[],
        notificationChannels: [{ id: "channel-1" }],
    } as unknown as IScheduledEmailDialogContextValue;
}

let scheduledEmailDialogContextValue = buildScheduledEmailDialogContextValue();

function mockAutomationFiltersSelect(
    overrides: {
        editedAutomationFilters?: FilterContextItem[];
        storeFilters?: boolean;
        filtersByTab?: IAutomationFiltersTab[];
        editedAutomationFiltersByTab?: Record<string, FilterContextItem[]>;
    } = {},
) {
    mockUseAutomationFiltersSelect.mockReturnValue({
        editedAutomationFilters: [],
        setEditedAutomationFilters: vi.fn(),
        storeFilters: false,
        setStoreFilters: vi.fn(),
        availableFilters: [],
        availableFiltersAsVisibleFilters: undefined,
        filtersForNewAutomation: [],
        filtersByTab: undefined,
        editedAutomationFiltersByTab: undefined,
        setEditedAutomationFiltersByTab: vi.fn(),
        availableFiltersAsVisibleFiltersByTab: undefined,
        ...overrides,
    });
}

function mockValidateExistingAutomationFilters(
    overrides: { isValid?: boolean; filtersAreStale?: boolean } = {},
) {
    mockUseValidateExistingAutomationFilters.mockReturnValue({
        isValid: true,
        hiddenFilterIsMissingInSavedFilters: false,
        hiddenFilterHasDifferentValueInSavedFilter: false,
        lockedFilterIsMissingInSavedFilters: false,
        lockedFilterHasDifferentValueInSavedFilter: false,
        ignoredFilterIsAppliedInSavedFilters: false,
        removedFilterIsAppliedInSavedFilters: false,
        commonDateFilterIsMissingInSavedVisibleFilters: false,
        visibleFilterIsMissingInSavedFilters: false,
        visibleFiltersAreMissing: false,
        incompatibleSelectionTypeIsAppliedInSavedFilters: false,
        filtersAreStale: false,
        ...overrides,
    });
}

function mockAutomationExportParameters() {
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
}

// Rebuild before every test so a mutation from one test can never leak into the next.
beforeEach(() => {
    vi.clearAllMocks();
    scheduledEmailDialogContextValue = buildScheduledEmailDialogContextValue();
    mockAutomationFiltersSelect();
    mockValidateExistingAutomationFilters();
    mockAutomationExportParameters();
});

function setScheduledEmailDialogContext(overrides: Partial<IScheduledEmailDialogContextValue>) {
    scheduledEmailDialogContextValue = { ...scheduledEmailDialogContextValue, ...overrides };
}

function wrapper({ children }: { children: ReactNode }) {
    return (
        <IntlWrapper>
            <AutomationsContextProvider value={automationsContextValue}>
                <ScheduledEmailDialogContextProvider value={scheduledEmailDialogContextValue}>
                    {children}
                </ScheduledEmailDialogContextProvider>
            </AutomationsContextProvider>
        </IntlWrapper>
    );
}

// Drive the hook directly; the parameters hook (the only other caller of setParametersWire) is
// covered separately.
function renderEditHook() {
    return renderHook(
        () =>
            useEditScheduledEmail({
                maxAutomationsRecipients: 10,
            }),
        { wrapper },
    );
}

function paramsByTabOf(result: ReturnType<typeof renderEditHook>["result"]) {
    return (result.current.editedAutomation.exportDefinitions ?? [])
        .filter((ed) => isExportDefinitionVisualizationObjectRequestPayload(ed.requestPayload))
        .map((ed) => ed.requestPayload.content.parametersByTab);
}

describe("useEditScheduledEmail — export parameters survive attachment changes (F1-2594)", () => {
    it("keeps a wire written while no attachment is selected, then a format is picked", () => {
        const { result } = renderEditHook();

        act(() => {
            result.current.onWidgetAttachmentsChange([]);
        });
        act(() => {
            result.current.setParametersWire(addedParameters);
        });
        act(() => {
            result.current.onWidgetAttachmentsChange(["XLSX"]);
        });

        expect(paramsByTabOf(result)).toEqual([addedParameters]);
    });

    it("keeps the wire across a deselect-all then reselect of attachments", () => {
        const { result } = renderEditHook();

        act(() => {
            result.current.setParametersWire(addedParameters);
        });
        act(() => {
            result.current.onWidgetAttachmentsChange([]);
        });
        act(() => {
            result.current.onWidgetAttachmentsChange(["PNG"]);
        });

        expect(paramsByTabOf(result)).toEqual([addedParameters]);
    });

    // Sanity: this order always worked; guards the fix against breaking it.
    it("keeps a wire written after the format change", () => {
        const { result } = renderEditHook();

        act(() => {
            result.current.onWidgetAttachmentsChange(["XLSX"]);
        });
        act(() => {
            result.current.setParametersWire(addedParameters);
        });

        expect(paramsByTabOf(result)).toEqual([addedParameters]);
    });
});

describe("useEditScheduledEmail — recipients and destination data", () => {
    it("returns the recipients and destination data from the context", () => {
        const users: IWorkspaceUser[] = [
            { ref: idRef("user-1"), uri: "/users/user-1", login: "user-1", email: "user-1@example.com" },
        ];
        const notificationChannels = [
            { id: "channel-1", type: "notificationChannel" },
        ] as INotificationChannelMetadataObject[];
        setScheduledEmailDialogContext({ users, notificationChannels });

        const { result } = renderEditHook();

        expect(result.current.users).toBe(users);
        expect(result.current.notificationChannels).toBe(notificationChannels);
    });
});

// ---------------------------------------------------------------------------
// Per-tab coverage — the per-tab filter path is the highest-regression surface in this package.
// ---------------------------------------------------------------------------

describe("useEditScheduledEmail — per-tab filters", () => {
    it("keeps per-tab filters addressable through the consolidated model", () => {
        setScheduledEmailDialogContext({ hasMultipleTabs: true });
        mockAutomationFiltersSelect({
            filtersByTab: [fakeFiltersTab("tab-1")],
            editedAutomationFiltersByTab: { "tab-1": [] },
        });

        const { result } = renderEditHook();

        expect(result.current.filtersByTab).toHaveLength(1);
        expect(result.current.editedFiltersByTab).toHaveProperty("tab-1");
        expect(typeof result.current.onFiltersByTabChange).toBe("function");
    });
});

// ---------------------------------------------------------------------------
// First-mount draft equivalence — the sharpest regression risk of the read-model move: the read
// hook now runs upstream of `useScheduledEmailFormState`'s eager `useState` initializer, so a
// one-render timing shift would silently change a new schedule's default filters. Mirrors the
// alerting-side probe: validated against the pre-change (props-threaded) tree by stashing this
// file's diff and running an equivalent assertion directly against `useEditScheduledEmail`, which
// confirmed the same first-render seeding already held there.
// ---------------------------------------------------------------------------

describe("useEditScheduledEmail — first-mount filter seeding", () => {
    it("seeds a new schedule's draft filters from the read model on first mount", () => {
        // Dashboard schedule (no widget/insight) so the seeded filters land in a plain
        // `content.filters`, not the widget path's per-format routing.
        setScheduledEmailDialogContext({ widget: undefined, insight: undefined });

        const filters: FilterContextItem[] = [
            {
                attributeFilter: {
                    localIdentifier: "f1",
                    displayForm: idRef("df1"),
                    negativeSelection: false,
                    attributeElements: { uris: ["/e1"] },
                },
            },
        ];
        mockAutomationFiltersSelect({ editedAutomationFilters: filters, storeFilters: true });

        const { result } = renderEditHook();

        const exportDefinition = result.current.editedAutomation.exportDefinitions?.[0];

        // asserted on the FIRST render — not after an act()/settle, which would hide a one-render lag
        expect(
            exportDefinition && isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload)
                ? exportDefinition.requestPayload.content.filters
                : undefined,
        ).toHaveLength(1);
    });
});
