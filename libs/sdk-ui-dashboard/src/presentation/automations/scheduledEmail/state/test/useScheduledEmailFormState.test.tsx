// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IAutomationRecipient,
    type IAutomationVisibleFilter,
    type IDashboardExportParameter,
    type IFilter,
    type IInsight,
    type INotificationChannelIdentifier,
    type IWidget,
    idRef,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()). We use
// vi.fn() inline and retrieve spies via vi.mocked() after the import statements.
// ---------------------------------------------------------------------------

const { mockUseAutomationsContext, mockUseScheduledEmailDialogContext } = vi.hoisted(() => ({
    mockUseAutomationsContext: vi.fn(),
    mockUseScheduledEmailDialogContext: vi.fn(),
}));

vi.mock("../../../contexts/AutomationsContext.js", () => ({
    useAutomationsContext: mockUseAutomationsContext,
}));

vi.mock("../../../contexts/ScheduledEmailDialogContext.js", () => ({
    useScheduledEmailDialogContext: mockUseScheduledEmailDialogContext,
}));

vi.mock("../../utils/date.js", async (importOriginal: () => Promise<Record<string, unknown>>) => {
    const actual = await importOriginal();
    return {
        ...actual,
        toModifiedISOStringToTimezone: vi.fn(),
        toNormalizedFirstRunAndCron: vi.fn(),
    };
});

vi.mock(
    "../../../shared/utils/automationUtils.js",
    async (importOriginal: () => Promise<Record<string, unknown>>) => {
        const actual = await importOriginal();
        return {
            ...actual,
            convertExternalRecipientToAutomationRecipient: vi.fn(),
            convertUserToAutomationRecipient: vi.fn(),
        };
    },
);

vi.mock("../exportDefinitions.js", () => ({
    newDashboardExportDefinitionMetadataObjectDefinition: vi.fn(),
    newWidgetExportDefinitionMetadataObjectDefinition: vi.fn(),
}));

