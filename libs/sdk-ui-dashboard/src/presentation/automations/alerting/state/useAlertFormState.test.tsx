// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import type * as ReactIntl from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IAutomationRecipient,
    type IAutomationVisibleFilter,
    type IDashboardParameter,
    type IFilter,
    type IInsight,
    type INotificationChannelIdentifier,
    type IWidget,
    idRef,
    newAttribute,
    newMeasure,
} from "@gooddata/sdk-model";

import { type AlertAttribute, type AlertMetric, AlertMetricComparatorType } from "../types.js";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them (unless created via vi.hoisted()). We use
// vi.fn() inline and retrieve spies via vi.mocked() after the import statements.
// ---------------------------------------------------------------------------

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../utils/transformation.js", async (importOriginal: () => Promise<Record<string, unknown>>) => {
    const actual = await importOriginal();
    return {
        ...actual,
        transformAlertByMetric: vi.fn(),
        transformAlertByAttribute: vi.fn(),
        transformAlertByComparisonOperator: vi.fn(),
        transformAlertByRelativeOperator: vi.fn(),
        transformAlertByAnomalyDetection: vi.fn(),
        transformAlertBySensitivity: vi.fn(),
        transformAlertByGranularity: vi.fn(),
        transformAlertByDestination: vi.fn(),
    };
});

vi.mock(
    "../../shared/utils/automationUtils.js",
    async (importOriginal: () => Promise<Record<string, unknown>>) => {
        const actual = await importOriginal();
        return {
            ...actual,
            convertExternalRecipientToAutomationRecipient: vi.fn(),
            convertUserToAutomationRecipient: vi.fn(),
        };
    },
);

vi.mock("../utils/convertors.js", async (importOriginal: () => Promise<Record<string, unknown>>) => {
    const actual = await importOriginal();
    return {
        ...actual,
        createDefaultAlert: vi.fn(),
    };
});

vi.mock(
    "../../shared/automationFilters/automationParameters.js",
    async (importOriginal: () => Promise<Record<string, unknown>>) => {
        const actual = await importOriginal();
        return {
            ...actual,
            setAlertExecutionParameters: vi.fn(),
        };
    },
);

vi.mock("../../shared/filters/index.js", async (importOriginal: () => Promise<Record<string, unknown>>) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getAppliedWidgetFilters: vi.fn(),
        getVisibleFiltersByFilters: vi.fn(),
        resolveFilterDimensionalityLocalRefs: vi.fn(),
    };
});

// Fully replaced (not partial) — this hook internally reads redux selectors via
// useDashboardSelector, which isn't wired up in these unit tests. Its own behavior is
// covered by shared/automationFilters/test/useAutomationAlertParameters.test.ts.
vi.mock("../../shared/automationFilters/useAutomationAlertParameters.js", () => ({
    useAutomationAlertParameters: vi.fn(),
}));

// Context mocks — the hook reads these via useAutomationsContext() / useAlertingDialogContext().
// vi.hoisted() is required here because the factories close over these fns, and vi.mock
// factories run before ordinary top-level const declarations.
const { mockUseAutomationsContext, mockUseAlertingDialogContext } = vi.hoisted(() => ({
    mockUseAutomationsContext: vi.fn(),
    mockUseAlertingDialogContext: vi.fn(),
}));

vi.mock("../../contexts/AutomationsContext.js", () => ({
    useAutomationsContext: mockUseAutomationsContext,
}));

vi.mock("../../contexts/AlertingDialogContext.js", () => ({
    useAlertingDialogContext: mockUseAlertingDialogContext,
}));

// formatMessage is mocked to return the descriptor id rather than resolved copy, so
// assertions below don't couple to the exact English translation text.
vi.mock("react-intl", async () => {
    const actual = await vi.importActual<typeof ReactIntl>("react-intl");
    return {
        ...actual,
        useIntl: () => ({ formatMessage: (descriptor: { id: string }) => descriptor.id }),
    };
});

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { setAlertExecutionParameters } from "../../shared/automationFilters/automationParameters.js";
import { useAutomationAlertParameters } from "../../shared/automationFilters/useAutomationAlertParameters.js";
import {
    getAppliedWidgetFilters,
    getVisibleFiltersByFilters,
    resolveFilterDimensionalityLocalRefs,
} from "../../shared/filters/index.js";
import {
    convertExternalRecipientToAutomationRecipient,
    convertUserToAutomationRecipient,
} from "../../shared/utils/automationUtils.js";
import { createDefaultAlert } from "../utils/convertors.js";
import * as transformationModule from "../utils/transformation.js";

import { useAlertFormState, type IUseAlertFormStateProps } from "./useAlertFormState.js";

// ---------------------------------------------------------------------------
// Typed spy references (resolved after import)
// ---------------------------------------------------------------------------

const transformAlertByMetricSpy = vi.mocked(transformationModule.transformAlertByMetric);
const transformAlertByAttributeSpy = vi.mocked(transformationModule.transformAlertByAttribute);
const transformAlertByComparisonOperatorSpy = vi.mocked(
    transformationModule.transformAlertByComparisonOperator,
);
const transformAlertByRelativeOperatorSpy = vi.mocked(transformationModule.transformAlertByRelativeOperator);
const transformAlertByAnomalyDetectionSpy = vi.mocked(transformationModule.transformAlertByAnomalyDetection);
const transformAlertBySensitivitySpy = vi.mocked(transformationModule.transformAlertBySensitivity);
const transformAlertByGranularitySpy = vi.mocked(transformationModule.transformAlertByGranularity);
const transformAlertByDestinationSpy = vi.mocked(transformationModule.transformAlertByDestination);
const convertUserToAutomationRecipientSpy = vi.mocked(convertUserToAutomationRecipient);
const convertExternalRecipientToAutomationRecipientSpy = vi.mocked(
    convertExternalRecipientToAutomationRecipient,
);
const createDefaultAlertSpy = vi.mocked(createDefaultAlert);
const setAlertExecutionParametersSpy = vi.mocked(setAlertExecutionParameters);
const getAppliedWidgetFiltersSpy = vi.mocked(getAppliedWidgetFilters);
const getVisibleFiltersByFiltersSpy = vi.mocked(getVisibleFiltersByFilters);
const resolveFilterDimensionalityLocalRefsSpy = vi.mocked(resolveFilterDimensionalityLocalRefs);
const useAutomationAlertParametersSpy = vi.mocked(useAutomationAlertParameters);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SENTINEL_SUPPORTED_MEASURES: AlertMetric[] = [
    {
        measure: newMeasure("m1", (m) => m.localId("m1")),
        isPrimary: true,
        comparators: [],
    },
];
const SENTINEL_SUPPORTED_ATTRIBUTES: AlertAttribute[] = [
    {
        attribute: newAttribute("a1", (a) => a.localId("a1")),
        type: "attribute",
    },
];
const SENTINEL_MEASURE: AlertMetric = {
    measure: newMeasure("m1", (m) => m.localId("m1")),
    isPrimary: true,
    comparators: [],
};
const SENTINEL_ATTRIBUTE: AlertAttribute = {
    attribute: newAttribute("a1", (a) => a.localId("a1")),
    type: "attribute",
};
const SENTINEL_MEASURE_FORMAT_MAP = { m1: "#,##0" };
const SENTINEL_WEEK_START = "Monday" as const;
const SENTINEL_TIMEZONE = "Europe/Prague";
const SENTINEL_ENABLE_ALERT_ONCE_PER_INTERVAL = false;

