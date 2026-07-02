// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObjectDefinition,
    type INotificationChannelMetadataObject,
} from "@gooddata/sdk-model";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted, so factories must not reference top-level
// let/const declared after them. We use vi.fn() inline and retrieve spies via
// vi.mocked() after the import statements.
// ---------------------------------------------------------------------------

vi.mock("../../utils/getters.js", () => ({
    getAlertMeasure: vi.fn(),
    getAlertCompareOperator: vi.fn(),
    getAlertRelativeOperator: vi.fn(),
    getAlertAiOperator: vi.fn(),
    getAlertComparison: vi.fn(),
    getAlertSensitivity: vi.fn(),
    getAlertGranularity: vi.fn(),
    getAlertAttribute: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import { type AlertAttribute, type AlertMetric } from "../../../types.js";
import * as gettersModule from "../../utils/getters.js";
import { useAlertSelectedValues, type IUseAlertSelectedValuesProps } from "../useAlertSelectedValues.js";

// ---------------------------------------------------------------------------
// Typed spy references (resolved after import)
// ---------------------------------------------------------------------------

const getAlertMeasureSpy = vi.mocked(gettersModule.getAlertMeasure);
const getAlertCompareOperatorSpy = vi.mocked(gettersModule.getAlertCompareOperator);
const getAlertRelativeOperatorSpy = vi.mocked(gettersModule.getAlertRelativeOperator);
const getAlertAiOperatorSpy = vi.mocked(gettersModule.getAlertAiOperator);
const getAlertComparisonSpy = vi.mocked(gettersModule.getAlertComparison);
const getAlertSensitivitySpy = vi.mocked(gettersModule.getAlertSensitivity);
const getAlertGranularitySpy = vi.mocked(gettersModule.getAlertGranularity);
const getAlertAttributeSpy = vi.mocked(gettersModule.getAlertAttribute);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SENTINEL_MEASURE = { measure: { localIdentifier: "m1" } } as unknown as AlertMetric;
const SENTINEL_ATTRIBUTE = { attribute: { localIdentifier: "a1" } } as unknown as AlertAttribute;
const SENTINEL_VALUE = "attr-value-sentinel";

const mockChannel1: INotificationChannelMetadataObject = {
    type: "notificationChannel",
    id: "channel-1",
    ref: { identifier: "channel-1" },
    uri: "/channel-1",
    identifier: "channel-1",
    title: "Channel 1",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    destinationType: "smtp",
    allowedRecipients: "external",
} as unknown as INotificationChannelMetadataObject;

const mockChannel2: INotificationChannelMetadataObject = {
    ...mockChannel1,
    id: "channel-2",
    ref: { identifier: "channel-2" },
    uri: "/channel-2",
    identifier: "channel-2",
    title: "Channel 2",
    allowedRecipients: "creator",
} as unknown as INotificationChannelMetadataObject;

const mockChannel3: INotificationChannelMetadataObject = {
    ...mockChannel1,
    id: "channel-3",
    ref: { identifier: "channel-3" },
    uri: "/channel-3",
    identifier: "channel-3",
    title: "Channel 3",
    allowedRecipients: "all",
} as unknown as INotificationChannelMetadataObject;

const mockAutomation: IAutomationMetadataObjectDefinition = {
    type: "automation",
    title: "Test Alert",
    notificationChannel: "channel-1",
    alert: { condition: { type: "comparison", operator: "GREATER_THAN", left: {}, right: 42 } },
} as unknown as IAutomationMetadataObjectDefinition;

const supportedMeasures: AlertMetric[] = [SENTINEL_MEASURE];
const supportedAttributes: AlertAttribute[] = [SENTINEL_ATTRIBUTE];
const notificationChannels = [mockChannel1, mockChannel2, mockChannel3];

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();
    getAlertMeasureSpy.mockReturnValue(SENTINEL_MEASURE);
    getAlertCompareOperatorSpy.mockReturnValue("GREATER_THAN" as any);
    getAlertRelativeOperatorSpy.mockReturnValue(undefined);
    getAlertAiOperatorSpy.mockReturnValue(undefined);
    getAlertComparisonSpy.mockReturnValue(undefined);
    getAlertSensitivitySpy.mockReturnValue(undefined);
    getAlertGranularitySpy.mockReturnValue(undefined);
    getAlertAttributeSpy.mockReturnValue([SENTINEL_ATTRIBUTE, SENTINEL_VALUE] as any);
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderSelectedValuesHook(props: Partial<IUseAlertSelectedValuesProps> = {}) {
    const mergedProps: IUseAlertSelectedValuesProps = {
        editedAutomation: mockAutomation,
        supportedMeasures,
        supportedAttributes,
        notificationChannels,
        ...props,
    };
    return renderHook(() => useAlertSelectedValues(mergedProps));
}

// ---------------------------------------------------------------------------
// Case 1: selection wiring — each getter is called with the expected args
// ---------------------------------------------------------------------------

describe("useAlertSelectedValues — selection wiring", () => {
    it("calls getAlertMeasure with (supportedMeasures, alert) and surfaces the result", () => {
        const { result } = renderSelectedValuesHook();

        expect(getAlertMeasureSpy).toHaveBeenCalledWith(supportedMeasures, mockAutomation.alert);
        expect(result.current.selectedMeasure).toBe(SENTINEL_MEASURE);
    });

    it("calls getAlertCompareOperator with the alert and surfaces the result", () => {
        const { result } = renderSelectedValuesHook();

        expect(getAlertCompareOperatorSpy).toHaveBeenCalledWith(mockAutomation.alert);
        expect(result.current.selectedComparisonOperator).toBe("GREATER_THAN");
    });

    it("calls getAlertRelativeOperator with the alert and surfaces the result", () => {
        const sentinel = ["PP", "CHANGE"] as any;
        getAlertRelativeOperatorSpy.mockReturnValue(sentinel);

        const { result } = renderSelectedValuesHook();

        expect(getAlertRelativeOperatorSpy).toHaveBeenCalledWith(mockAutomation.alert);
        expect(result.current.selectedRelativeOperator).toBe(sentinel);
    });

    it("calls getAlertAiOperator with the alert and surfaces the result", () => {
        renderSelectedValuesHook();
        expect(getAlertAiOperatorSpy).toHaveBeenCalledWith(mockAutomation.alert);
    });

    it("calls getAlertSensitivity with the alert and surfaces the result", () => {
        renderSelectedValuesHook();
        expect(getAlertSensitivitySpy).toHaveBeenCalledWith(mockAutomation.alert);
    });

    it("calls getAlertGranularity with the alert and surfaces the result", () => {
        renderSelectedValuesHook();
        expect(getAlertGranularitySpy).toHaveBeenCalledWith(mockAutomation.alert);
    });

    it("calls getAlertAttribute with (supportedAttributes, editedAutomation) and surfaces the result", () => {
        const { result } = renderSelectedValuesHook();

        expect(getAlertAttributeSpy).toHaveBeenCalledWith(supportedAttributes, mockAutomation);
        expect(result.current.selectedAttribute).toBe(SENTINEL_ATTRIBUTE);
        expect(result.current.selectedValue).toBe(SENTINEL_VALUE);
    });
});

// ---------------------------------------------------------------------------
// Case 2: selectedComparator uses the derived selectedMeasure (order dependency)
// ---------------------------------------------------------------------------

describe("useAlertSelectedValues — selectedComparator order dependency", () => {
    it("calls getAlertComparison with the value returned by getAlertMeasure (not the raw input)", () => {
        const derivedMeasure = { measure: { localIdentifier: "derived" } } as unknown as AlertMetric;
        getAlertMeasureSpy.mockReturnValue(derivedMeasure);

        const sentinelComparator = { measure: derivedMeasure, isPrimary: true } as any;
        getAlertComparisonSpy.mockReturnValue(sentinelComparator);

        const { result } = renderSelectedValuesHook();

        // getAlertComparison must receive the value getAlertMeasure returned, not the raw supportedMeasures
        expect(getAlertComparisonSpy).toHaveBeenCalledWith(derivedMeasure, mockAutomation.alert);
        expect(result.current.selectedComparator).toBe(sentinelComparator);
    });
});

// ---------------------------------------------------------------------------
// Case 3: notification channel selection
// ---------------------------------------------------------------------------

describe("useAlertSelectedValues — notification channel selection", () => {
    it("returns the channel whose id matches editedAutomation.notificationChannel", () => {
        const { result } = renderSelectedValuesHook({
            editedAutomation: { ...mockAutomation, notificationChannel: "channel-2" },
        });
        expect(result.current.selectedNotificationChannel).toBe(mockChannel2);
    });

    it("returns undefined when no channel matches the notificationChannel id", () => {
        const { result } = renderSelectedValuesHook({
            editedAutomation: { ...mockAutomation, notificationChannel: "channel-does-not-exist" },
        });
        expect(result.current.selectedNotificationChannel).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// Case 4: recipient-policy booleans
// ---------------------------------------------------------------------------

describe("useAlertSelectedValues — recipient-policy booleans", () => {
    it("sets allowExternalRecipients=true when selectedChannel.allowedRecipients === 'external'", () => {
        const { result } = renderSelectedValuesHook({
            editedAutomation: { ...mockAutomation, notificationChannel: "channel-1" },
        });
        expect(result.current.allowExternalRecipients).toBe(true);
        expect(result.current.allowOnlyLoggedUserRecipients).toBe(false);
    });

    it("sets allowOnlyLoggedUserRecipients=true when selectedChannel.allowedRecipients === 'creator'", () => {
        const { result } = renderSelectedValuesHook({
            editedAutomation: { ...mockAutomation, notificationChannel: "channel-2" },
        });
        expect(result.current.allowExternalRecipients).toBe(false);
        expect(result.current.allowOnlyLoggedUserRecipients).toBe(true);
    });

    it("sets both booleans to false when selectedChannel.allowedRecipients === 'all'", () => {
        const { result } = renderSelectedValuesHook({
            editedAutomation: { ...mockAutomation, notificationChannel: "channel-3" },
        });
        expect(result.current.allowExternalRecipients).toBe(false);
        expect(result.current.allowOnlyLoggedUserRecipients).toBe(false);
    });

    it("sets both booleans to false when no channel is matched (undefined selectedNotificationChannel)", () => {
        const { result } = renderSelectedValuesHook({
            editedAutomation: { ...mockAutomation, notificationChannel: "no-such-channel" },
        });
        expect(result.current.allowExternalRecipients).toBe(false);
        expect(result.current.allowOnlyLoggedUserRecipients).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Case 5: undefined draft — no throw, stable undefined/false returns
// ---------------------------------------------------------------------------

describe("useAlertSelectedValues — undefined editedAutomation", () => {
    it("does not throw and returns safe defaults when editedAutomation is undefined", () => {
        getAlertMeasureSpy.mockReturnValue(undefined);
        getAlertCompareOperatorSpy.mockReturnValue(undefined);
        getAlertRelativeOperatorSpy.mockReturnValue(undefined);
        getAlertAiOperatorSpy.mockReturnValue(undefined);
        getAlertComparisonSpy.mockReturnValue(undefined);
        getAlertSensitivitySpy.mockReturnValue(undefined);
        getAlertGranularitySpy.mockReturnValue(undefined);
        getAlertAttributeSpy.mockReturnValue([undefined, undefined] as any);

        const { result } = renderSelectedValuesHook({ editedAutomation: undefined });

        // getters receive undefined alert
        expect(getAlertMeasureSpy).toHaveBeenCalledWith(supportedMeasures, undefined);
        expect(getAlertCompareOperatorSpy).toHaveBeenCalledWith(undefined);
        expect(getAlertAttributeSpy).toHaveBeenCalledWith(supportedAttributes, undefined);

        expect(result.current.selectedNotificationChannel).toBeUndefined();
        expect(result.current.allowExternalRecipients).toBe(false);
        expect(result.current.allowOnlyLoggedUserRecipients).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Case 6: rerender on draft change — no stale-capture / caching
// ---------------------------------------------------------------------------

describe("useAlertSelectedValues — rerender on draft change (§3 risk path)", () => {
    it("updates returned selection when editedAutomation is replaced on rerender", () => {
        const automationV2: IAutomationMetadataObjectDefinition = {
            ...mockAutomation,
            notificationChannel: "channel-2",
            alert: { condition: { type: "comparison", operator: "LESS_THAN", left: {}, right: 10 } },
        } as unknown as IAutomationMetadataObjectDefinition;

        const { result, rerender } = renderHook(
            ({ props }: { props: IUseAlertSelectedValuesProps }) => useAlertSelectedValues(props),
            {
                initialProps: {
                    props: {
                        editedAutomation: mockAutomation,
                        supportedMeasures,
                        supportedAttributes,
                        notificationChannels,
                    },
                },
            },
        );

        // Initially resolves to channel-1
        expect(result.current.selectedNotificationChannel).toBe(mockChannel1);

        // Rerender with a new draft pointing at channel-2
        rerender({
            props: {
                editedAutomation: automationV2,
                supportedMeasures,
                supportedAttributes,
                notificationChannels,
            },
        });

        // Must now reflect the new channel — proves no stale closure
        expect(result.current.selectedNotificationChannel).toBe(mockChannel2);

        // Getters must have been called with the new alert
        expect(getAlertMeasureSpy).toHaveBeenLastCalledWith(supportedMeasures, automationV2.alert);
        expect(getAlertCompareOperatorSpy).toHaveBeenLastCalledWith(automationV2.alert);
    });
});