vi.mock("../../../../../_staging/automation/index.js", () => ({
    setExportParametersByTab: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import { setExportParametersByTab } from "../../../../../_staging/automation/index.js";
import {
    convertExternalRecipientToAutomationRecipient,
    convertUserToAutomationRecipient,
} from "../../../shared/utils/automationUtils.js";
import * as dateModule from "../../utils/date.js";
import {
    newDashboardExportDefinitionMetadataObjectDefinition,
    newWidgetExportDefinitionMetadataObjectDefinition,
} from "../exportDefinitions.js";
import {
    useScheduledEmailFormState,
    type IUseScheduledEmailFormStateProps,
} from "../useScheduledEmailFormState.js";

// ---------------------------------------------------------------------------
// Typed spy references (resolved after import)
// ---------------------------------------------------------------------------

const toModifiedISOStringToTimezoneSpy = vi.mocked(dateModule.toModifiedISOStringToTimezone);
const toNormalizedFirstRunAndCronSpy = vi.mocked(dateModule.toNormalizedFirstRunAndCron);
const convertUserToAutomationRecipientSpy = vi.mocked(convertUserToAutomationRecipient);
const convertExternalRecipientToAutomationRecipientSpy = vi.mocked(
    convertExternalRecipientToAutomationRecipient,
);
const newDashboardExportDefinitionMetadataObjectDefinitionSpy = vi.mocked(
    newDashboardExportDefinitionMetadataObjectDefinition,
);
const newWidgetExportDefinitionMetadataObjectDefinitionSpy = vi.mocked(
    newWidgetExportDefinitionMetadataObjectDefinition,
);
const setExportParametersByTabSpy = vi.mocked(setExportParametersByTab);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SENTINEL_TIMEZONE = "Europe/Prague";
const SENTINEL_DASHBOARD_ID = "dashboard-1";
const SENTINEL_DASHBOARD_TITLE = "Dashboard Title";
const SENTINEL_FIRST_RUN = "2026-01-01T00:00:00.000Z";
const SENTINEL_CRON = "0 0 * * *";

const SENTINEL_CURRENT_USER = { ref: idRef("user1"), login: "user1" };

const SENTINEL_CONVERTED_RECIPIENT: IAutomationRecipient = {
    id: "user1",
    email: "user1@example.com",
    name: "User One",
    type: "user",
};
const SENTINEL_EXTERNAL_RECIPIENT: IAutomationRecipient = {
    id: "ext@example.com",
    email: "ext@example.com",
    name: "ext@example.com",
    type: "externalUser",
};

const SENTINEL_CHANNEL_1: INotificationChannelIdentifier = {
    type: "notificationChannel",
    destinationType: "webhook",
    id: "channel-1",
    allowedRecipients: "internal",
};
const SENTINEL_CHANNEL_2: INotificationChannelIdentifier = {
    type: "notificationChannel",
    destinationType: "webhook",
    id: "channel-2",
    allowedRecipients: "internal",
};
const SENTINEL_NOTIFICATION_CHANNELS: INotificationChannelIdentifier[] = [
    SENTINEL_CHANNEL_1,
    SENTINEL_CHANNEL_2,
];

const SENTINEL_RECIPIENTS: IAutomationRecipient[] = [
    { type: "user", id: "user-1", email: "user1@example.com" },
];

const DEFAULT_AUTOMATIONS_CONTEXT_VALUE = {
    timezone: SENTINEL_TIMEZONE,
    currentUser: SENTINEL_CURRENT_USER,
    widgetLocalIdToTabIdMap: {},
};

const DEFAULT_SCHEDULED_EMAIL_DIALOG_CONTEXT_VALUE = {
    dashboardId: SENTINEL_DASHBOARD_ID,
    dashboardTitle: SENTINEL_DASHBOARD_TITLE,
};

// Fully typed IWidget/IInsight fixtures (mirrors useScheduledEmailExportSettings.test.tsx).
const SENTINEL_WIDGET: IWidget = {
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

const SENTINEL_INSIGHT: IInsight = {
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

function makeAutomation(overrides: Partial<IAutomationMetadataObject> = {}): IAutomationMetadataObject {
    return {
        type: "automation",
        ref: idRef("automation-1"),
        id: "automation-1",
        uri: "/automation-1",
        title: "Original title",
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        notificationChannel: "channel-1",
        recipients: [],
        evaluationMode: "PER_RECIPIENT",
        schedule: { cron: "0 0 * * *", firstRun: "2026-01-01T00:00:00Z", timezone: SENTINEL_TIMEZONE },
        details: { subject: "Original subject", message: "Original message" },
        ...overrides,
    };
}

function fakeAttributeFilter(localIdentifier: string): IFilter {
    return newPositiveAttributeFilter(idRef(`df-${localIdentifier}`), ["v1"], localIdentifier);
}

function fakeFilterContextItem(localIdentifier: string): FilterContextItem {
    return {
        attributeFilter: {
            displayForm: idRef(`df-${localIdentifier}`),
            negativeSelection: false,
            attributeElements: { values: [] },
            localIdentifier,
        },
    };
}

function fakeVisibleFilter(localIdentifier: string): IAutomationVisibleFilter {
    return { localIdentifier };
}

const SENTINEL_WIDGET_EXPORT_DEFINITION = {
    type: "exportDefinition" as const,
    title: "Widget export",
    requestPayload: {
        type: "visualizationObject" as const,
        fileName: "Widget",
        format: "PNG" as const,
        content: { visualizationObject: "insight-1" },
    },
};

const SENTINEL_DASHBOARD_EXPORT_DEFINITION = {
    type: "exportDefinition" as const,
    title: "Dashboard export",
    requestPayload: {
        type: "dashboard" as const,
        fileName: "Dashboard",
        format: "PDF" as const,
        content: { dashboard: SENTINEL_DASHBOARD_ID },
    },
};

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();

    mockUseAutomationsContext.mockReturnValue(DEFAULT_AUTOMATIONS_CONTEXT_VALUE);
    mockUseScheduledEmailDialogContext.mockReturnValue(DEFAULT_SCHEDULED_EMAIL_DIALOG_CONTEXT_VALUE);

    // `.iso` must stay a real ISO string (not just a distinguishable stub) because `startDate` is now
    // a per-render derivation of `editedAutomation.schedule?.firstRun` via the real (unmocked)
    // toNormalizedStartDate — a bogus, unparsable value here would blow up on the render after
    // onRecurrenceChange runs.
    toModifiedISOStringToTimezoneSpy.mockImplementation((date: Date) => ({
        date,
        iso: date.toISOString(),
    }));
    toNormalizedFirstRunAndCronSpy.mockReturnValue({
        normalizedFirstRun: new Date(SENTINEL_FIRST_RUN),
        firstRun: SENTINEL_FIRST_RUN,
        cron: SENTINEL_CRON,
    });

    convertUserToAutomationRecipientSpy.mockReturnValue(SENTINEL_CONVERTED_RECIPIENT);
    convertExternalRecipientToAutomationRecipientSpy.mockReturnValue(SENTINEL_EXTERNAL_RECIPIENT);

    newDashboardExportDefinitionMetadataObjectDefinitionSpy.mockReturnValue(
        SENTINEL_DASHBOARD_EXPORT_DEFINITION,
    );
    newWidgetExportDefinitionMetadataObjectDefinitionSpy.mockReturnValue(SENTINEL_WIDGET_EXPORT_DEFINITION);
    setExportParametersByTabSpy.mockImplementation((automation) => automation);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_PROPS: IUseScheduledEmailFormStateProps = {
    scheduledExportToEdit: undefined,
    widget: undefined,
    insight: undefined,
    notificationChannels: SENTINEL_NOTIFICATION_CHANNELS,
    externalRecipientOverride: undefined,
    effectiveWidgetFilters: [],
    effectiveWidgetFiltersWithInsight: [],
    effectiveVisibleWidgetFilters: undefined,
    effectiveDashboardFilters: undefined,
    effectiveDashboardFiltersByTab: undefined,
    effectiveVisibleDashboardFilters: undefined,
    effectiveVisibleDashboardFiltersByTab: undefined,
    parametersByTabForNewAutomation: undefined,
    defaultPdfPageSize: undefined,
};

function renderFormStateHook(props: Partial<IUseScheduledEmailFormStateProps> = {}) {
    const mergedProps: IUseScheduledEmailFormStateProps = { ...BASE_PROPS, ...props };
    return renderHook(() => useScheduledEmailFormState(mergedProps));
}

// ---------------------------------------------------------------------------
// Case 1: each handler patches the right field via the internally-owned state
// (edit mode via scheduledExportToEdit gives a deterministic starting draft).
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormState — field/message handler patches", () => {
    it("onTitleChange patches title", () => {
        const { result, rerender } = renderFormStateHook({ scheduledExportToEdit: makeAutomation() });

        act(() => {
            result.current.onTitleChange("New title");
        });
        rerender();

        expect(result.current.editedAutomation.title).toBe("New title");
    });

    it("onEvaluationModeChange maps isShared to SHARED", () => {
        const { result, rerender } = renderFormStateHook({ scheduledExportToEdit: makeAutomation() });

        act(() => {
            result.current.onEvaluationModeChange(true);
        });
        rerender();

        expect(result.current.editedAutomation.evaluationMode).toBe("SHARED");
    });

    it("onEvaluationModeChange maps !isShared to PER_RECIPIENT", () => {
        const { result, rerender } = renderFormStateHook({
            scheduledExportToEdit: makeAutomation({ evaluationMode: "SHARED" }),
        });

        act(() => {
            result.current.onEvaluationModeChange(false);
        });
        rerender();

        expect(result.current.editedAutomation.evaluationMode).toBe("PER_RECIPIENT");
    });

    it("onDestinationChange patches notificationChannel", () => {
        const { result, rerender } = renderFormStateHook({ scheduledExportToEdit: makeAutomation() });

        act(() => {
            result.current.onDestinationChange("channel-2");
        });
        rerender();

        expect(result.current.editedAutomation.notificationChannel).toBe("channel-2");
    });

    it("onRecipientsChange patches recipients", () => {
        const { result, rerender } = renderFormStateHook({ scheduledExportToEdit: makeAutomation() });

        act(() => {
            result.current.onRecipientsChange(SENTINEL_RECIPIENTS);
        });
        rerender();

        expect(result.current.editedAutomation.recipients).toBe(SENTINEL_RECIPIENTS);
    });

    it("onSubjectChange patches details.subject (preserving the existing `value as string` cast)", () => {
        const { result, rerender } = renderFormStateHook({ scheduledExportToEdit: makeAutomation() });

        act(() => {
            result.current.onSubjectChange("New subject", true);
        });
        rerender();

        expect(result.current.editedAutomation.details?.subject).toBe("New subject");
        expect(result.current.editedAutomation.details?.message).toBe("Original message");
    });

    it("onMessageChange patches details.message", () => {
        const { result, rerender } = renderFormStateHook({ scheduledExportToEdit: makeAutomation() });

        act(() => {
            result.current.onMessageChange("New message", true);
        });
        rerender();

        expect(result.current.editedAutomation.details?.message).toBe("New message");
        expect(result.current.editedAutomation.details?.subject).toBe("Original subject");
    });

    it("onRecurrenceChange patches schedule.cron and schedule.firstRun", () => {
        const { result, rerender } = renderFormStateHook({ scheduledExportToEdit: makeAutomation() });
        const startDate = new Date("2026-02-01T10:00:00Z");

        act(() => {
            result.current.onRecurrenceChange("0 12 * * *", startDate, true);
        });
        rerender();

        expect(result.current.editedAutomation.schedule?.cron).toBe("0 12 * * *");
        expect(result.current.editedAutomation.schedule?.firstRun).toBe(startDate.toISOString());
    });
});

// ---------------------------------------------------------------------------
// Case 2: validity flags toggle and are observable in the returned hook value
// ---------------------------------------------------------------------------

// One character over the 255-character title limit the form state enforces.
const OVER_LONG_TITLE = "x".repeat(256);

describe("useScheduledEmailFormState — validity flags", () => {
    it("onTitleChange toggles isTitleValid", () => {
        const { result, rerender } = renderFormStateHook({ scheduledExportToEdit: makeAutomation() });
        expect(result.current.isTitleValid).toBe(true);

        act(() => {
            result.current.onTitleChange(OVER_LONG_TITLE);
        });
        rerender();

        expect(result.current.isTitleValid).toBe(false);

        act(() => {
            result.current.onTitleChange("y");
        });
        rerender();

        expect(result.current.isTitleValid).toBe(true);
    });

    it("onSubjectChange toggles isSubjectValid", () => {
        const { result, rerender } = renderFormStateHook({ scheduledExportToEdit: makeAutomation() });
        expect(result.current.isSubjectValid).toBe(true);

        act(() => {
            result.current.onSubjectChange("x", false);
        });
        rerender();

        expect(result.current.isSubjectValid).toBe(false);
    });

    it("onMessageChange toggles isOnMessageValid", () => {
        const { result, rerender } = renderFormStateHook({ scheduledExportToEdit: makeAutomation() });
        expect(result.current.isOnMessageValid).toBe(true);

        act(() => {
            result.current.onMessageChange("x", false);
        });
        rerender();

        expect(result.current.isOnMessageValid).toBe(false);
    });

    it("onRecurrenceChange toggles isCronValid", () => {
        const { result, rerender } = renderFormStateHook({ scheduledExportToEdit: makeAutomation() });
        expect(result.current.isCronValid).toBe(true);

        act(() => {
            result.current.onRecurrenceChange("0 0 * * *", new Date(), false);
        });
        rerender();

        expect(result.current.isCronValid).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Case 3: onRecurrenceChange computes firstRun via toModifiedISOStringToTimezone,
// including the `startDate ?? new Date()` fallback path
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormState — onRecurrenceChange firstRun computation", () => {
    it("calls toModifiedISOStringToTimezone with the given startDate and the context timezone", () => {
        const { result, rerender } = renderFormStateHook({ scheduledExportToEdit: makeAutomation() });
        const startDate = new Date("2026-03-15T08:30:00Z");

        act(() => {
            result.current.onRecurrenceChange("0 8 * * *", startDate, true);
        });
        rerender();

        expect(toModifiedISOStringToTimezoneSpy).toHaveBeenCalledWith(startDate, SENTINEL_TIMEZONE);
    });

    it("falls back to `new Date()` when startDate is null", () => {
        const fixedNow = new Date("2026-04-01T00:00:00Z");
        vi.useFakeTimers();
        vi.setSystemTime(fixedNow);

        try {
            const { result, rerender } = renderFormStateHook({ scheduledExportToEdit: makeAutomation() });

            act(() => {
                result.current.onRecurrenceChange("0 8 * * *", null, true);
            });
            rerender();

            expect(toModifiedISOStringToTimezoneSpy).toHaveBeenCalledWith(fixedNow, SENTINEL_TIMEZONE);
        } finally {
            vi.useRealTimers();
        }
    });
});

// ---------------------------------------------------------------------------
// New: startDate — a normalized view of the hook's own editedAutomation.schedule state.
// toNormalizedStartDate itself is not mocked here (only toModifiedISOStringToTimezone and
// toNormalizedFirstRunAndCron are), so these assert against the real normalization function.
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormState — startDate normalization", () => {
    it("normalizes startDate from schedule.firstRun and schedule.timezone", () => {
        const scheduledExportToEdit = makeAutomation({
            schedule: { cron: "0 0 * * *", firstRun: "2026-05-01T12:00:00Z", timezone: "Europe/Prague" },
        });

        const { result } = renderFormStateHook({ scheduledExportToEdit });

        expect(result.current.startDate).toEqual(
            dateModule.toNormalizedStartDate("2026-05-01T12:00:00Z", "Europe/Prague"),
        );
    });

    it("falls back to the current-time normalization when firstRun/timezone are undefined", () => {
        const fixedNow = new Date("2026-06-01T00:00:00Z");
        vi.useFakeTimers();
        vi.setSystemTime(fixedNow);

        try {
            const scheduledExportToEdit = makeAutomation({ schedule: { cron: "0 0 * * *" } });
            const { result } = renderFormStateHook({ scheduledExportToEdit });

            expect(result.current.startDate).toEqual(dateModule.toNormalizedStartDate(undefined, undefined));
        } finally {
            vi.useRealTimers();
        }
    });
});

// ---------------------------------------------------------------------------
// New (part 2): draft init — new-automation path, dashboard branch
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormState — new-automation init (dashboard branch)", () => {
    it("builds the dashboard export definition and the automation from the dashboard-branch args", () => {
        const effectiveDashboardFilters: FilterContextItem[] = [fakeFilterContextItem("f1")];
        const effectiveDashboardFiltersByTab: Record<string, FilterContextItem[]> = {
            tab1: [fakeFilterContextItem("f1")],
        };
        const effectiveVisibleDashboardFilters: IAutomationVisibleFilter[] = [fakeVisibleFilter("f1")];
        const effectiveVisibleDashboardFiltersByTab: Record<string, IAutomationVisibleFilter[]> = {
            tab1: [fakeVisibleFilter("f1")],
        };

        const { result } = renderFormStateHook({
            effectiveDashboardFilters,
            effectiveDashboardFiltersByTab,
            effectiveVisibleDashboardFilters,
            effectiveVisibleDashboardFiltersByTab,
            defaultPdfPageSize: "A4",
        });

        expect(newDashboardExportDefinitionMetadataObjectDefinitionSpy).toHaveBeenCalledWith({
            dashboardId: SENTINEL_DASHBOARD_ID,
            dashboardTitle: SENTINEL_DASHBOARD_TITLE,
            dashboardFilters: effectiveDashboardFilters,
            filtersByTab: effectiveDashboardFiltersByTab,
            format: "PDF",
        });
        expect(newWidgetExportDefinitionMetadataObjectDefinitionSpy).not.toHaveBeenCalled();
        expect(setExportParametersByTabSpy).not.toHaveBeenCalled();

        const automation = result.current.editedAutomation;
        expect(automation.type).toBe("automation");
        expect(automation.notificationChannel).toBe(SENTINEL_CHANNEL_1.id);
        expect(automation.recipients).toEqual([SENTINEL_CONVERTED_RECIPIENT]);
        expect(automation.evaluationMode).toBe("PER_RECIPIENT");
        expect(automation.dashboard).toEqual({ id: SENTINEL_DASHBOARD_ID });
        expect(automation.schedule?.timezone).toBe(SENTINEL_TIMEZONE);
        expect(automation.schedule?.cron).toBe(SENTINEL_CRON);
        expect(automation.schedule?.firstRun).toBe(SENTINEL_FIRST_RUN);
        expect(automation.metadata?.visibleFilters).toBe(effectiveVisibleDashboardFilters);
        expect(automation.metadata?.visibleFiltersByTab).toBe(effectiveVisibleDashboardFiltersByTab);
        expect(automation.metadata?.targetTabIdentifier).toBeUndefined();
        expect(automation.exportDefinitions).toEqual([{ ...SENTINEL_DASHBOARD_EXPORT_DEFINITION }]);
    });
});

// ---------------------------------------------------------------------------
// New (part 2): draft init — new-automation path, widget branch
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormState — new-automation init (widget branch)", () => {
    it("builds the widget export definition and the automation from the widget-branch args", () => {
        const effectiveWidgetFilters: IFilter[] = [fakeAttributeFilter("wf1")];
        const effectiveWidgetFiltersWithInsight: IFilter[] = [fakeAttributeFilter("wf1-insight")];
        const effectiveVisibleWidgetFilters: IAutomationVisibleFilter[] = [fakeVisibleFilter("wf1")];
        const effectiveDashboardFilters: FilterContextItem[] = [fakeFilterContextItem("df1")];

        mockUseAutomationsContext.mockReturnValue({
            ...DEFAULT_AUTOMATIONS_CONTEXT_VALUE,
            widgetLocalIdToTabIdMap: { w1: "tab-1" },
        });

        const { result } = renderFormStateHook({
            widget: SENTINEL_WIDGET,
            insight: SENTINEL_INSIGHT,
            effectiveWidgetFilters,
            effectiveWidgetFiltersWithInsight,
            effectiveVisibleWidgetFilters,
            effectiveDashboardFilters,
            defaultPdfPageSize: "A4",
        });

        expect(newWidgetExportDefinitionMetadataObjectDefinitionSpy).toHaveBeenCalledWith({
            insight: SENTINEL_INSIGHT,
            widget: SENTINEL_WIDGET,
            dashboardId: SENTINEL_DASHBOARD_ID,
            format: "PNG",
            widgetFilters: effectiveWidgetFilters,
            widgetFiltersWithInsight: effectiveWidgetFiltersWithInsight,
            dashboardFilters: effectiveDashboardFilters,
            defaultPdfPageSize: "A4",
        });
        expect(newDashboardExportDefinitionMetadataObjectDefinitionSpy).not.toHaveBeenCalled();

        const automation = result.current.editedAutomation;
        expect(automation.metadata?.visibleFilters).toBe(effectiveVisibleWidgetFilters);
        expect(automation.metadata?.targetTabIdentifier).toBe("tab-1");
        expect(automation.exportDefinitions).toEqual([{ ...SENTINEL_WIDGET_EXPORT_DEFINITION }]);
    });
});