const SENTINEL_CHANNEL_ALL: INotificationChannelIdentifier = {
    type: "notificationChannel",
    destinationType: "webhook",
    id: "channel-all",
    allowedRecipients: "internal",
};
const SENTINEL_CHANNEL_CREATOR: INotificationChannelIdentifier = {
    type: "notificationChannel",
    destinationType: "webhook",
    id: "channel-creator",
    allowedRecipients: "creator",
};
const SENTINEL_NOTIFICATION_CHANNELS: INotificationChannelIdentifier[] = [
    SENTINEL_CHANNEL_ALL,
    SENTINEL_CHANNEL_CREATOR,
];

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

// Default context return values — mirror exactly what useAlertFormState.ts reads from these
// contexts.
const DEFAULT_AUTOMATIONS_CONTEXT_VALUE = {
    weekStart: SENTINEL_WEEK_START,
    timezone: SENTINEL_TIMEZONE,
    settings: undefined,
    currentUser: SENTINEL_CURRENT_USER,
    widgetLocalIdToTabIdMap: {} as Record<string, string>,
    features: { enableAlertOncePerInterval: SENTINEL_ENABLE_ALERT_ONCE_PER_INTERVAL },
};

const SENTINEL_DASHBOARD_PARAMETERS: IDashboardParameter[] = [
    { ref: idRef("param-1", "parameter"), mode: "active", parameterType: "STRING", value: "value-1" },
];

const DEFAULT_ALERTING_DIALOG_CONTEXT_VALUE = {
    dashboardId: undefined,
    hiddenFilters: [] as FilterContextItem[],
    commonDateFilterId: undefined,
    dashboardEvaluationFrequency: undefined,
    parameterValues: [] as unknown[],
    dashboardParameters: SENTINEL_DASHBOARD_PARAMETERS,
};

const DEFAULT_PARAMETERS_RETURN = {
    automationParameters: [],
    availableParameters: [],
    onParameterChange: vi.fn(),
    onParameterDelete: vi.fn(),
    onParameterAdd: vi.fn(),
    dropStaleParameters: vi.fn(),
};

// IAutomationMetadataObject additionally requires ref/id/uri/description/production/deprecated/unlisted;
// these are only ever compared by reference (toBe) as the mocked transform's return value, so a fully
// valid instance would add fields no assertion reads.
function makeResult(title: string): IAutomationMetadataObject {
    return {
        type: "automation",
        title,
        alert: {
            trigger: { mode: "ALWAYS", interval: "DAY" },
            execution: { filters: [] },
        },
        metadata: {},
        recipients: [],
    } as unknown as IAutomationMetadataObject;
}

// The default `editedAutomation` for a brand-new alert (default props: no alertToEdit, empty
// parameterValues) — this is what `createDefaultAlert` (mocked) returns unless a test overrides it.
const BASE_ALERT = makeResult("Test Alert");

const SENTINEL_METRIC_RESULT = makeResult("metric-transformed");
const SENTINEL_ATTRIBUTE_RESULT = makeResult("attribute-transformed");
const SENTINEL_COMPARISON_OPERATOR_RESULT = makeResult("comparison-operator-transformed");
const SENTINEL_RELATIVE_OPERATOR_RESULT = makeResult("relative-operator-transformed");
const SENTINEL_ANOMALY_RESULT = makeResult("anomaly-transformed");
const SENTINEL_SENSITIVITY_RESULT = makeResult("sensitivity-transformed");
const SENTINEL_GRANULARITY_RESULT = makeResult("granularity-transformed");
const SENTINEL_DESTINATION_RESULT = makeResult("destination-transformed");

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();

    mockUseAutomationsContext.mockReturnValue(DEFAULT_AUTOMATIONS_CONTEXT_VALUE);
    mockUseAlertingDialogContext.mockReturnValue(DEFAULT_ALERTING_DIALOG_CONTEXT_VALUE);

    transformAlertByMetricSpy.mockReturnValue(SENTINEL_METRIC_RESULT);
    transformAlertByAttributeSpy.mockReturnValue(SENTINEL_ATTRIBUTE_RESULT);
    transformAlertByComparisonOperatorSpy.mockReturnValue(SENTINEL_COMPARISON_OPERATOR_RESULT);
    transformAlertByRelativeOperatorSpy.mockReturnValue(SENTINEL_RELATIVE_OPERATOR_RESULT);
    transformAlertByAnomalyDetectionSpy.mockReturnValue(SENTINEL_ANOMALY_RESULT);
    transformAlertBySensitivitySpy.mockReturnValue(SENTINEL_SENSITIVITY_RESULT);
    transformAlertByGranularitySpy.mockReturnValue(SENTINEL_GRANULARITY_RESULT);
    transformAlertByDestinationSpy.mockReturnValue(SENTINEL_DESTINATION_RESULT);

    convertUserToAutomationRecipientSpy.mockReturnValue(SENTINEL_CONVERTED_RECIPIENT);
    convertExternalRecipientToAutomationRecipientSpy.mockReturnValue(SENTINEL_EXTERNAL_RECIPIENT);

    createDefaultAlertSpy.mockReturnValue(BASE_ALERT);
    setAlertExecutionParametersSpy.mockReturnValue(BASE_ALERT);
    getAppliedWidgetFiltersSpy.mockReturnValue([]);
    getVisibleFiltersByFiltersSpy.mockReturnValue(undefined);
    resolveFilterDimensionalityLocalRefsSpy.mockImplementation((filters) => filters);

    useAutomationAlertParametersSpy.mockReturnValue(DEFAULT_PARAMETERS_RETURN);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_PROPS: IUseAlertFormStateProps = {
    alertToEdit: undefined,
    insight: undefined,
    widget: undefined,
    notificationChannels: SENTINEL_NOTIFICATION_CHANNELS,
    editedAutomationFilters: undefined,
    availableFiltersAsVisibleFilters: undefined,
    externalRecipientOverride: undefined,
    supportedMeasures: SENTINEL_SUPPORTED_MEASURES,
    supportedAttributes: SENTINEL_SUPPORTED_ATTRIBUTES,
    measureFormatMap: SENTINEL_MEASURE_FORMAT_MAP,
};

