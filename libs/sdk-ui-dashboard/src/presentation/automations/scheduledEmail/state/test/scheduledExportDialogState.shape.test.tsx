// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type FilterContextItem,
    type ISettings,
    idRef,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";

import type { IAutomationFiltersTab } from "../../../../../model/store/filtering/types.js";
import type * as AutomationFiltersSelectModule from "../../../shared/automationFilters/useAutomationFiltersSelect.js";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()).
//
// `useAutomationFiltersSelect`, `useValidateExistingAutomationFilters` and
// `useAutomationExportParameters` are the three shared, store-backed read hooks the provider
// composes — mocked because none of them is wired to a real dashboard Redux store here.
// `AutomationsContext` and `ScheduledEmailDialogContext` are NOT mocked: this file renders through
// their real providers. Everything else the provider composes runs for real, because the seeding
// assertions exist to exercise the real computation.
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

vi.mock("../../../shared/automationFilters/useAutomationFiltersSelect.js", async (importOriginal) => {
    const actual = await importOriginal<typeof AutomationFiltersSelectModule>();
    return { ...actual, useAutomationFiltersSelect: mockUseAutomationFiltersSelect };
});

vi.mock("../../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

vi.mock("../../../shared/automationFilters/useAutomationExportParameters.js", () => ({
    useAutomationExportParameters: mockUseAutomationExportParameters,
}));

vi.mock("../../DefaultScheduledEmailDialog/hooks/useScheduleValidation.js", () => ({
    useScheduleValidation: () => ({ isValid: true }),
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import { IntlWrapper } from "../../../../localization/IntlWrapper.js";
import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../../contexts/AutomationsContext.js";
import {
    type IScheduledEmailDialogContextValue,
    ScheduledEmailDialogContextProvider,
} from "../../../contexts/ScheduledEmailDialogContext.js";
import { ScheduledEmailDialogStateProvider } from "../ScheduledEmailDialogStateProvider.js";
import { useScheduledExportActions } from "../ScheduledExportActionsContext.js";
import { useScheduledExportData } from "../ScheduledExportDataContext.js";
import { useScheduledExportDraft } from "../ScheduledExportDraftContext.js";
import { useScheduledExportFilters } from "../ScheduledExportFiltersContext.js";
import { useScheduledExportAttachments } from "../useScheduledExportAttachments.js";
import { useScheduledExportDialogValidity } from "../useScheduledExportDialogValidity.js";

import {
    AUTOMATIONS_CONTEXT,
    SCHEDULED_EMAIL_DIALOG_CONTEXT,
    SENTINEL_INSIGHT,
    SENTINEL_WIDGET,
} from "./fixtures.js";

const DRAFT_MEMBERS = [
    "canSelectScheduleTimezone",
    "defaultResolvedTimezone",
    "editedAutomation",
    "isCronValid",
    "isOnMessageValid",
    "isSubjectValid",
    "isTimezoneFeatureEnabled",
    "isTitleValid",
    "originalAutomation",
    "scheduleTimezoneIsStale",
    "scheduleTimezoneSelection",
    "startDate",
];

const ACTIONS_MEMBERS = [
    "applyCurrentScheduleTimezone",
    "onCsvRawSettingsChange",
    "onCsvSettingsChange",
    "onDashboardAttachmentsChange",
    "onDestinationChange",
    "onEvaluationModeChange",
    "onMessageChange",
    "onPdfSettingsChange",
    "onRecipientsChange",
    "onRecurrenceChange",
    "onScheduleTimezoneChange",
    "onSlidesTemplateIdChange",
    "onSubjectChange",
    "onTitleChange",
    "onWidgetAttachmentsChange",
    "onXlsxSettingsChange",
    "setEditedAutomation",
];

const DATA_MEMBERS = ["defaultRecipient", "defaultUser"];

const FILTERS_MEMBERS = [
    "applyLatest",
    "automationIsValid",
    "availableFilters",
    "availableParametersByTab",
    "editedFiltersByTab",
    "filtersAreStale",
    "filtersByTab",
    "flatTabId",
    "onApplyCurrentFilters",
    "onFiltersByTabChange",
    "onFiltersChange",
    "onParameterAdd",
    "onParameterAddByTab",
    "onParameterChange",
    "onParameterChangeByTab",
    "onParameterDelete",
    "onParameterDeleteByTab",
    "onStoreFiltersChange",
    "onStoreParametersChange",
    "parametersEnabled",
    "selectedFilters",
    "storeFilters",
    "visibleParametersByTab",
];

const ATTACHMENT_MEMBERS = [
    "csvRawSettings",
    "csvSettings",
    "isCsvExportSelected",
    "isDashboardExportSelected",
    "isXlsxExportSelected",
    "pdfSettings",
    "selectedAttachments",
    "slidesTemplateIds",
    "xlsxSettings",
];

const VALIDITY_MEMBERS = [
    "allowExternalRecipients",
    "allowOnlyLoggedUserRecipients",
    "isParentValid",
    "isSubmitDisabled",
    "validationErrorMessage",
];

// Members the dismantled bag returned that nothing reads. They must be published nowhere.
const UNPUBLISHED_MEMBERS = ["areDashboardFiltersChanged", "setParametersWire"];

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

beforeEach(() => {
    vi.clearAllMocks();
    mockAutomationFiltersSelect();
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
    });
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

/**
 * Reads every accessor a replacement for the dialog component can call, from one probe under the
 * real provider.
 */
function renderStateProbe(
    dialogOverrides: Partial<IScheduledEmailDialogContextValue> = {},
    settings?: ISettings,
) {
    const automationsContext: IAutomationsContextValue = { ...AUTOMATIONS_CONTEXT, settings };
    const dialogContext: IScheduledEmailDialogContextValue = {
        ...SCHEDULED_EMAIL_DIALOG_CONTEXT,
        ...dialogOverrides,
    };

    function wrapper({ children }: PropsWithChildren) {
        return (
            <IntlWrapper>
                <AutomationsContextProvider value={automationsContext}>
                    <ScheduledEmailDialogContextProvider value={dialogContext}>
                        <ScheduledEmailDialogStateProvider>{children}</ScheduledEmailDialogStateProvider>
                    </ScheduledEmailDialogContextProvider>
                </AutomationsContextProvider>
            </IntlWrapper>
        );
    }

    return renderHook(
        () => ({
            draft: useScheduledExportDraft(),
            actions: useScheduledExportActions(),
            data: useScheduledExportData(),
            filters: useScheduledExportFilters(),
            attachments: useScheduledExportAttachments(),
            validity: useScheduledExportDialogValidity(),
        }),
        { wrapper },
    );
}

describe("scheduled-export dialog state — published members", () => {
    it("publishes exactly the declared members on each of the four contexts", () => {
        const { result } = renderStateProbe();

        expect(Object.keys(result.current.draft).sort()).toEqual(DRAFT_MEMBERS);
        expect(Object.keys(result.current.actions).sort()).toEqual(ACTIONS_MEMBERS);
        expect(Object.keys(result.current.data).sort()).toEqual(DATA_MEMBERS);
        expect(Object.keys(result.current.filters).sort()).toEqual(FILTERS_MEMBERS);
    });

    it("keeps the attachment and validity derivations off every context", () => {
        const { result } = renderStateProbe();

        expect(Object.keys(result.current.attachments).sort()).toEqual(ATTACHMENT_MEMBERS);
        expect(Object.keys(result.current.validity).sort()).toEqual(VALIDITY_MEMBERS);

        const published = [
            ...Object.keys(result.current.draft),
            ...Object.keys(result.current.actions),
            ...Object.keys(result.current.data),
            ...Object.keys(result.current.filters),
        ];
        [...ATTACHMENT_MEMBERS, ...VALIDITY_MEMBERS].forEach((member) => {
            expect(published).not.toContain(member);
        });
    });

    it("publishes no member that has no reader", () => {
        const { result } = renderStateProbe();

        const everything = [
            ...Object.keys(result.current.draft),
            ...Object.keys(result.current.actions),
            ...Object.keys(result.current.data),
            ...Object.keys(result.current.filters),
            ...Object.keys(result.current.attachments),
            ...Object.keys(result.current.validity),
        ];
        UNPUBLISHED_MEMBERS.forEach((member) => {
            expect(everything).not.toContain(member);
        });
    });
});

describe("scheduled-export dialog state — the seeded draft", () => {
    it("seeds a new schedule's draft filters from the read model on first mount", () => {
        // Dashboard schedule (no widget/insight) so the seeded filters land in a plain
        // `content.filters`, not the widget path's per-format routing.
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

        const { result } = renderStateProbe();

        const exportDefinition = result.current.draft.editedAutomation.exportDefinitions?.[0];

        // asserted on the FIRST render — not after an act()/settle, which would hide a one-render lag
        expect(
            exportDefinition && isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload)
                ? exportDefinition.requestPayload.content.filters
                : undefined,
        ).toHaveLength(1);
    });

    it("seeds the draft's notification channel from the dialog context's first channel", () => {
        const { result } = renderStateProbe();

        expect(result.current.draft.editedAutomation.notificationChannel).toBe(
            SCHEDULED_EMAIL_DIALOG_CONTEXT.notificationChannels[0].id,
        );
    });

    it("keeps per-tab filters addressable through the filters accessor", () => {
        mockAutomationFiltersSelect({
            filtersByTab: [fakeFiltersTab("tab-1")],
            editedAutomationFiltersByTab: { "tab-1": [] },
        });

        const { result } = renderStateProbe();

        expect(result.current.filters.filtersByTab).toHaveLength(1);
        expect(result.current.filters.editedFiltersByTab).toHaveProperty("tab-1");
        expect(typeof result.current.filters.onFiltersByTabChange).toBe("function");
    });
});

describe("scheduled-export dialog state — the provider's own derivations", () => {
    it("carries the locale default page size into a newly added PDF_TABULAR export definition", () => {
        // The provider derives the page size from the workspace format locale; a US locale must not
        // fall back to the A4 default, or this passes against a provider that derives nothing.
        const { result } = renderStateProbe(
            { widget: SENTINEL_WIDGET, insight: SENTINEL_INSIGHT },
            { formatLocale: "en-US" },
        );

        act(() => {
            result.current.actions.onWidgetAttachmentsChange(["PDF_TABULAR"]);
        });

        const pdfExportDefinition = result.current.draft.editedAutomation.exportDefinitions?.find(
            (ed) =>
                isExportDefinitionVisualizationObjectRequestPayload(ed.requestPayload) &&
                ed.requestPayload.format === "PDF_TABULAR",
        );

        expect(
            pdfExportDefinition &&
                isExportDefinitionVisualizationObjectRequestPayload(pdfExportDefinition.requestPayload)
                ? pdfExportDefinition.requestPayload.settings?.pageSize
                : undefined,
        ).toBe("LETTER");
    });
});