// ---------------------------------------------------------------------------
// New: targetTabId resolution — read from widgetLocalIdToTabIdMap (AutomationsContext)
// directly in this hook now, keyed off the widget's localIdentifier.
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormState — targetTabId resolution", () => {
    it("resolves targetTabId from widgetLocalIdToTabIdMap when the widget's tab is mapped", () => {
        mockUseAutomationsContext.mockReturnValue({
            ...DEFAULT_AUTOMATIONS_CONTEXT_VALUE,
            widgetLocalIdToTabIdMap: { w1: "tab-mapped" },
        });

        const { result } = renderFormStateHook({ widget: SENTINEL_WIDGET, insight: SENTINEL_INSIGHT });

        expect(result.current.editedAutomation.metadata?.targetTabIdentifier).toBe("tab-mapped");
    });

    it("leaves targetTabId undefined when the widget's tab is not in the map", () => {
        mockUseAutomationsContext.mockReturnValue({
            ...DEFAULT_AUTOMATIONS_CONTEXT_VALUE,
            widgetLocalIdToTabIdMap: { "some-other-widget": "tab-x" },
        });

        const { result } = renderFormStateHook({ widget: SENTINEL_WIDGET, insight: SENTINEL_INSIGHT });

        expect(result.current.editedAutomation.metadata?.targetTabIdentifier).toBeUndefined();
    });

    it("leaves targetTabId undefined when there is no widget", () => {
        mockUseAutomationsContext.mockReturnValue({
            ...DEFAULT_AUTOMATIONS_CONTEXT_VALUE,
            widgetLocalIdToTabIdMap: { w1: "tab-mapped" },
        });

        const { result } = renderFormStateHook({ widget: undefined, insight: undefined });

        expect(result.current.editedAutomation.metadata?.targetTabIdentifier).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// New (part 2): draft init — parametersByTab is threaded through setExportParametersByTab
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormState — new-automation init (parametersByTab)", () => {
    it("calls setExportParametersByTab with the built automation and parametersByTabForNewAutomation", () => {
        const parametersByTabForNewAutomation: Record<string, IDashboardExportParameter[]> = {
            tab1: [{ id: "topN", value: "5", title: "Top N" }],
        };
        const sentinelResult = makeAutomation({ title: "seeded-with-parameters" });
        setExportParametersByTabSpy.mockReturnValue(sentinelResult);

        const { result } = renderFormStateHook({ parametersByTabForNewAutomation });

        expect(setExportParametersByTabSpy).toHaveBeenCalledWith(
            expect.objectContaining({ type: "automation", notificationChannel: SENTINEL_CHANNEL_1.id }),
            parametersByTabForNewAutomation,
        );
        expect(result.current.editedAutomation).toBe(sentinelResult);
    });

    it("does not call setExportParametersByTab when parametersByTabForNewAutomation is undefined", () => {
        renderFormStateHook({ parametersByTabForNewAutomation: undefined });

        expect(setExportParametersByTabSpy).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// New (part 2): draft init — edit path (scheduledExportToEdit)
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormState — edit init (scheduledExportToEdit)", () => {
    it("uses scheduledExportToEdit unchanged and does not call the new-automation factory collaborators", () => {
        const scheduledExportToEdit = makeAutomation();

        const { result } = renderFormStateHook({ scheduledExportToEdit });

        expect(result.current.editedAutomation).toBe(scheduledExportToEdit);
        expect(newDashboardExportDefinitionMetadataObjectDefinitionSpy).not.toHaveBeenCalled();
        expect(newWidgetExportDefinitionMetadataObjectDefinitionSpy).not.toHaveBeenCalled();
        expect(setExportParametersByTabSpy).not.toHaveBeenCalled();
    });
});

describe("useScheduledEmailFormState — lazy draft initialization", () => {
    it("builds the new-automation draft once, not on every render", () => {
        const { rerender } = renderFormStateHook();

        rerender();
        rerender();

        expect(newDashboardExportDefinitionMetadataObjectDefinitionSpy).toHaveBeenCalledTimes(1);
        expect(toNormalizedFirstRunAndCronSpy).toHaveBeenCalledTimes(1);
    });
});

// ---------------------------------------------------------------------------
// New (part 2): originalAutomation stability
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormState — originalAutomation stability", () => {
    it("equals the initial editedAutomation and does not change after a handler mutates the draft", () => {
        const scheduledExportToEdit = makeAutomation();
        const { result, rerender } = renderFormStateHook({ scheduledExportToEdit });

        expect(result.current.originalAutomation).toBe(scheduledExportToEdit);
        expect(result.current.editedAutomation).toBe(scheduledExportToEdit);

        act(() => {
            result.current.onTitleChange("changed");
        });
        rerender();

        expect(result.current.editedAutomation).not.toBe(scheduledExportToEdit);
        expect(result.current.originalAutomation).toBe(scheduledExportToEdit);
    });

    it("captures the new-automation draft and stays stable across renders", () => {
        const { result, rerender } = renderFormStateHook();
        const initialAutomation = result.current.editedAutomation;

        expect(result.current.originalAutomation).toBe(initialAutomation);

        act(() => {
            result.current.onTitleChange("changed");
        });
        rerender();

        expect(result.current.editedAutomation).not.toBe(initialAutomation);
        expect(result.current.originalAutomation).toBe(initialAutomation);
    });
});