function renderFormStateHook(props: Partial<IUseAlertFormStateProps> = {}) {
    const mergedProps: IUseAlertFormStateProps = { ...BASE_PROPS, ...props };
    return renderHook(() => useAlertFormState(mergedProps), { wrapper: IntlWrapper });
}

/** Renders the hook with a draft that starts out `undefined` (new-alert path, createDefaultAlert -> undefined). */
function renderWithUndefinedDraft(props: Partial<IUseAlertFormStateProps> = {}) {
    createDefaultAlertSpy.mockReturnValue(undefined);
    return renderFormStateHook(props);
}

// IAutomationMetadataObject additionally requires ref/id/uri/description/production/deprecated/unlisted;
// onDestinationChange only reads `notificationChannel` off alertToEdit, so a fully valid instance
// would add fields no assertion (or the code under test) reads. It also has no `.alert`, so
// resolvedAlertToEdit's short-circuit (`!alertToEdit.alert`) returns it unchanged — it becomes
// editedAutomation's initial value for these tests.
function makeAlertToEdit(notificationChannel: string): IAutomationMetadataObject {
    return { notificationChannel } as unknown as IAutomationMetadataObject;
}

// alertToEdit fixture for the resolvedAlertToEdit/originalAutomation tests: only `.alert` is read,
// so a fully valid IAutomationMetadataObject would add fields no assertion (or the code under
// test) reads.
function makeEditAlert(alert: Record<string, unknown>): IAutomationMetadataObject {
    return { alert } as unknown as IAutomationMetadataObject;
}

// Only the `id` read by resolveFilterDimensionalityLocalRefs's mock args/return-value matters here,
// not a structurally valid IFilter.
function fakeFilters(...ids: string[]): IFilter[] {
    return ids.map((id) => ({ id })) as unknown as IFilter[];
}

// Only `ref`/`localIdentifier`/`title` are read by the code under test.
function fakeWidget(overrides: { localIdentifier?: string; title?: string } = {}): IWidget {
    return { ref: { identifier: "widget-1" }, ...overrides } as unknown as IWidget;
}

// Only `localIdentifier` is read (as an opaque marker forwarded to mocked collaborators).
function fakeVisibleFilter(localIdentifier: string): IAutomationVisibleFilter {
    return { localIdentifier } as unknown as IAutomationVisibleFilter;
}

// Opaque marker forwarded verbatim to mocked collaborators — never read as a real FilterContextItem.
function fakeFilterContextItem(marker: string): FilterContextItem {
    return { x: marker } as unknown as FilterContextItem;
}

// Only `insight.identifier` is read (as an opaque marker forwarded to mocked collaborators).
const SENTINEL_INSIGHT = { insight: { identifier: "insight-1" } } as unknown as IInsight;

// ---------------------------------------------------------------------------
// Case 1: per-handler transform wiring (+ case 6 undefined-state guards inline)
// ---------------------------------------------------------------------------

describe("useAlertFormState — onMeasureChange", () => {
    it("calls transformAlertByMetric with the expected args and updates editedAutomation with its result", () => {
        const { result, rerender } = renderFormStateHook();

        act(() => {
            result.current.onMeasureChange(SENTINEL_MEASURE);
        });
        rerender();

        expect(transformAlertByMetricSpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_MEASURES,
            BASE_ALERT,
            SENTINEL_MEASURE,
            SENTINEL_MEASURE_FORMAT_MAP,
            SENTINEL_WEEK_START,
            SENTINEL_TIMEZONE,
        );
        expect(result.current.editedAutomation).toBe(SENTINEL_METRIC_RESULT);
    });

    it("is a no-op (editedAutomation stays undefined, no throw) when the draft is undefined", () => {
        const { result, rerender } = renderWithUndefinedDraft();
        expect(result.current.editedAutomation).toBeUndefined();

        act(() => {
            result.current.onMeasureChange(SENTINEL_MEASURE);
        });
        rerender();

        expect(result.current.editedAutomation).toBeUndefined();
        expect(transformAlertByMetricSpy).not.toHaveBeenCalled();
    });
});

describe("useAlertFormState — onAttributeChange", () => {
    it("calls transformAlertByAttribute with the expected args and updates editedAutomation with its result", () => {
        const { result, rerender } = renderFormStateHook();
        const value = { title: "t", value: "v", name: "n" };

        act(() => {
            result.current.onAttributeChange(SENTINEL_ATTRIBUTE, value);
        });
        rerender();

        expect(transformAlertByAttributeSpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_ATTRIBUTES,
            BASE_ALERT,
            SENTINEL_ATTRIBUTE,
            value,
        );
        expect(result.current.editedAutomation).toBe(SENTINEL_ATTRIBUTE_RESULT);
    });

    it("is a no-op (editedAutomation stays undefined, no throw) when the draft is undefined", () => {
        const { result, rerender } = renderWithUndefinedDraft();

        act(() => {
            result.current.onAttributeChange(SENTINEL_ATTRIBUTE, undefined);
        });
        rerender();

        expect(result.current.editedAutomation).toBeUndefined();
        expect(transformAlertByAttributeSpy).not.toHaveBeenCalled();
    });
});

