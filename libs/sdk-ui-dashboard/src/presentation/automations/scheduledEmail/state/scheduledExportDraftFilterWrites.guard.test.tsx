// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()).
//
// Only the staleness check is mocked, exactly as in scheduledExportStateAcceptance.test.tsx: it
// computes against the dashboard's current filters and no assertion below reads it.
// `useAutomationFiltersSelect`, `useScheduledEmailFormState`, `useScheduledEmailFiltersModel` and
// `useScheduledEmailEffectiveFilters` all run for real — the whole point of this file is to pin the
// *real* write's output before a later task moves it, and a mock standing in for any of them would
// settle exactly the question being asked.
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
    mockUseValidateExistingAutomationFilters: vi.fn<typeof useValidateExistingAutomationFilters>(),
}));

vi.mock("../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import {
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type IAttributeMetadataObject,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IAutomationVisibleFilter,
    type ICatalogAttribute,
    type IExportDefinitionDashboardRequestPayload,
    type IExportDefinitionMetadataObject,
    type IExportDefinitionVisualizationObjectRequestPayload,
    idRef,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";

import type { IAutomationFiltersTab } from "../../../../model/store/filtering/types.js";
import { type IAutomationsContextValue } from "../../contexts/AutomationsContext.js";
import { type IScheduledEmailDialogContextValue } from "../../contexts/ScheduledEmailDialogContext.js";
import { type useValidateExistingAutomationFilters } from "../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js";
import {
    AUTOMATIONS_CONTEXT as BASE_AUTOMATIONS_CONTEXT,
    makeDashboardExportDefinition,
    NEXT_FILTER,
    SCHEDULED_EMAIL_DIALOG_CONTEXT as BASE_DIALOG_CONTEXT,
    SENTINEL_CHANNEL,
    SENTINEL_INSIGHT,
    SENTINEL_WIDGET,
} from "../tests/scheduledEmail.test.helpers.js";
import { BlockProviders, VALID_FILTERS_RESULT } from "../tests/scheduledEmailBlocks.test.helpers.js";

import { useScheduledExportDraft } from "./ScheduledExportDraftContext.js";
import { useScheduledExportFilters } from "./ScheduledExportFiltersContext.js";
import { type IScheduledExportDraftContextValue, type IScheduledExportFiltersContextValue } from "./types.js";

beforeEach(() => {
    vi.clearAllMocks();
    mockUseValidateExistingAutomationFilters.mockReturnValue(VALID_FILTERS_RESULT);
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

// A date filter naming ("Common Date Filter") pinned via `dateFilterContextConfig.filterName`
// rather than left to the locale bundle's "dateFilterDropdown.title" — this keeps fixture titles
// below independent of i18n bundle text.
const COMMON_DATE_FILTER_TITLE = "Common Date Filter";

function commonDateFilter(localIdentifier: string): FilterContextItem {
    return {
        dateFilter: {
            type: "relative",
            granularity: "GDC.time.month",
            from: -5,
            to: 0,
            localIdentifier,
        },
    };
}

function visibleCommonDateFilter(localIdentifier: string): IAutomationVisibleFilter {
    return {
        title: COMMON_DATE_FILTER_TITLE,
        localIdentifier,
        isAllTimeDateFilter: false,
    };
}

// Fully-typed sentinels (no `as unknown as` casts) resolving NEXT_FILTER's naming unconditionally:
// these fixtures only ever put one attribute filter in play, so a lookup pair that ignores its
// argument and always returns this attribute/display-form is equivalent to a real catalog lookup
// for the cases exercised here.
const SENTINEL_ATTRIBUTE_REF = idRef("a1", "attribute");

const SENTINEL_DISPLAY_FORM: IAttributeDisplayFormMetadataObject = {
    type: "displayForm",
    ref: idRef("df1", "displayForm"),
    id: "df1",
    uri: "/df1",
    title: "Display Form 1",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    attribute: SENTINEL_ATTRIBUTE_REF,
};

const SENTINEL_ATTRIBUTE: IAttributeMetadataObject = {
    type: "attribute",
    ref: SENTINEL_ATTRIBUTE_REF,
    id: "a1",
    uri: "/a1",
    title: "Attribute 1",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    displayForms: [SENTINEL_DISPLAY_FORM],
};

const SENTINEL_CATALOG_ATTRIBUTE: ICatalogAttribute = {
    type: "attribute",
    attribute: SENTINEL_ATTRIBUTE,
    defaultDisplayForm: SENTINEL_DISPLAY_FORM,
    displayForms: [SENTINEL_DISPLAY_FORM],
    geoPinDisplayForms: [],
    groups: [],
};

function makeAutomationsContext(overrides: Partial<IAutomationsContextValue>): IAutomationsContextValue {
    return {
        ...BASE_AUTOMATIONS_CONTEXT,
        dateFilterContextConfig: { filterName: COMMON_DATE_FILTER_TITLE, mode: "active" },
        getAttributeFilterDisplayForm: () => SENTINEL_DISPLAY_FORM,
        getCatalogAttributeByRef: () => SENTINEL_CATALOG_ATTRIBUTE,
        ...overrides,
    };
}

function makeDialogContext(
    overrides: Partial<IScheduledEmailDialogContextValue>,
): IScheduledEmailDialogContextValue {
    return {
        ...BASE_DIALOG_CONTEXT,
        ...overrides,
    };
}

function tab(tabId: string, filter: FilterContextItem): IAutomationFiltersTab {
    return {
        tabId,
        tabTitle: tabId,
        availableFilters: [filter],
        defaultSelectedFilters: [filter],
        lockedFilters: [],
        hiddenFilters: [],
    };
}

// `makeDashboardExportDefinition` builds the "new automation" shape
// (`IExportDefinitionMetadataObjectDefinition`, no identity fields); an existing automation's
// export definitions carry full identity instead. Adds the missing fields rather than casting.
let existingExportDefinitionSequence = 0;
function toExistingExportDefinition(
    definition: ReturnType<typeof makeDashboardExportDefinition>,
): IExportDefinitionMetadataObject {
    existingExportDefinitionSequence += 1;
    const id = `export-definition-${existingExportDefinitionSequence}`;
    return {
        type: "exportDefinition",
        title: definition.title ?? "",
        requestPayload: definition.requestPayload,
        ref: idRef(id, "exportDefinition"),
        id,
        uri: `/${id}`,
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
    };
}

// A fully-typed `IAutomationMetadataObject` (the "edit an existing schedule" shape) — used only by
// cases 1 and 3 to seed the draft via edit-mode identity forwarding
// (`useScheduledEmailFormState`'s `useState(() => scheduledExportToEdit ?? ...)`), independent of
// any code the write under test executes.
function makeScheduledExportToEdit(overrides: Partial<IAutomationMetadataObject>): IAutomationMetadataObject {
    return {
        type: "automation",
        ref: idRef("automation-1", "automation"),
        id: "automation-1",
        uri: "/automation-1",
        title: "Existing Schedule",
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        notificationChannel: SENTINEL_CHANNEL.id,
        recipients: [],
        exportDefinitions: [],
        ...overrides,
    };
}

// ---------------------------------------------------------------------------
// Probe: mounts the real state model and exposes its draft + filter model, re-read after every
// `act()` — the "second call site" that pins the write's shape without re-mounting the tree.
// ---------------------------------------------------------------------------

interface ICapture {
    draft: IScheduledExportDraftContextValue;
    filters: IScheduledExportFiltersContextValue;
}

function useProbe(): ICapture {
    return {
        draft: useScheduledExportDraft(),
        filters: useScheduledExportFilters(),
    };
}

function wrapperFor(
    dialogContext: IScheduledEmailDialogContextValue,
    automationsContext: IAutomationsContextValue,
) {
    return ({ children }: PropsWithChildren) => (
        <BlockProviders dialogContext={dialogContext} automationsContext={automationsContext}>
            {children}
        </BlockProviders>
    );
}

// Type-guard predicates (reusing the production guards directly as `Array#find` predicates, so TS
// narrows the found element without a cast) rather than `.find(...)` plus a `payload as I...`
// narrowing cast.
type ExportDefinition = NonNullable<IAutomationMetadataObjectDefinition["exportDefinitions"]>[number];

function hasDashboardPayload(
    definition: ExportDefinition,
): definition is ExportDefinition & { requestPayload: IExportDefinitionDashboardRequestPayload } {
    return isExportDefinitionDashboardRequestPayload(definition.requestPayload);
}

function hasWidgetPayload(
    definition: ExportDefinition,
): definition is ExportDefinition & { requestPayload: IExportDefinitionVisualizationObjectRequestPayload } {
    return isExportDefinitionVisualizationObjectRequestPayload(definition.requestPayload);
}

function dashboardShape(automation: IAutomationMetadataObjectDefinition) {
    const definition = automation.exportDefinitions?.find(hasDashboardPayload);
    return {
        filters: definition?.requestPayload.content.filters,
        visibleFilters: automation.metadata?.visibleFilters,
    };
}

function dashboardTabShape(automation: IAutomationMetadataObjectDefinition) {
    const definition = automation.exportDefinitions?.find(hasDashboardPayload);
    return {
        filtersByTab: definition?.requestPayload.content.filtersByTab,
        visibleFiltersByTab: automation.metadata?.visibleFiltersByTab,
    };
}

function widgetShape(automation: IAutomationMetadataObjectDefinition) {
    const definition = automation.exportDefinitions?.find(hasWidgetPayload);
    return {
        filters: definition?.requestPayload.content.filters,
        visibleFilters: automation.metadata?.visibleFilters,
    };
}

// ---------------------------------------------------------------------------
// Cases 1-2: SE dashboard schedule, no tabs
// ---------------------------------------------------------------------------

describe("scheduled-export draft filter-write equivalence — dashboard schedule, no tabs", () => {
    it("storeFilters: true — a no-op filter edit leaves the draft's filters/visibleFilters unchanged", () => {
        const dateFilter = commonDateFilter("common-date");
        const visibleDateFilter = visibleCommonDateFilter("common-date");

        // Independent seed: a hand-authored `scheduledExportToEdit` fixture, read straight off —
        // never through `onFiltersChange`/`onStoreFiltersChange` or any function they call. Edit
        // mode seeds `editedAutomation` from this object verbatim (identity forwarding), so
        // `storeFilters: true` is reached because the fixture already carries stored filters, not
        // via the checkbox toggle.
        const scheduledExportToEdit = makeScheduledExportToEdit({
            exportDefinitions: [
                toExistingExportDefinition(
                    makeDashboardExportDefinition("PDF", {
                        content: { dashboard: "dashboard-1", filters: [dateFilter] },
                    }),
                ),
            ],
            metadata: { visibleFilters: [visibleDateFilter] },
        });
        const seed = { filters: [dateFilter], visibleFilters: [visibleDateFilter] };

        const dialogContext = makeDialogContext({ scheduledExportToEdit });
        const automationsContext = makeAutomationsContext({
            availableFilters: [dateFilter],
            automationAvailableFilters: [dateFilter],
        });

        const { result } = renderHook(() => useProbe(), {
            wrapper: wrapperFor(dialogContext, automationsContext),
        });

        // Sanity: confirms the scenario (storeFilters: true, reached from the fixture, not a
        // toggle) and that the mount seeded the draft with the fixture's own values verbatim.
        expect(result.current.filters.storeFilters).toBe(true);
        expect(dashboardShape(result.current.draft.editedAutomation)).toEqual(seed);

        const selection = result.current.filters.selectedFilters;
        expect(selection).toEqual([dateFilter]);

        act(() => {
            result.current.filters.onFiltersChange(selection);
        });

        expect(dashboardShape(result.current.draft.editedAutomation)).toEqual(seed);
    });

    it("storeFilters: false — a no-op filter edit leaves the draft's filters/visibleFilters unchanged", () => {
        const dateFilter = commonDateFilter("common-date");
        const dialogContext = makeDialogContext({});
        const automationsContext = makeAutomationsContext({
            availableFilters: [dateFilter],
            automationAvailableFilters: [dateFilter],
            defaultSelectedFilters: [dateFilter],
        });

        const { result } = renderHook(() => useProbe(), {
            wrapper: wrapperFor(dialogContext, automationsContext),
        });

        expect(result.current.filters.storeFilters).toBe(false);
        const selection = result.current.filters.selectedFilters;
        const seed = dashboardShape(result.current.draft.editedAutomation);
        // storeFilters: false means nothing is persisted — confirms the fixture reaches the
        // scenario it claims to, rather than passing vacuously for an unrelated reason.
        expect(seed.filters).toBeUndefined();
        expect(seed.visibleFilters).toBeUndefined();

        act(() => {
            result.current.filters.onFiltersChange(selection);
        });

        expect(dashboardShape(result.current.draft.editedAutomation)).toEqual(seed);
    });
});

// ---------------------------------------------------------------------------
// Case 3: SE dashboard schedule, tabbed
// ---------------------------------------------------------------------------

describe("scheduled-export draft filter-write equivalence — dashboard schedule, tabbed", () => {
    it("a no-op onFiltersByTabChange leaves the draft's per-tab filters/visibleFilters unchanged", () => {
        const tab1Filter = commonDateFilter("tab1-date");
        const tab2Filter = commonDateFilter("tab2-date");
        const filtersByTab = { "tab-1": [tab1Filter], "tab-2": [tab2Filter] };
        const visibleFiltersByTab = {
            "tab-1": [visibleCommonDateFilter("tab1-date")],
            "tab-2": [visibleCommonDateFilter("tab2-date")],
        };

        // Independent seed, same rationale as case 1: a hand-authored `scheduledExportToEdit`
        // fixture read straight off, never through `onFiltersByTabChange`/`onStoreFiltersChange`.
        const scheduledExportToEdit = makeScheduledExportToEdit({
            exportDefinitions: [
                toExistingExportDefinition(
                    makeDashboardExportDefinition("PDF", {
                        content: { dashboard: "dashboard-1", filtersByTab },
                    }),
                ),
            ],
            metadata: { visibleFiltersByTab },
        });
        const seed = { filtersByTab, visibleFiltersByTab };

        const dialogContext = makeDialogContext({ scheduledExportToEdit });
        const automationsContext = makeAutomationsContext({
            tabIds: ["tab-1", "tab-2"],
            automationFiltersByTab: [tab("tab-1", tab1Filter), tab("tab-2", tab2Filter)],
        });

        const { result } = renderHook(() => useProbe(), {
            wrapper: wrapperFor(dialogContext, automationsContext),
        });

        expect(result.current.filters.storeFilters).toBe(true);
        expect(result.current.filters.filtersByTab).toBeDefined();
        expect(dashboardTabShape(result.current.draft.editedAutomation)).toEqual(seed);

        const selection = result.current.filters.editedFiltersByTab!;
        expect(selection).toEqual(filtersByTab);

        act(() => {
            result.current.filters.onFiltersByTabChange(selection);
        });

        expect(dashboardTabShape(result.current.draft.editedAutomation)).toEqual(seed);
    });
});

// ---------------------------------------------------------------------------
// Case 4: SE widget schedule, non-empty attribute selection
// ---------------------------------------------------------------------------

describe("scheduled-export draft filter-write equivalence — widget schedule, non-empty selection", () => {
    it("a no-op filter edit leaves the draft's filters/visibleFilters unchanged", () => {
        const dialogContext = makeDialogContext({
            widget: SENTINEL_WIDGET,
            insight: SENTINEL_INSIGHT,
            hiddenFilters: [],
        });
        const automationsContext = makeAutomationsContext({
            availableFilters: [NEXT_FILTER],
            automationAvailableFilters: [NEXT_FILTER],
            defaultSelectedFilters: [NEXT_FILTER],
        });

        const { result } = renderHook(() => useProbe(), {
            wrapper: wrapperFor(dialogContext, automationsContext),
        });

        const selection = result.current.filters.selectedFilters;
        expect(selection.length).toBeGreaterThan(0);

        const seed = widgetShape(result.current.draft.editedAutomation);
        expect(seed.filters?.length).toBeGreaterThan(0);
        expect(seed.visibleFilters?.length).toBeGreaterThan(0);

        act(() => {
            result.current.filters.onFiltersChange(selection);
        });

        expect(widgetShape(result.current.draft.editedAutomation)).toEqual(seed);
    });
});

// ---------------------------------------------------------------------------
// Case 5: SE widget schedule, EMPTY selection — pins the known asymmetry verbatim (do not "fix"):
// the mount seeds a draft that OMITS `content.filters` entirely (no filters were ever selected, so
// the new-automation constructor only adds the key when there is something non-empty to store —
// see `newWidgetExportDefinitionMetadataObjectDefinition`'s `(dashboardFilters ?? []).length > 0`
// gate), while `onFiltersChange` unconditionally assigns `content.filters = appliedFilters`, which
// for an empty selection is `[]`. Scoping doc F5.
// ---------------------------------------------------------------------------

describe("scheduled-export draft filter-write equivalence — widget schedule, EMPTY selection (F5 asymmetry)", () => {
    it("mount seeds a draft with no `filters` key; a no-op filter edit introduces `filters: []`", () => {
        const dialogContext = makeDialogContext({
            widget: SENTINEL_WIDGET,
            insight: SENTINEL_INSIGHT,
            hiddenFilters: [],
        });
        const automationsContext = makeAutomationsContext({
            availableFilters: [],
            automationAvailableFilters: [],
            defaultSelectedFilters: [],
        });

        const { result } = renderHook(() => useProbe(), {
            wrapper: wrapperFor(dialogContext, automationsContext),
        });

        const selection = result.current.filters.selectedFilters;
        expect(selection).toEqual([]);

        const seed = widgetShape(result.current.draft.editedAutomation);
        // Pinned pre-existing master behavior (scoping doc F5): an empty selection is not stored at
        // all on mount ...
        expect(seed.filters).toBeUndefined();
        expect(seed.visibleFilters).toEqual([]);

        act(() => {
            result.current.filters.onFiltersChange(selection);
        });

        const afterNoopEdit = widgetShape(result.current.draft.editedAutomation);
        // ... but the very same no-op edit writes it as an explicit empty array. This is the
        // asymmetry the guard pins, not fixes.
        expect(afterNoopEdit.filters).toEqual([]);
        expect(afterNoopEdit.visibleFilters).toEqual([]);
    });
});