// ---------------------------------------------------------------------------
// New (part 2): default values
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormState — defaults", () => {
    it("threads notificationChannels[0]?.id as the new automation's notificationChannel", () => {
        const { result } = renderFormStateHook();

        expect(result.current.editedAutomation.notificationChannel).toBe(SENTINEL_CHANNEL_1.id);
    });

    it("derives defaultRecipient from convertExternalRecipientToAutomationRecipient when externalRecipientOverride is set", () => {
        const { result } = renderFormStateHook({ externalRecipientOverride: "ext@example.com" });

        expect(convertExternalRecipientToAutomationRecipientSpy).toHaveBeenCalledWith("ext@example.com");
        expect(result.current.defaultRecipient).toBe(SENTINEL_EXTERNAL_RECIPIENT);
    });

    it("derives defaultRecipient from convertUserToAutomationRecipient when there is no override", () => {
        const { result } = renderFormStateHook();

        expect(convertUserToAutomationRecipientSpy).toHaveBeenCalledWith(SENTINEL_CURRENT_USER);
        expect(result.current.defaultRecipient).toBe(SENTINEL_CONVERTED_RECIPIENT);
    });

    it("derives defaultUser from convertUserToAutomationRecipient", () => {
        const { result } = renderFormStateHook({ externalRecipientOverride: "ext@example.com" });

        expect(convertUserToAutomationRecipientSpy).toHaveBeenCalledWith(SENTINEL_CURRENT_USER);
        expect(result.current.defaultUser).toBe(SENTINEL_CONVERTED_RECIPIENT);
    });

    it("selects the widget branch (PNG export def) only when both widget and insight are present", () => {
        renderFormStateHook({ widget: SENTINEL_WIDGET, insight: undefined });

        expect(newWidgetExportDefinitionMetadataObjectDefinitionSpy).not.toHaveBeenCalled();
        expect(newDashboardExportDefinitionMetadataObjectDefinitionSpy).toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// Referential stability
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormState — referential stability", () => {
    beforeEach(() => {
        // A fresh object per call, as the real converters return. The shared sentinel the other
        // cases use would make the identity assertions below hold with no memoization at all.
        convertUserToAutomationRecipientSpy.mockImplementation(() => ({ ...SENTINEL_CONVERTED_RECIPIENT }));
        convertExternalRecipientToAutomationRecipientSpy.mockImplementation(() => ({
            ...SENTINEL_EXTERNAL_RECIPIENT,
        }));
    });

    it("keeps defaultUser and defaultRecipient identical across a rerender", () => {
        const { result, rerender } = renderFormStateHook();
        const firstUser = result.current.defaultUser;
        const firstRecipient = result.current.defaultRecipient;

        rerender();

        expect(result.current.defaultUser).toBe(firstUser);
        expect(result.current.defaultRecipient).toBe(firstRecipient);
    });

    it("keeps defaultRecipient distinct from defaultUser under an external recipient override", () => {
        const { result } = renderFormStateHook({ externalRecipientOverride: "ext@example.com" });

        expect(result.current.defaultRecipient).not.toBe(result.current.defaultUser);
        expect(result.current.defaultRecipient.type).toBe("externalUser");
    });

    it("keeps every draft mutator identical across a rerender", () => {
        const { result, rerender } = renderFormStateHook();
        const before = {
            onTitleChange: result.current.onTitleChange,
            onRecurrenceChange: result.current.onRecurrenceChange,
            onEvaluationModeChange: result.current.onEvaluationModeChange,
            onDestinationChange: result.current.onDestinationChange,
            onRecipientsChange: result.current.onRecipientsChange,
            onSubjectChange: result.current.onSubjectChange,
            onMessageChange: result.current.onMessageChange,
        };

        rerender();

        expect(result.current.onTitleChange).toBe(before.onTitleChange);
        expect(result.current.onRecurrenceChange).toBe(before.onRecurrenceChange);
        expect(result.current.onEvaluationModeChange).toBe(before.onEvaluationModeChange);
        expect(result.current.onDestinationChange).toBe(before.onDestinationChange);
        expect(result.current.onRecipientsChange).toBe(before.onRecipientsChange);
        expect(result.current.onSubjectChange).toBe(before.onSubjectChange);
        expect(result.current.onMessageChange).toBe(before.onMessageChange);
    });

    it("keeps the mutators identical across a draft edit, so a keystroke does not rebuild them", () => {
        const { result } = renderFormStateHook();
        const firstOnTitleChange = result.current.onTitleChange;

        act(() => {
            result.current.onTitleChange("typed");
        });

        expect(result.current.editedAutomation.title).toBe("typed");
        expect(result.current.onTitleChange).toBe(firstOnTitleChange);
    });
});