describe("useAlertFormState — onComparisonOperatorChange", () => {
    it("calls transformAlertByComparisonOperator with the expected args and updates editedAutomation with its result", () => {
        const { result, rerender } = renderFormStateHook();

        act(() => {
            result.current.onComparisonOperatorChange(SENTINEL_MEASURE, "GREATER_THAN");
        });
        rerender();

        expect(transformAlertByComparisonOperatorSpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_MEASURES,
            BASE_ALERT,
            SENTINEL_MEASURE,
            "GREATER_THAN",
        );
        expect(result.current.editedAutomation).toBe(SENTINEL_COMPARISON_OPERATOR_RESULT);
    });

    it("is a no-op (editedAutomation stays undefined, no throw) when the draft is undefined", () => {
        const { result, rerender } = renderWithUndefinedDraft();

        act(() => {
            result.current.onComparisonOperatorChange(SENTINEL_MEASURE, "GREATER_THAN");
        });
        rerender();

        expect(result.current.editedAutomation).toBeUndefined();
        expect(transformAlertByComparisonOperatorSpy).not.toHaveBeenCalled();
    });
});

describe("useAlertFormState — onRelativeOperatorChange", () => {
    it("calls transformAlertByRelativeOperator with the expected args and updates editedAutomation with its result", () => {
        const { result, rerender } = renderFormStateHook();

        act(() => {
            result.current.onRelativeOperatorChange(SENTINEL_MEASURE, "INCREASES_BY", "CHANGE");
        });
        rerender();

        expect(transformAlertByRelativeOperatorSpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_MEASURES,
            BASE_ALERT,
            SENTINEL_MEASURE,
            "INCREASES_BY",
            "CHANGE",
            SENTINEL_MEASURE_FORMAT_MAP,
        );
        expect(result.current.editedAutomation).toBe(SENTINEL_RELATIVE_OPERATOR_RESULT);
    });

    it("is a no-op (editedAutomation stays undefined, no throw) when the draft is undefined", () => {
        const { result, rerender } = renderWithUndefinedDraft();

        act(() => {
            result.current.onRelativeOperatorChange(SENTINEL_MEASURE, "INCREASES_BY", "CHANGE");
        });
        rerender();

        expect(result.current.editedAutomation).toBeUndefined();
        expect(transformAlertByRelativeOperatorSpy).not.toHaveBeenCalled();
    });
});

describe("useAlertFormState — onComparisonTypeChange", () => {
    it("calls transformAlertByRelativeOperator with the destructured tuple + comparisonType/granularity", () => {
        const { result, rerender } = renderFormStateHook();

        act(() => {
            result.current.onComparisonTypeChange(
                SENTINEL_MEASURE,
                ["INCREASES_BY", "CHANGE"],
                AlertMetricComparatorType.PreviousPeriod,
                "GDC.time.month",
            );
        });
        rerender();

        expect(transformAlertByRelativeOperatorSpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_MEASURES,
            BASE_ALERT,
            SENTINEL_MEASURE,
            "INCREASES_BY",
            "CHANGE",
            SENTINEL_MEASURE_FORMAT_MAP,
            AlertMetricComparatorType.PreviousPeriod,
            "GDC.time.month",
        );
        expect(result.current.editedAutomation).toBe(SENTINEL_RELATIVE_OPERATOR_RESULT);
    });

    it("is a no-op when measure is undefined (guard before setEditedAutomation)", () => {
        const { result, rerender } = renderFormStateHook();

        act(() => {
            result.current.onComparisonTypeChange(
                undefined,
                ["INCREASES_BY", "CHANGE"],
                AlertMetricComparatorType.PreviousPeriod,
            );
        });
        rerender();

        expect(transformAlertByRelativeOperatorSpy).not.toHaveBeenCalled();
        expect(result.current.editedAutomation).toBe(BASE_ALERT);
    });

    it("is a no-op when relativeOperator is undefined (guard before setEditedAutomation)", () => {
        const { result, rerender } = renderFormStateHook();

        act(() => {
            result.current.onComparisonTypeChange(
                SENTINEL_MEASURE,
                undefined,
                AlertMetricComparatorType.PreviousPeriod,
            );
        });
        rerender();

        expect(transformAlertByRelativeOperatorSpy).not.toHaveBeenCalled();
        expect(result.current.editedAutomation).toBe(BASE_ALERT);
    });

    it("is a no-op (editedAutomation stays undefined, no throw) when the draft is undefined", () => {
        const { result, rerender } = renderWithUndefinedDraft();

        act(() => {
            result.current.onComparisonTypeChange(
                SENTINEL_MEASURE,
                ["INCREASES_BY", "CHANGE"],
                AlertMetricComparatorType.PreviousPeriod,
            );
        });
        rerender();

        expect(result.current.editedAutomation).toBeUndefined();
        expect(transformAlertByRelativeOperatorSpy).not.toHaveBeenCalled();
    });
});

describe("useAlertFormState — onSensitivityChange", () => {
    it("calls transformAlertBySensitivity with the expected args and updates editedAutomation with its result", () => {
        const { result, rerender } = renderFormStateHook();

        act(() => {
            result.current.onSensitivityChange("HIGH");
        });
        rerender();

        expect(transformAlertBySensitivitySpy).toHaveBeenCalledWith(BASE_ALERT, "HIGH");
        expect(result.current.editedAutomation).toBe(SENTINEL_SENSITIVITY_RESULT);
    });

    it("is a no-op (editedAutomation stays undefined, no throw) when the draft is undefined", () => {
        const { result, rerender } = renderWithUndefinedDraft();

        act(() => {
            result.current.onSensitivityChange("HIGH");
        });
        rerender();

        expect(result.current.editedAutomation).toBeUndefined();
        expect(transformAlertBySensitivitySpy).not.toHaveBeenCalled();
    });
});

