// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAutomationAlert,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";

import { type AlertAttribute, type AlertMetric } from "../../../types.js";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them. We use vi.fn() inline and retrieve spies via
// vi.mocked() after the import statements.
// ---------------------------------------------------------------------------

vi.mock("../useThresholdValue.js", () => ({
    useThresholdValue: vi.fn(),
}));

vi.mock("../../utils/transformation.js", async (importOriginal: () => Promise<Record<string, unknown>>) => {
    const actual = await importOriginal();
    return {
        ...actual,
        transformAlertByValue: vi.fn(),
    };
});

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import * as transformationModule from "../../utils/transformation.js";
import { useAlertThreshold, type IUseAlertThresholdProps } from "../useAlertThreshold.js";
import * as useThresholdValueModule from "../useThresholdValue.js";

// ---------------------------------------------------------------------------
// Typed spy references (resolved after import)
// ---------------------------------------------------------------------------

const useThresholdValueSpy = vi.mocked(useThresholdValueModule.useThresholdValue);
const transformAlertByValueSpy = vi.mocked(transformationModule.transformAlertByValue);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SENTINEL_VALUE = 42;
const SENTINEL_ON_CHANGE = vi.fn();
const SENTINEL_ON_BLUR = vi.fn();
const SENTINEL_ERROR_MESSAGE = "some-error";

const mockAlert: IAutomationAlert = {
    condition: { type: "comparison", operator: "GREATER_THAN", left: {}, right: 10 },
} as IAutomationAlert;

const mockAutomation: IAutomationMetadataObjectDefinition = {
    type: "automation",
    title: "Test Alert",
    alert: mockAlert,
} as IAutomationMetadataObjectDefinition;

const mockGetMetricValue = vi.fn();
const mockSetEditedAutomation = vi.fn();

const SENTINEL_RELATIVE_OPERATOR = undefined;
const SENTINEL_MEASURE = { measure: { localIdentifier: "m1" } } as unknown as AlertMetric;
const SENTINEL_ATTRIBUTE = { attribute: { localIdentifier: "a1" } } as unknown as AlertAttribute;
const SENTINEL_SELECTED_VALUE = "attr-value";

const BASE_PROPS: IUseAlertThresholdProps = {
    setEditedAutomation: mockSetEditedAutomation,
    editedAutomation: mockAutomation,
    getMetricValue: mockGetMetricValue,
    isNewAlert: false,
    selectedRelativeOperator: SENTINEL_RELATIVE_OPERATOR,
    selectedMeasure: SENTINEL_MEASURE,
    selectedAttribute: SENTINEL_ATTRIBUTE,
    selectedValue: SENTINEL_SELECTED_VALUE,
};

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();
    useThresholdValueSpy.mockReturnValue({
        value: SENTINEL_VALUE,
        onChange: SENTINEL_ON_CHANGE,
        onBlur: SENTINEL_ON_BLUR,
        errorMessage: SENTINEL_ERROR_MESSAGE,
    });
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderThresholdHook(props: Partial<IUseAlertThresholdProps> = {}) {
    const mergedProps: IUseAlertThresholdProps = { ...BASE_PROPS, ...props };
    return renderHook(() => useAlertThreshold(mergedProps));
}

// ---------------------------------------------------------------------------
// Case 1: wiring — useThresholdValue called with 8 args in order, return mapped
// ---------------------------------------------------------------------------

describe("useAlertThreshold — wiring", () => {
    it("calls useThresholdValue with the 8 args in the correct order", () => {
        renderThresholdHook();

        expect(useThresholdValueSpy).toHaveBeenCalledOnce();
        const [onValueChangeFn, getMetricValue, isNewAlert, alert, relOp, measure, attr, value] =
            useThresholdValueSpy.mock.calls[0];

        expect(typeof onValueChangeFn).toBe("function");
        expect(getMetricValue).toBe(mockGetMetricValue);
        expect(isNewAlert).toBe(false);
        expect(alert).toBe(mockAlert);
        // undefined selectedRelativeOperator passes through verbatim; useThresholdValue defaults it internally
        expect(relOp).toBeUndefined();
        expect(measure).toBe(SENTINEL_MEASURE);
        expect(attr).toBe(SENTINEL_ATTRIBUTE);
        expect(value).toBe(SENTINEL_SELECTED_VALUE);
    });

    it("returns value, onChange, onBlur from useThresholdValue", () => {
        const { result } = renderThresholdHook();

        expect(result.current.value).toBe(SENTINEL_VALUE);
        expect(result.current.onChange).toBe(SENTINEL_ON_CHANGE);
        expect(result.current.onBlur).toBe(SENTINEL_ON_BLUR);
    });

    it("maps errorMessage → thresholdErrorMessage", () => {
        const { result } = renderThresholdHook();

        expect(result.current.thresholdErrorMessage).toBe(SENTINEL_ERROR_MESSAGE);
    });
});

// ---------------------------------------------------------------------------
// Case 2: onValueChange updater (§3 risk path)
// ---------------------------------------------------------------------------

describe("useAlertThreshold — onValueChange updater", () => {
    it("invokes setEditedAutomation with an updater that calls transformAlertByValue(alert, value) for a mock alert", () => {
        renderThresholdHook();

        // Capture the onValueChange callback that was passed as the first arg to useThresholdValue
        const onValueChange = useThresholdValueSpy.mock.calls[0][0];

        const mockTransformedAlert = { type: "automation", title: "transformed" } as any;
        transformAlertByValueSpy.mockReturnValue(mockTransformedAlert);

        // Invoke onValueChange with a number
        onValueChange(99);

        // setEditedAutomation was called with an updater function
        expect(mockSetEditedAutomation).toHaveBeenCalledOnce();
        const updater = mockSetEditedAutomation.mock.calls[0][0];
        expect(typeof updater).toBe("function");

        // When passed a non-undefined alert, the updater calls transformAlertByValue and returns the result
        const mockExistingAlert = {
            type: "automation",
            title: "existing",
        } as IAutomationMetadataObject;
        const returnValue = updater(mockExistingAlert);
        expect(transformAlertByValueSpy).toHaveBeenCalledWith(mockExistingAlert, 99);
        expect(returnValue).toBe(mockTransformedAlert);
    });

    it("returns undefined (not throwing) when the updater receives undefined", () => {
        renderThresholdHook();

        const onValueChange = useThresholdValueSpy.mock.calls[0][0];
        onValueChange(99);

        const updater = mockSetEditedAutomation.mock.calls[0][0];

        // When passed undefined, the updater must return undefined without throwing
        expect(() => updater(undefined)).not.toThrow();
        expect(updater(undefined)).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// Case 3: editedAutomation?.alert passthrough incl. undefined draft
// ---------------------------------------------------------------------------

describe("useAlertThreshold — alert passthrough", () => {
    it("forwards editedAutomation.alert as the 4th arg to useThresholdValue", () => {
        renderThresholdHook();

        const alertArg = useThresholdValueSpy.mock.calls[0][3];
        expect(alertArg).toBe(mockAlert);
    });

    it("passes undefined as the 4th arg when editedAutomation is undefined (no throw)", () => {
        expect(() => renderThresholdHook({ editedAutomation: undefined })).not.toThrow();

        const alertArg = useThresholdValueSpy.mock.calls[0][3];
        expect(alertArg).toBeUndefined();
    });
});