// ---------------------------------------------------------------------------
// Schedule timezone source — the "Starts on" section takes the context timezone
// (which useBuildAutomationsContext resolves with the custom dashboard timezone
// winning over the workspace setting) for new schedules, while an existing
// schedule keeps interpreting dates in the timezone it was created with.
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormState — schedule timezone source", () => {
    it("uses the context timezone for a new schedule", () => {
        const { result } = renderFormStateHook();

        expect(result.current.editedAutomation.schedule?.timezone).toBe(SENTINEL_TIMEZONE);
        expect(toNormalizedFirstRunAndCronSpy).toHaveBeenCalledWith(SENTINEL_TIMEZONE);
    });

    it("keeps the stored schedule timezone for firstRun conversion when editing", () => {
        mockUseAutomationsContext.mockReturnValue({
            ...DEFAULT_AUTOMATIONS_CONTEXT_VALUE,
            timezone: "America/New_York",
        });
        const scheduledExportToEdit = makeAutomation({
            schedule: { cron: "0 0 * * *", firstRun: "2026-05-01T12:00:00Z", timezone: "Europe/Prague" },
        });
        const { result } = renderFormStateHook({ scheduledExportToEdit });
        const startDate = new Date("2026-03-15T08:30:00Z");

        act(() => {
            result.current.onRecurrenceChange("0 8 * * *", startDate, true);
        });

        expect(toModifiedISOStringToTimezoneSpy).toHaveBeenCalledWith(startDate, "Europe/Prague");
    });
});