describe("useAlertFormState — onTriggerModeChange", () => {
    it("merges triggerMode into alert.trigger", () => {
        const { result, rerender } = renderFormStateHook();

        act(() => {
            result.current.onTriggerModeChange("ONCE");
        });
        rerender();

        expect(result.current.editedAutomation).toMatchObject({
            alert: { trigger: { mode: "ONCE", interval: "DAY" } },
        });
    });

    it("is a no-op (editedAutomation stays undefined, no throw) when the draft is undefined", () => {
        const { result, rerender } = renderWithUndefinedDraft();

        act(() => {
            result.current.onTriggerModeChange("ONCE");
        });
        rerender();

        expect(result.current.editedAutomation).toBeUndefined();
    });
});

describe("useAlertFormState — onRecipientsChange", () => {
    it("replaces recipients", () => {
        const { result, rerender } = renderFormStateHook();
        const newRecipients: IAutomationRecipient[] = [SENTINEL_CONVERTED_RECIPIENT];

        act(() => {
            result.current.onRecipientsChange(newRecipients);
        });
        rerender();

        expect(result.current.editedAutomation).toMatchObject({ recipients: newRecipients });
    });

    it("is a no-op (editedAutomation stays undefined, no throw) when the draft is undefined", () => {
        const { result, rerender } = renderWithUndefinedDraft();

        act(() => {
            result.current.onRecipientsChange([]);
        });
        rerender();

        expect(result.current.editedAutomation).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// Case 2: onTitleChange sets isTitleValid and updates the title
// ---------------------------------------------------------------------------

// One character over the 255-character title limit the form state enforces.
const OVER_LONG_TITLE = "x".repeat(256);

describe("useAlertFormState — onTitleChange", () => {
    it("updates isTitleValid (observable in the returned hook value) and the title", () => {
        const { result, rerender } = renderFormStateHook();

        expect(result.current.isTitleValid).toBe(true);

        act(() => {
            result.current.onTitleChange(OVER_LONG_TITLE);
        });
        rerender();

        expect(result.current.isTitleValid).toBe(false);
        expect(result.current.editedAutomation).toMatchObject({ title: OVER_LONG_TITLE });

        act(() => {
            result.current.onTitleChange("Another title");
        });
        rerender();

        expect(result.current.isTitleValid).toBe(true);
    });

    it("is a no-op on the automation state (stays undefined, no throw) when the draft is undefined", () => {
        const { result, rerender } = renderWithUndefinedDraft();

        act(() => {
            result.current.onTitleChange("x");
        });
        rerender();

        expect(result.current.editedAutomation).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// Handler identity across renders
// ---------------------------------------------------------------------------

describe("useAlertFormState — handler identity", () => {
    it("keeps onTitleChange identical across a rerender with unchanged inputs", () => {
        const { result, rerender } = renderFormStateHook();
        const first = result.current.onTitleChange;

        rerender();

        expect(result.current.onTitleChange).toBe(first);
    });

    it("still updates the title and validity through the stabilized handler", () => {
        const { result, rerender } = renderFormStateHook();

        act(() => {
            result.current.onTitleChange(OVER_LONG_TITLE);
        });
        rerender();

        expect(result.current.editedAutomation?.title).toBe(OVER_LONG_TITLE);
        expect(result.current.isTitleValid).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Case 3: onDestinationChange — warning message + recipient reset
// ---------------------------------------------------------------------------

describe("useAlertFormState — onDestinationChange", () => {
    it("sets warningMessage and resets recipients when switching TO a creator-only channel FROM a non-creator one", () => {
        const editAlert = makeAlertToEdit("channel-all");
        const { result, rerender } = renderFormStateHook({ alertToEdit: editAlert });
        // Isolate the action's own calls from the defaultRecipient computation at render time.
        convertUserToAutomationRecipientSpy.mockClear();

        act(() => {
            result.current.onDestinationChange("channel-creator");
        });
        rerender();

        expect(result.current.warningMessage).toBe("insightAlert.config.warning.destination");
        expect(convertUserToAutomationRecipientSpy).toHaveBeenCalledWith(SENTINEL_CURRENT_USER);
        expect(transformAlertByDestinationSpy).toHaveBeenCalledWith(editAlert, "channel-creator", [
            SENTINEL_CONVERTED_RECIPIENT,
        ]);
        expect(result.current.editedAutomation).toBe(SENTINEL_DESTINATION_RESULT);
    });

    it("leaves warningMessage undefined and recipients untouched when the previous channel was already creator-only", () => {
        const editAlert = makeAlertToEdit("channel-creator");
        const { result, rerender } = renderFormStateHook({ alertToEdit: editAlert });

        act(() => {
            result.current.onDestinationChange("channel-creator");
        });
        rerender();

        expect(result.current.warningMessage).toBeUndefined();
        // Still creator-only destination -> recipients ARE reset (warning is what's gated, not the reset)
        expect(transformAlertByDestinationSpy).toHaveBeenCalledWith(editAlert, "channel-creator", [
            SENTINEL_CONVERTED_RECIPIENT,
        ]);
    });

    it("leaves warningMessage undefined and does not reset recipients when switching to a non-creator channel", () => {
        const editAlert = makeAlertToEdit("channel-creator");
        const { result, rerender } = renderFormStateHook({ alertToEdit: editAlert });

        act(() => {
            result.current.onDestinationChange("channel-all");
        });
        rerender();

        expect(result.current.warningMessage).toBeUndefined();
        // updatedRecipients is undefined (not reset), but the converter still runs once at
        // mount for the defaultRecipient memo, so assert via the transform's 3rd arg rather
        // than call count.
        expect(transformAlertByDestinationSpy).toHaveBeenCalledWith(editAlert, "channel-all", undefined);
    });

    it("is a no-op on the automation state (stays undefined, no throw) when the draft is undefined", () => {
        const { result, rerender } = renderWithUndefinedDraft();

        act(() => {
            result.current.onDestinationChange("channel-all");
        });
        rerender();

        expect(result.current.editedAutomation).toBeUndefined();
        expect(transformAlertByDestinationSpy).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// Cases 4 & 5: onGranularityChange -> onTriggerIntervalChange follow-on, gated
// by the internal triggerIntervalDirty state; onAnomalyDetectionChange resets it.
//
// Note: because setEditedAutomation is now owned internally, multiple updates queued in the
// same handler are applied by React in sequence (each updater sees the *pending* result of the
// previous one within the same batch). The follow-on's presence is observed by referential
// (in)equality against the granularity-transform's mocked return value: if the follow-on fires,
// onTriggerIntervalChange spreads it into a *new* object (so editedAutomation !== the sentinel);
// if it doesn't fire, editedAutomation stays exactly === the sentinel.
// ---------------------------------------------------------------------------

describe("useAlertFormState — triggerIntervalDirty gating", () => {
    it("fires the onTriggerIntervalChange follow-on when not dirty, stops firing once dirtied, and resumes after onAnomalyDetectionChange resets it", () => {
        const { result, rerender } = renderFormStateHook();

        // 1) Not dirty (initial state) -> onGranularityChange's follow-on fires.
        act(() => {
            result.current.onGranularityChange(SENTINEL_MEASURE, "MONTH");
        });
        rerender();

        expect(transformAlertByGranularitySpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_MEASURES,
            BASE_ALERT,
            SENTINEL_MEASURE,
            "MONTH",
            SENTINEL_WEEK_START,
        );
        // Follow-on fired -> a NEW object (spread over the granularity result), not the sentinel itself.
        expect(result.current.editedAutomation).not.toBe(SENTINEL_GRANULARITY_RESULT);
        expect(result.current.editedAutomation).toMatchObject({
            title: "granularity-transformed",
            alert: { trigger: { interval: "MONTH", mode: "ALWAYS" } },
        });

        // 2) Explicitly change the trigger interval (default dirty=true) -> dirties the state.
        act(() => {
            result.current.onTriggerIntervalChange("WEEK");
        });
        rerender();
        expect(result.current.editedAutomation).toMatchObject({ alert: { trigger: { interval: "WEEK" } } });

        // 3) Now dirty -> onGranularityChange's follow-on must NOT fire.
        act(() => {
            result.current.onGranularityChange(SENTINEL_MEASURE, "QUARTER");
        });
        rerender();

        expect(transformAlertByGranularitySpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_MEASURES,
            expect.anything(),
            SENTINEL_MEASURE,
            "QUARTER",
            SENTINEL_WEEK_START,
        );
        // No follow-on -> editedAutomation IS exactly the (mocked) granularity-transform result.
        expect(result.current.editedAutomation).toBe(SENTINEL_GRANULARITY_RESULT);

        // 4) onAnomalyDetectionChange resets triggerIntervalDirty to false.
        act(() => {
            result.current.onAnomalyDetectionChange(SENTINEL_MEASURE);
        });
        rerender();

        expect(transformAlertByAnomalyDetectionSpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_MEASURES,
            SENTINEL_GRANULARITY_RESULT,
            SENTINEL_MEASURE,
            SENTINEL_WEEK_START,
            SENTINEL_TIMEZONE,
            SENTINEL_ENABLE_ALERT_ONCE_PER_INTERVAL,
        );
        expect(result.current.editedAutomation).toBe(SENTINEL_ANOMALY_RESULT);

        // 5) Not dirty again -> the follow-on fires once more. HOUR isn't a valid
        // IAlertTriggerInterval -> the follow-on maps it to "DAY".
        act(() => {
            result.current.onGranularityChange(SENTINEL_MEASURE, "HOUR");
        });
        rerender();

        expect(result.current.editedAutomation).not.toBe(SENTINEL_GRANULARITY_RESULT);
        expect(result.current.editedAutomation).toMatchObject({ alert: { trigger: { interval: "DAY" } } });
    });

    it("onGranularityChange is a no-op when measure is undefined", () => {
        const { result, rerender } = renderFormStateHook();

        act(() => {
            result.current.onGranularityChange(undefined, "MONTH");
        });
        rerender();

        expect(result.current.editedAutomation).toBe(BASE_ALERT);
        expect(transformAlertByGranularitySpy).not.toHaveBeenCalled();
    });

    it("onGranularityChange is a no-op (editedAutomation stays undefined, no throw) when the draft is undefined", () => {
        const { result, rerender } = renderWithUndefinedDraft();

        act(() => {
            result.current.onGranularityChange(SENTINEL_MEASURE, "MONTH");
        });
        rerender();

        expect(result.current.editedAutomation).toBeUndefined();
        expect(transformAlertByGranularitySpy).not.toHaveBeenCalled();
    });

    it("onAnomalyDetectionChange is a no-op (editedAutomation stays undefined, no throw) when the draft is undefined", () => {
        const { result, rerender } = renderWithUndefinedDraft();

        act(() => {
            result.current.onAnomalyDetectionChange(SENTINEL_MEASURE);
        });
        rerender();

        expect(result.current.editedAutomation).toBeUndefined();
        expect(transformAlertByAnomalyDetectionSpy).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// onTriggerIntervalChange wiring (dirty flag propagation, not covered above)
// ---------------------------------------------------------------------------

describe("useAlertFormState — onTriggerIntervalChange", () => {
    it("sets alert.trigger.interval", () => {
        const { result, rerender } = renderFormStateHook();

        act(() => {
            result.current.onTriggerIntervalChange("YEAR");
        });
        rerender();

        expect(result.current.editedAutomation).toMatchObject({ alert: { trigger: { interval: "YEAR" } } });
    });

    it("is a no-op on the automation state (stays undefined, no throw) when the draft is undefined", () => {
        const { result, rerender } = renderWithUndefinedDraft();

        act(() => {
            result.current.onTriggerIntervalChange("YEAR");
        });
        rerender();

        expect(result.current.editedAutomation).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// New (part 2): draft init — new-alert path via createDefaultAlert
// ---------------------------------------------------------------------------

describe("useAlertFormState — new-alert init (createDefaultAlert wiring)", () => {
    it("initializes editedAutomation via createDefaultAlert, called with the 14 args in order", () => {
        const editedAutomationFilters: FilterContextItem[] = [fakeFilterContextItem("filter")];
        const availableFiltersAsVisibleFilters: IAutomationVisibleFilter[] = [fakeVisibleFilter("vf1")];
        const hiddenFilters: FilterContextItem[] = [fakeFilterContextItem("hidden")];
        const widget = fakeWidget({ localIdentifier: "widget-local-1", title: "Widget Title" });
        const insight = SENTINEL_INSIGHT;
        const appliedFilters = [{ id: "applied" }] as unknown as ReturnType<typeof getAppliedWidgetFilters>;
        const visibleFilters = [fakeVisibleFilter("vf1")];

        mockUseAlertingDialogContext.mockReturnValue({
            ...DEFAULT_ALERTING_DIALOG_CONTEXT_VALUE,
            hiddenFilters,
            commonDateFilterId: "common-date-1",
            dashboardEvaluationFrequency: "0 0 * * *",
            dashboardId: "dashboard-1",
        });
        mockUseAutomationsContext.mockReturnValue({
            ...DEFAULT_AUTOMATIONS_CONTEXT_VALUE,
            settings: { alertDefault: { defaultTimezone: "Europe/Prague" } },
            widgetLocalIdToTabIdMap: { "widget-local-1": "tab-1" },
        });
        getAppliedWidgetFiltersSpy.mockReturnValue(appliedFilters);
        getVisibleFiltersByFiltersSpy.mockReturnValue(visibleFilters);

        renderFormStateHook({
            widget,
            insight,
            editedAutomationFilters,
            availableFiltersAsVisibleFilters,
        });

        expect(getAppliedWidgetFiltersSpy).toHaveBeenCalledWith(
            editedAutomationFilters,
            hiddenFilters,
            widget,
            insight,
            "common-date-1",
            true,
            false,
        );
        expect(getVisibleFiltersByFiltersSpy).toHaveBeenCalledWith(
            editedAutomationFilters,
            availableFiltersAsVisibleFilters,
            true,
        );
        expect(createDefaultAlertSpy).toHaveBeenCalledWith(
            appliedFilters,
            SENTINEL_SUPPORTED_MEASURES,
            SENTINEL_SUPPORTED_MEASURES[0],
            SENTINEL_CHANNEL_ALL.id,
            SENTINEL_CONVERTED_RECIPIENT,
            SENTINEL_MEASURE_FORMAT_MAP,
            undefined,
            { cron: "0 0 * * *", timezone: "Europe/Prague" },
            visibleFilters,
            "widget-local-1",
            "dashboard-1",
            "Widget Title",
            "tab-1",
            undefined,
        );
    });

    it("omits the schedule arg (undefined) when there is no dashboardEvaluationFrequency", () => {
        renderFormStateHook();

        expect(createDefaultAlertSpy).toHaveBeenCalledWith(
            [],
            SENTINEL_SUPPORTED_MEASURES,
            SENTINEL_SUPPORTED_MEASURES[0],
            SENTINEL_CHANNEL_ALL.id,
            SENTINEL_CONVERTED_RECIPIENT,
            SENTINEL_MEASURE_FORMAT_MAP,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
        );
    });

    it("threads the dashboard-scoped effective timezone into createDefaultAlert", () => {
        mockUseAutomationsContext.mockReturnValue({
            ...DEFAULT_AUTOMATIONS_CONTEXT_VALUE,
            exportTimezones: {
                isTimezoneFeatureEnabled: true,
                allowUserOverrideInViewMode: true,
                configuredTimezoneId: undefined,
                workspaceTimezone: "America/Argentina/Buenos_Aires",
                effectiveTimezone: "Europe/Prague",
                scheduledExportTimezone: "Europe/Prague",
            },
        });
        renderFormStateHook();

        // last arg is the execution timezone baked into the new alert's execution config
        expect(createDefaultAlertSpy.mock.calls[0]?.at(-1)).toBe("Europe/Prague");
    });
});

describe("useAlertFormState — parameterValues branch", () => {
    it("applies setAlertExecutionParameters(defaultNewAlert, parameterValues) when parameterValues is non-empty", () => {
        const sentinelParameterValues: unknown[] = [{ ref: { identifier: "p1" }, value: "v1" }];
        const withParams = makeResult("with-params");
        mockUseAlertingDialogContext.mockReturnValue({
            ...DEFAULT_ALERTING_DIALOG_CONTEXT_VALUE,
            parameterValues: sentinelParameterValues,
        });
        setAlertExecutionParametersSpy.mockReturnValue(withParams);

        const { result } = renderFormStateHook();

        expect(setAlertExecutionParametersSpy).toHaveBeenCalledWith(BASE_ALERT, sentinelParameterValues);
        expect(result.current.editedAutomation).toBe(withParams);
    });

    it("returns the raw createDefaultAlert result untouched when parameterValues is empty", () => {
        const { result } = renderFormStateHook();

        expect(setAlertExecutionParametersSpy).not.toHaveBeenCalled();
        expect(result.current.editedAutomation).toBe(BASE_ALERT);
    });
});

// ---------------------------------------------------------------------------
// New (part 2): draft init — edit path (resolvedAlertToEdit)
// ---------------------------------------------------------------------------

describe("useAlertFormState — edit init (resolvedAlertToEdit)", () => {
    it("uses alertToEdit unchanged when its alert has no execution filters", () => {
        const editAlert = makeEditAlert({ execution: { filters: [] } });
        const insight = SENTINEL_INSIGHT;

        const { result } = renderFormStateHook({ alertToEdit: editAlert, insight });

        expect(result.current.editedAutomation).toBe(editAlert);
        expect(resolveFilterDimensionalityLocalRefsSpy).not.toHaveBeenCalled();
        expect(createDefaultAlertSpy).not.toHaveBeenCalled();
    });

    it("uses alertToEdit unchanged when there is no insight, even with execution filters present", () => {
        const filters = fakeFilters("f1");
        const editAlert = makeEditAlert({ execution: { filters } });

        const { result } = renderFormStateHook({ alertToEdit: editAlert, insight: undefined });

        expect(result.current.editedAutomation).toBe(editAlert);
        expect(resolveFilterDimensionalityLocalRefsSpy).not.toHaveBeenCalled();
    });

    it("returns alertToEdit unchanged (same reference) when resolveFilterDimensionalityLocalRefs returns the same filters array", () => {
        const filters = fakeFilters("f1");
        const editAlert = makeEditAlert({ execution: { filters } });
        const insight = SENTINEL_INSIGHT;
        resolveFilterDimensionalityLocalRefsSpy.mockReturnValue(filters);

        const { result } = renderFormStateHook({ alertToEdit: editAlert, insight });

        expect(resolveFilterDimensionalityLocalRefsSpy).toHaveBeenCalledWith(filters, insight);
        expect(result.current.editedAutomation).toBe(editAlert);
    });

    it("spreads the resolved filters into a NEW object when resolveFilterDimensionalityLocalRefs returns a changed array", () => {
        const filters = fakeFilters("f1");
        const resolvedFilters = fakeFilters("f1-resolved");
        const editAlert = makeEditAlert({
            execution: { filters },
            trigger: { mode: "ALWAYS", interval: "DAY" },
        });
        const insight = SENTINEL_INSIGHT;
        resolveFilterDimensionalityLocalRefsSpy.mockReturnValue(resolvedFilters);

        const { result } = renderFormStateHook({ alertToEdit: editAlert, insight });

        expect(result.current.editedAutomation).not.toBe(editAlert);
        expect(result.current.editedAutomation).toMatchObject({
            alert: {
                trigger: { mode: "ALWAYS", interval: "DAY" },
                execution: { filters: resolvedFilters },
            },
        });
        expect(createDefaultAlertSpy).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// New (part 2): originalAutomation stability
// ---------------------------------------------------------------------------

describe("useAlertFormState — originalAutomation stability", () => {
    it("equals the initial editedAutomation and does not change after a handler mutates the draft", () => {
        const { result, rerender } = renderFormStateHook();

        expect(result.current.originalAutomation).toBe(BASE_ALERT);
        expect(result.current.editedAutomation).toBe(BASE_ALERT);

        act(() => {
            result.current.onSensitivityChange("HIGH");
        });
        rerender();

        expect(result.current.editedAutomation).toBe(SENTINEL_SENSITIVITY_RESULT);
        expect(result.current.originalAutomation).toBe(BASE_ALERT);
    });

    it("captures the resolved alertToEdit (edit path) and stays stable across renders", () => {
        const editAlert = makeEditAlert({ execution: { filters: [] } });

        const { result, rerender } = renderFormStateHook({ alertToEdit: editAlert });

        expect(result.current.originalAutomation).toBe(editAlert);

        act(() => {
            result.current.onTitleChange("changed");
        });
        rerender();

        expect(result.current.editedAutomation).not.toBe(editAlert);
        expect(result.current.originalAutomation).toBe(editAlert);
    });
});

// ---------------------------------------------------------------------------
// New (part 2): default values
// ---------------------------------------------------------------------------

describe("useAlertFormState — defaults", () => {
    it("threads notificationChannels[0]?.id as defaultNotificationChannelId into createDefaultAlert", () => {
        renderFormStateHook();

        expect(createDefaultAlertSpy.mock.calls[0]?.[3]).toBe(SENTINEL_CHANNEL_ALL.id);
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
});

// ---------------------------------------------------------------------------
// Default recipient identity. The converters allocate a fresh recipient per
// call, and beforeEach's shared mockReturnValue hands out one object, so these
// tests override it — without the override an unmemoized value cannot fail them.
// ---------------------------------------------------------------------------

describe("useAlertFormState — default recipient identity", () => {
    it("keeps defaultUser and defaultRecipient identical across a rerender", () => {
        convertUserToAutomationRecipientSpy.mockImplementation(() => ({
            ...SENTINEL_CONVERTED_RECIPIENT,
        }));
        const { result, rerender } = renderFormStateHook();
        const firstUser = result.current.defaultUser;
        const firstRecipient = result.current.defaultRecipient;

        rerender();

        expect(result.current.defaultUser).toBe(firstUser);
        expect(result.current.defaultRecipient).toBe(firstRecipient);
    });

    it("keeps defaultRecipient identical across a rerender with an external override", () => {
        convertExternalRecipientToAutomationRecipientSpy.mockImplementation(() => ({
            ...SENTINEL_EXTERNAL_RECIPIENT,
        }));
        const { result, rerender } = renderFormStateHook({
            externalRecipientOverride: "ext@example.com",
        });
        const first = result.current.defaultRecipient;

        rerender();

        expect(result.current.defaultRecipient).toBe(first);
    });
});

// ---------------------------------------------------------------------------
// New (part 2): useAutomationAlertParameters passthrough (wiring only — its own
// internal behavior is covered by useAutomationAlertParameters.test.ts)
// ---------------------------------------------------------------------------

describe("useAlertFormState — parameters passthrough", () => {
    it("threads editedAutomation/setEditedAutomation/dashboardParameters/widgetParameterValues into useAutomationAlertParameters and returns its result", () => {
        const widget = fakeWidget();
        const { result } = renderFormStateHook({ widget });

        expect(useAutomationAlertParametersSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                editedAutomation: BASE_ALERT,
                dashboardParameters: SENTINEL_DASHBOARD_PARAMETERS,
                widgetParameterValues: DEFAULT_ALERTING_DIALOG_CONTEXT_VALUE.parameterValues,
                setEditedAutomation: expect.any(Function),
            }),
        );
        expect(result.current.automationParameters).toBe(DEFAULT_PARAMETERS_RETURN.automationParameters);
        expect(result.current.availableParameters).toBe(DEFAULT_PARAMETERS_RETURN.availableParameters);
        expect(result.current.onParameterChange).toBe(DEFAULT_PARAMETERS_RETURN.onParameterChange);
        expect(result.current.onParameterDelete).toBe(DEFAULT_PARAMETERS_RETURN.onParameterDelete);
        expect(result.current.onParameterAdd).toBe(DEFAULT_PARAMETERS_RETURN.onParameterAdd);
        expect(result.current.dropStaleParameters).toBe(DEFAULT_PARAMETERS_RETURN.dropStaleParameters);
    });
});
