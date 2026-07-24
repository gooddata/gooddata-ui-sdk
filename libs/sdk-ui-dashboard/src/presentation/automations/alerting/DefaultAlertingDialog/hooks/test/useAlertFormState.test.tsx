// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import type * as ReactIntl from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IAutomationRecipient,
    type INotificationChannelIdentifier,
    type IUser,
    type IWorkspaceUser,
    idRef,
    newAttribute,
    newMeasure,
} from "@gooddata/sdk-model";

import { type AlertAttribute, type AlertMetric, AlertMetricComparatorType } from "../../../types.js";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them. We use vi.fn() inline and retrieve spies via
// vi.mocked() after the import statements.
// ---------------------------------------------------------------------------

vi.mock("../../utils/transformation.js", async (importOriginal: () => Promise<Record<string, unknown>>) => {
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
    "../../../../shared/utils/automationUtils.js",
    async (importOriginal: () => Promise<Record<string, unknown>>) => {
        const actual = await importOriginal();
        return {
            ...actual,
            convertCurrentUserToAutomationRecipient: vi.fn(),
        };
    },
);

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

import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";
import { convertCurrentUserToAutomationRecipient } from "../../../../shared/utils/automationUtils.js";
import * as transformationModule from "../../utils/transformation.js";
import { useAlertFormState, type IUseAlertFormStateProps } from "../useAlertFormState.js";

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
const convertCurrentUserToAutomationRecipientSpy = vi.mocked(convertCurrentUserToAutomationRecipient);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockSetEditedAutomation = vi.fn();

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

const SENTINEL_USERS: IWorkspaceUser[] = [];
const SENTINEL_CURRENT_USER: IUser = { ref: idRef("user1"), login: "user1" };
const SENTINEL_CONVERTED_RECIPIENT: IAutomationRecipient = {
    id: "user1",
    email: "user1@example.com",
    name: "User One",
    type: "user",
};

// IAutomationMetadataObject additionally requires ref/id/uri/description/production/deprecated/unlisted;
// these are only ever compared by reference (toBe) as the mocked transform's return value, so a fully
// valid instance would add fields no assertion reads.
const SENTINEL_METRIC_RESULT = {
    type: "automation",
    title: "metric-transformed",
} as unknown as IAutomationMetadataObject;
const SENTINEL_ATTRIBUTE_RESULT = {
    type: "automation",
    title: "attribute-transformed",
} as unknown as IAutomationMetadataObject;
const SENTINEL_COMPARISON_OPERATOR_RESULT = {
    type: "automation",
    title: "comparison-operator-transformed",
} as unknown as IAutomationMetadataObject;
const SENTINEL_RELATIVE_OPERATOR_RESULT = {
    type: "automation",
    title: "relative-operator-transformed",
} as unknown as IAutomationMetadataObject;
const SENTINEL_ANOMALY_RESULT = {
    type: "automation",
    title: "anomaly-transformed",
} as unknown as IAutomationMetadataObject;
const SENTINEL_SENSITIVITY_RESULT = {
    type: "automation",
    title: "sensitivity-transformed",
} as unknown as IAutomationMetadataObject;
const SENTINEL_GRANULARITY_RESULT = {
    type: "automation",
    title: "granularity-transformed",
} as unknown as IAutomationMetadataObject;
const SENTINEL_DESTINATION_RESULT = {
    type: "automation",
    title: "destination-transformed",
} as unknown as IAutomationMetadataObject;

const BASE_PROPS: IUseAlertFormStateProps = {
    setEditedAutomation: mockSetEditedAutomation,
    supportedMeasures: SENTINEL_SUPPORTED_MEASURES,
    supportedAttributes: SENTINEL_SUPPORTED_ATTRIBUTES,
    measureFormatMap: SENTINEL_MEASURE_FORMAT_MAP,
    weekStart: SENTINEL_WEEK_START,
    timezone: SENTINEL_TIMEZONE,
    enableAlertOncePerInterval: SENTINEL_ENABLE_ALERT_ONCE_PER_INTERVAL,
    notificationChannels: SENTINEL_NOTIFICATION_CHANNELS,
    currentUser: SENTINEL_CURRENT_USER,
    users: SENTINEL_USERS,
    alertToEdit: undefined,
};

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();
    transformAlertByMetricSpy.mockReturnValue(SENTINEL_METRIC_RESULT);
    transformAlertByAttributeSpy.mockReturnValue(SENTINEL_ATTRIBUTE_RESULT);
    transformAlertByComparisonOperatorSpy.mockReturnValue(SENTINEL_COMPARISON_OPERATOR_RESULT);
    transformAlertByRelativeOperatorSpy.mockReturnValue(SENTINEL_RELATIVE_OPERATOR_RESULT);
    transformAlertByAnomalyDetectionSpy.mockReturnValue(SENTINEL_ANOMALY_RESULT);
    transformAlertBySensitivitySpy.mockReturnValue(SENTINEL_SENSITIVITY_RESULT);
    transformAlertByGranularitySpy.mockReturnValue(SENTINEL_GRANULARITY_RESULT);
    transformAlertByDestinationSpy.mockReturnValue(SENTINEL_DESTINATION_RESULT);
    convertCurrentUserToAutomationRecipientSpy.mockReturnValue(SENTINEL_CONVERTED_RECIPIENT);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderFormStateHook(props: Partial<IUseAlertFormStateProps> = {}) {
    const mergedProps: IUseAlertFormStateProps = { ...BASE_PROPS, ...props };
    return renderHook(() => useAlertFormState(mergedProps), { wrapper: IntlWrapper });
}

function makeAlert(
    overrides: Partial<IAutomationMetadataObjectDefinition> = {},
): IAutomationMetadataObjectDefinition {
    return {
        type: "automation",
        title: "Test Alert",
        // `alert.condition` is required by IAutomationAlert but unread by these handlers
        // (only `trigger`/`execution` are spread/read), so the cast stays rather than
        // hand-authoring a meaningless condition.
        alert: {
            trigger: { mode: "ALWAYS", interval: "DAY" },
            execution: { filters: [] },
        },
        metadata: {},
        recipients: [],
        ...overrides,
    } as unknown as IAutomationMetadataObjectDefinition;
}

// IAutomationMetadataObject additionally requires ref/id/uri/description/production/deprecated/unlisted;
// onDestinationChange only reads `notificationChannel` off alertToEdit, so a fully valid instance
// would add fields no assertion (or the code under test) reads.
function makeAlertToEdit(notificationChannel: string): IAutomationMetadataObject {
    return { notificationChannel } as unknown as IAutomationMetadataObject;
}

/** Grabs the nth updater passed to setEditedAutomation (0-indexed among all calls so far). */
function updaterAt(index: number) {
    return mockSetEditedAutomation.mock.calls[index][0];
}

// ---------------------------------------------------------------------------
// Case 1: per-handler transform wiring (+ case 6 undefined-state guards inline)
// ---------------------------------------------------------------------------

describe("useAlertFormState — onMeasureChange", () => {
    it("calls transformAlertByMetric with the expected args and returns its result", () => {
        const { result } = renderFormStateHook();

        result.current.onMeasureChange(SENTINEL_MEASURE);

        expect(mockSetEditedAutomation).toHaveBeenCalledOnce();
        const alert = makeAlert();
        const returnValue = updaterAt(0)(alert);

        expect(transformAlertByMetricSpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_MEASURES,
            alert,
            SENTINEL_MEASURE,
            SENTINEL_MEASURE_FORMAT_MAP,
            SENTINEL_WEEK_START,
            SENTINEL_TIMEZONE,
        );
        expect(returnValue).toBe(SENTINEL_METRIC_RESULT);
    });

    it("is a no-op (returns undefined, no throw) when state is undefined", () => {
        const { result } = renderFormStateHook();

        result.current.onMeasureChange(SENTINEL_MEASURE);
        const updater = updaterAt(0);

        expect(() => updater(undefined)).not.toThrow();
        expect(updater(undefined)).toBeUndefined();
        expect(transformAlertByMetricSpy).not.toHaveBeenCalled();
    });
});

describe("useAlertFormState — onAttributeChange", () => {
    it("calls transformAlertByAttribute with the expected args and returns its result", () => {
        const { result } = renderFormStateHook();
        const value = { title: "t", value: "v", name: "n" };

        result.current.onAttributeChange(SENTINEL_ATTRIBUTE, value);

        const alert = makeAlert();
        const returnValue = updaterAt(0)(alert);

        expect(transformAlertByAttributeSpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_ATTRIBUTES,
            alert,
            SENTINEL_ATTRIBUTE,
            value,
        );
        expect(returnValue).toBe(SENTINEL_ATTRIBUTE_RESULT);
    });

    it("is a no-op (returns undefined, no throw) when state is undefined", () => {
        const { result } = renderFormStateHook();

        result.current.onAttributeChange(SENTINEL_ATTRIBUTE, undefined);
        const updater = updaterAt(0);

        expect(updater(undefined)).toBeUndefined();
        expect(transformAlertByAttributeSpy).not.toHaveBeenCalled();
    });
});

describe("useAlertFormState — onComparisonOperatorChange", () => {
    it("calls transformAlertByComparisonOperator with the expected args and returns its result", () => {
        const { result } = renderFormStateHook();

        result.current.onComparisonOperatorChange(SENTINEL_MEASURE, "GREATER_THAN");

        const alert = makeAlert();
        const returnValue = updaterAt(0)(alert);

        expect(transformAlertByComparisonOperatorSpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_MEASURES,
            alert,
            SENTINEL_MEASURE,
            "GREATER_THAN",
        );
        expect(returnValue).toBe(SENTINEL_COMPARISON_OPERATOR_RESULT);
    });

    it("is a no-op (returns undefined, no throw) when state is undefined", () => {
        const { result } = renderFormStateHook();

        result.current.onComparisonOperatorChange(SENTINEL_MEASURE, "GREATER_THAN");
        const updater = updaterAt(0);

        expect(updater(undefined)).toBeUndefined();
        expect(transformAlertByComparisonOperatorSpy).not.toHaveBeenCalled();
    });
});

describe("useAlertFormState — onRelativeOperatorChange", () => {
    it("calls transformAlertByRelativeOperator with the expected args and returns its result", () => {
        const { result } = renderFormStateHook();

        result.current.onRelativeOperatorChange(SENTINEL_MEASURE, "INCREASES_BY", "CHANGE");

        const alert = makeAlert();
        const returnValue = updaterAt(0)(alert);

        expect(transformAlertByRelativeOperatorSpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_MEASURES,
            alert,
            SENTINEL_MEASURE,
            "INCREASES_BY",
            "CHANGE",
            SENTINEL_MEASURE_FORMAT_MAP,
        );
        expect(returnValue).toBe(SENTINEL_RELATIVE_OPERATOR_RESULT);
    });

    it("is a no-op (returns undefined, no throw) when state is undefined", () => {
        const { result } = renderFormStateHook();

        result.current.onRelativeOperatorChange(SENTINEL_MEASURE, "INCREASES_BY", "CHANGE");
        const updater = updaterAt(0);

        expect(updater(undefined)).toBeUndefined();
        expect(transformAlertByRelativeOperatorSpy).not.toHaveBeenCalled();
    });
});

describe("useAlertFormState — onComparisonTypeChange", () => {
    it("calls transformAlertByRelativeOperator with the destructured tuple + comparisonType/granularity", () => {
        const { result } = renderFormStateHook();

        result.current.onComparisonTypeChange(
            SENTINEL_MEASURE,
            ["INCREASES_BY", "CHANGE"],
            AlertMetricComparatorType.PreviousPeriod,
            "GDC.time.month",
        );

        const alert = makeAlert();
        const returnValue = updaterAt(0)(alert);

        expect(transformAlertByRelativeOperatorSpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_MEASURES,
            alert,
            SENTINEL_MEASURE,
            "INCREASES_BY",
            "CHANGE",
            SENTINEL_MEASURE_FORMAT_MAP,
            AlertMetricComparatorType.PreviousPeriod,
            "GDC.time.month",
        );
        expect(returnValue).toBe(SENTINEL_RELATIVE_OPERATOR_RESULT);
    });

    it("is a no-op when measure is undefined (guard before setEditedAutomation)", () => {
        const { result } = renderFormStateHook();

        result.current.onComparisonTypeChange(
            undefined,
            ["INCREASES_BY", "CHANGE"],
            AlertMetricComparatorType.PreviousPeriod,
        );

        expect(mockSetEditedAutomation).not.toHaveBeenCalled();
    });

    it("is a no-op when relativeOperator is undefined (guard before setEditedAutomation)", () => {
        const { result } = renderFormStateHook();

        result.current.onComparisonTypeChange(
            SENTINEL_MEASURE,
            undefined,
            AlertMetricComparatorType.PreviousPeriod,
        );

        expect(mockSetEditedAutomation).not.toHaveBeenCalled();
    });

    it("is a no-op (returns undefined, no throw) when state is undefined", () => {
        const { result } = renderFormStateHook();

        result.current.onComparisonTypeChange(
            SENTINEL_MEASURE,
            ["INCREASES_BY", "CHANGE"],
            AlertMetricComparatorType.PreviousPeriod,
        );
        const updater = updaterAt(0);

        expect(updater(undefined)).toBeUndefined();
        expect(transformAlertByRelativeOperatorSpy).not.toHaveBeenCalled();
    });
});

describe("useAlertFormState — onSensitivityChange", () => {
    it("calls transformAlertBySensitivity with the expected args and returns its result", () => {
        const { result } = renderFormStateHook();

        result.current.onSensitivityChange("HIGH");

        const alert = makeAlert();
        const returnValue = updaterAt(0)(alert);

        expect(transformAlertBySensitivitySpy).toHaveBeenCalledWith(alert, "HIGH");
        expect(returnValue).toBe(SENTINEL_SENSITIVITY_RESULT);
    });

    it("is a no-op (returns undefined, no throw) when state is undefined", () => {
        const { result } = renderFormStateHook();

        result.current.onSensitivityChange("HIGH");
        const updater = updaterAt(0);

        expect(() => updater(undefined)).not.toThrow();
        expect(updater(undefined)).toBeUndefined();
        expect(transformAlertBySensitivitySpy).not.toHaveBeenCalled();
    });
});

describe("useAlertFormState — onTriggerModeChange", () => {
    it("merges triggerMode into alert.trigger", () => {
        const { result } = renderFormStateHook();

        result.current.onTriggerModeChange("ONCE");

        const alert = makeAlert();
        const returnValue = updaterAt(0)(alert);

        expect(returnValue).toMatchObject({ alert: { trigger: { mode: "ONCE", interval: "DAY" } } });
    });

    it("is a no-op (returns undefined, no throw) when state is undefined", () => {
        const { result } = renderFormStateHook();

        result.current.onTriggerModeChange("ONCE");
        const updater = updaterAt(0);

        expect(() => updater(undefined)).not.toThrow();
        expect(updater(undefined)).toBeUndefined();
    });
});

describe("useAlertFormState — onRecipientsChange", () => {
    it("replaces recipients", () => {
        const { result } = renderFormStateHook();
        const newRecipients: IAutomationRecipient[] = [SENTINEL_CONVERTED_RECIPIENT];

        result.current.onRecipientsChange(newRecipients);

        const alert = makeAlert();
        const returnValue = updaterAt(0)(alert);

        expect(returnValue).toMatchObject({ recipients: newRecipients });
    });

    it("is a no-op (returns undefined, no throw) when state is undefined", () => {
        const { result } = renderFormStateHook();

        result.current.onRecipientsChange([]);
        const updater = updaterAt(0);

        expect(() => updater(undefined)).not.toThrow();
        expect(updater(undefined)).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// Case 2: onTitleChange sets isTitleValid and updates the title
// ---------------------------------------------------------------------------

describe("useAlertFormState — onTitleChange", () => {
    it("updates isTitleValid (observable in the returned hook value) and the title", () => {
        const { result, rerender } = renderFormStateHook();

        expect(result.current.isTitleValid).toBe(true);

        act(() => {
            result.current.onTitleChange("New title", false);
        });
        rerender();

        expect(result.current.isTitleValid).toBe(false);

        const alert = makeAlert();
        const returnValue = updaterAt(0)(alert);
        expect(returnValue).toMatchObject({ title: "New title" });

        act(() => {
            result.current.onTitleChange("Another title", true);
        });
        rerender();

        expect(result.current.isTitleValid).toBe(true);
    });

    it("is a no-op on the automation state (returns undefined, no throw) when state is undefined", () => {
        const { result } = renderFormStateHook();

        act(() => {
            result.current.onTitleChange("x", true);
        });
        const updater = updaterAt(0);

        expect(() => updater(undefined)).not.toThrow();
        expect(updater(undefined)).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// Case 3: onDestinationChange — warning message + recipient reset
// ---------------------------------------------------------------------------

describe("useAlertFormState — onDestinationChange", () => {
    it("sets warningMessage and resets recipients when switching TO a creator-only channel FROM a non-creator one", () => {
        const { result, rerender } = renderFormStateHook({
            alertToEdit: makeAlertToEdit("channel-all"),
        });

        act(() => {
            result.current.onDestinationChange("channel-creator");
        });
        rerender();

        expect(result.current.warningMessage).toBe("insightAlert.config.warning.destination");

        const alert = makeAlert();
        const returnValue = updaterAt(0)(alert);

        expect(convertCurrentUserToAutomationRecipientSpy).toHaveBeenCalledWith(
            SENTINEL_USERS,
            SENTINEL_CURRENT_USER,
        );
        expect(transformAlertByDestinationSpy).toHaveBeenCalledWith(alert, "channel-creator", [
            SENTINEL_CONVERTED_RECIPIENT,
        ]);
        expect(returnValue).toBe(SENTINEL_DESTINATION_RESULT);
    });

    it("leaves warningMessage undefined and recipients untouched when the previous channel was already creator-only", () => {
        const { result, rerender } = renderFormStateHook({
            alertToEdit: makeAlertToEdit("channel-creator"),
        });

        act(() => {
            result.current.onDestinationChange("channel-creator");
        });
        rerender();

        expect(result.current.warningMessage).toBeUndefined();

        const alert = makeAlert();
        updaterAt(0)(alert);

        // Still creator-only destination -> recipients ARE reset (warning is what's gated, not the reset)
        expect(transformAlertByDestinationSpy).toHaveBeenCalledWith(alert, "channel-creator", [
            SENTINEL_CONVERTED_RECIPIENT,
        ]);
    });

    it("leaves warningMessage undefined and does not reset recipients when switching to a non-creator channel", () => {
        const { result, rerender } = renderFormStateHook({
            alertToEdit: makeAlertToEdit("channel-creator"),
        });

        act(() => {
            result.current.onDestinationChange("channel-all");
        });
        rerender();

        expect(result.current.warningMessage).toBeUndefined();

        const alert = makeAlert();
        updaterAt(0)(alert);

        expect(convertCurrentUserToAutomationRecipientSpy).not.toHaveBeenCalled();
        expect(transformAlertByDestinationSpy).toHaveBeenCalledWith(alert, "channel-all", undefined);
    });

    it("is a no-op on the automation state (returns undefined, no throw) when state is undefined", () => {
        const { result } = renderFormStateHook();

        act(() => {
            result.current.onDestinationChange("channel-all");
        });
        const updater = updaterAt(0);

        expect(() => updater(undefined)).not.toThrow();
        expect(updater(undefined)).toBeUndefined();
        expect(transformAlertByDestinationSpy).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// Cases 4 & 5: onGranularityChange -> onTriggerIntervalChange follow-on, gated
// by the internal triggerIntervalDirty state; onAnomalyDetectionChange resets it.
// ---------------------------------------------------------------------------

describe("useAlertFormState — triggerIntervalDirty gating", () => {
    it("fires the onTriggerIntervalChange follow-on when not dirty, stops firing once dirtied, and resumes after onAnomalyDetectionChange resets it", () => {
        const { result } = renderFormStateHook();

        // 1) Not dirty (initial state) -> onGranularityChange's follow-on fires.
        act(() => {
            result.current.onGranularityChange(SENTINEL_MEASURE, "MONTH");
        });

        // 2 setEditedAutomation calls: one from transformAlertByGranularity, one from the
        // onTriggerIntervalChange(granularity, false) follow-on.
        expect(mockSetEditedAutomation).toHaveBeenCalledTimes(2);

        const alertForGranularity = makeAlert();
        expect(updaterAt(0)(alertForGranularity)).toBe(SENTINEL_GRANULARITY_RESULT);
        expect(transformAlertByGranularitySpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_MEASURES,
            alertForGranularity,
            SENTINEL_MEASURE,
            "MONTH",
            SENTINEL_WEEK_START,
        );

        const followOnAlert = makeAlert();
        expect(updaterAt(1)(followOnAlert)).toMatchObject({
            alert: { trigger: { interval: "MONTH", mode: "ALWAYS" } },
        });

        // 2) Explicitly change the trigger interval (default dirty=true) -> dirties the state.
        vi.clearAllMocks();
        act(() => {
            result.current.onTriggerIntervalChange("WEEK");
        });
        expect(mockSetEditedAutomation).toHaveBeenCalledTimes(1);

        // 3) Now dirty -> onGranularityChange's follow-on must NOT fire (only 1 setEditedAutomation call).
        vi.clearAllMocks();
        act(() => {
            result.current.onGranularityChange(SENTINEL_MEASURE, "QUARTER");
        });
        expect(mockSetEditedAutomation).toHaveBeenCalledTimes(1);

        const alertForQuarter = makeAlert();
        expect(updaterAt(0)(alertForQuarter)).toBe(SENTINEL_GRANULARITY_RESULT);
        expect(transformAlertByGranularitySpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_MEASURES,
            alertForQuarter,
            SENTINEL_MEASURE,
            "QUARTER",
            SENTINEL_WEEK_START,
        );

        // 4) onAnomalyDetectionChange resets triggerIntervalDirty to false.
        vi.clearAllMocks();
        act(() => {
            result.current.onAnomalyDetectionChange(SENTINEL_MEASURE);
        });
        expect(mockSetEditedAutomation).toHaveBeenCalledTimes(1);

        const alertForAnomaly = makeAlert();
        expect(updaterAt(0)(alertForAnomaly)).toBe(SENTINEL_ANOMALY_RESULT);
        expect(transformAlertByAnomalyDetectionSpy).toHaveBeenCalledWith(
            SENTINEL_SUPPORTED_MEASURES,
            alertForAnomaly,
            SENTINEL_MEASURE,
            SENTINEL_WEEK_START,
            SENTINEL_TIMEZONE,
            SENTINEL_ENABLE_ALERT_ONCE_PER_INTERVAL,
        );

        // 5) Not dirty again -> the follow-on fires once more. HOUR isn't a valid
        // IAlertTriggerInterval -> the follow-on maps it to "DAY".
        vi.clearAllMocks();
        act(() => {
            result.current.onGranularityChange(SENTINEL_MEASURE, "HOUR");
        });
        expect(mockSetEditedAutomation).toHaveBeenCalledTimes(2);
        const finalAlert = makeAlert();
        expect(updaterAt(1)(finalAlert)).toMatchObject({ alert: { trigger: { interval: "DAY" } } });
    });

    it("onGranularityChange is a no-op when measure is undefined", () => {
        const { result } = renderFormStateHook();

        act(() => {
            result.current.onGranularityChange(undefined, "MONTH");
        });

        expect(mockSetEditedAutomation).not.toHaveBeenCalled();
        expect(transformAlertByGranularitySpy).not.toHaveBeenCalled();
    });

    it("onGranularityChange is a no-op (returns undefined, no throw) when state is undefined", () => {
        const { result } = renderFormStateHook();

        act(() => {
            result.current.onGranularityChange(SENTINEL_MEASURE, "MONTH");
        });
        const updater = updaterAt(0);

        expect(() => updater(undefined)).not.toThrow();
        expect(updater(undefined)).toBeUndefined();
        expect(transformAlertByGranularitySpy).not.toHaveBeenCalled();
    });

    it("onAnomalyDetectionChange is a no-op (returns undefined, no throw) when state is undefined", () => {
        const { result } = renderFormStateHook();

        act(() => {
            result.current.onAnomalyDetectionChange(SENTINEL_MEASURE);
        });
        const updater = updaterAt(0);

        expect(() => updater(undefined)).not.toThrow();
        expect(updater(undefined)).toBeUndefined();
        expect(transformAlertByAnomalyDetectionSpy).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// onTriggerIntervalChange wiring (dirty flag propagation, not covered above)
// ---------------------------------------------------------------------------

describe("useAlertFormState — onTriggerIntervalChange", () => {
    it("sets alert.trigger.interval", () => {
        const { result } = renderFormStateHook();

        act(() => {
            result.current.onTriggerIntervalChange("YEAR");
        });

        const alert = makeAlert();
        expect(updaterAt(0)(alert)).toMatchObject({ alert: { trigger: { interval: "YEAR" } } });
    });

    it("is a no-op on the automation state (returns undefined, no throw) when state is undefined", () => {
        const { result } = renderFormStateHook();

        act(() => {
            result.current.onTriggerIntervalChange("YEAR");
        });
        const updater = updaterAt(0);

        expect(() => updater(undefined)).not.toThrow();
        expect(updater(undefined)).toBeUndefined();
    });
});
