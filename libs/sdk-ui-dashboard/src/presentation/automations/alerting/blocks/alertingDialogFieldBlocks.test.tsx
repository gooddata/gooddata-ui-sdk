// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { fireEvent, render, renderHook, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObject,
    type IDataSetMetadataObject,
    idRef,
    newAttribute,
    newPreviousPeriodMeasure,
} from "@gooddata/sdk-model";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import {
    AlertingDialogContextProvider,
    type IAlertingDialogContextValue,
} from "../../contexts/AlertingDialogContext.js";
import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../contexts/AutomationsContext.js";
import { useAlertActions } from "../state/AlertActionsContext.js";
import { useAlertDraft } from "../state/AlertDraftContext.js";
import {
    useAlertingDialogAttributeProps,
    useAlertingDialogComparisonOperatorProps,
    useAlertingDialogComparisonPeriodProps,
    useAlertingDialogGranularityProps,
    useAlertingDialogMeasureProps,
    useAlertingDialogSensitivityProps,
    useAlertingDialogThresholdProps,
    useAlertingDialogTriggerIntervalProps,
    useAlertingDialogTriggerModeProps,
} from "../state/useAlertingDialogFieldProps.js";
import {
    ALERTING_DIALOG_CONTEXT,
    AUTOMATIONS_CONTEXT,
    SENTINEL_CHANNEL,
    SENTINEL_MEASURE,
} from "../tests/alerting.test.helpers.js";
import { BlockProviders, VALID_FILTERS_RESULT } from "../tests/alertingBlocks.test.helpers.js";
import {
    type AlertAttribute,
    type AlertMetric,
    AlertMetricComparatorType,
    type IAlertingDialogComparisonOperatorProps,
} from "../types.js";
import { getAlertThreshold } from "../utils/getters.js";

import { AlertingDialogAttribute } from "./AlertingDialogAttribute.js";
import { AlertingDialogComparisonOperator } from "./AlertingDialogComparisonOperator.js";
import { AlertingDialogComparisonPeriod } from "./AlertingDialogComparisonPeriod.js";
import { AlertingDialogGranularity } from "./AlertingDialogGranularity.js";
import { AlertingDialogMeasure } from "./AlertingDialogMeasure.js";
import { AlertingDialogSensitivity } from "./AlertingDialogSensitivity.js";
import { AlertingDialogThreshold } from "./AlertingDialogThreshold.js";
import { AlertingDialogTriggerInterval } from "./AlertingDialogTriggerInterval.js";
import { AlertingDialogTriggerMode } from "./AlertingDialogTriggerMode.js";

// `isolate: false` shares one module graph per worker, so the real modules imported above may
// already have been replaced by a sibling test file's `vi.mock()` earlier in the same worker.
// Dropping the module registry from `vi.hoisted()` (it runs before this file's own imports, unlike
// any `beforeEach`) makes those imports resolve through the real implementations again.
vi.hoisted(() => {
    vi.resetModules();
});

const { mockUseAlertSupportedMetrics, mockUseValidateExistingAutomationFilters } = vi.hoisted(() => ({
    mockUseAlertSupportedMetrics: vi.fn(),
    mockUseValidateExistingAutomationFilters: vi.fn(),
}));

vi.mock("../state/useAlertSupportedMetrics.js", () => ({
    useAlertSupportedMetrics: mockUseAlertSupportedMetrics,
}));

vi.mock("../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

const FORM_FIELD_SELECTOR = ".gd-dashboard-alerting-dialog-form-field";
const MEASURE_SELECTOR = ".s-alert-measure-select";
const ATTRIBUTE_SELECTOR = ".gd-alert-attribute-select";
const OPERATOR_SELECTOR = ".s-alert-operator-select";
const OPERATOR_LIST_SELECTOR = '[data-testid="s-alert-operator-select-list"]';
const ANOMALY_DETECTION_OPTION_SELECTOR = ".gd-icon-anomaly-detection";
const THRESHOLD_INPUT_SELECTOR = ".s-alert-value-input input";
const COMPARISON_SELECTOR = ".s-alert-comparison-select";
// With exactly one comparator the comparison-period control renders the period as static text
// instead of a dropdown.
const COMPARISON_STATIC_SELECTOR = ".gd-edit-alert__measure-info";
const SENSITIVITY_SELECTOR = ".s-alert-sensitivity-select";
const GRANULARITY_SELECTOR = ".s-alert-granularity-select";
const TRIGGER_MODE_SELECTOR = ".s-alert-trigger-mode-select";
const TRIGGER_INTERVAL_SELECTOR = ".s-alert-trigger-interval-select";

// The date dataset the period shift is computed over; an anomaly-detection condition carries its ref.
const DATE_DATASET: IDataSetMetadataObject = {
    type: "dataSet",
    id: "ds1",
    uri: "/ds1",
    ref: idRef("ds1", "dataSet"),
    title: "Date",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
};

// A measure with a period comparator: the operator select offers the relative and anomaly-detection
// operators only for such a measure.
const MEASURE_WITH_COMPARATOR: AlertMetric = {
    ...SENTINEL_MEASURE,
    comparators: [
        {
            measure: newPreviousPeriodMeasure("m1", [{ dataSet: "ds1", periodsAgo: 1 }], (m) =>
                m.localId("m1_pp"),
            ),
            isPrimary: false,
            comparator: AlertMetricComparatorType.PreviousPeriod,
            dataset: DATE_DATASET,
            granularity: "GDC.time.date",
        },
    ],
};

const SENTINEL_ATTRIBUTE: AlertAttribute = {
    attribute: newAttribute("df1", (a) => a.localId("a1")),
    type: "attribute",
};

const ANOMALY_DETECTION_CONTEXT: IAutomationsContextValue = {
    ...AUTOMATIONS_CONTEXT,
    features: { ...AUTOMATIONS_CONTEXT.features, enableAnomalyDetectionAlert: true, canUseAiAssistant: true },
};

// A saved comparison alert on the sentinel measure with threshold 10.
const ALERT_TO_EDIT: IAutomationMetadataObject = {
    type: "automation",
    id: "alert-1",
    uri: "/alert-1",
    ref: idRef("alert-1"),
    title: "Alert",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    notificationChannel: SENTINEL_CHANNEL.id,
    alert: {
        trigger: { state: "ACTIVE" },
        condition: {
            type: "comparison",
            operator: "GREATER_THAN",
            left: { id: "m1", title: "m1", format: "#,##0.00" },
            right: 10,
        },
        execution: { attributes: [], measures: [SENTINEL_MEASURE.measure], filters: [] },
    },
};
const EDIT_MODE_CONTEXT: IAlertingDialogContextValue = {
    ...ALERTING_DIALOG_CONTEXT,
    alertToEdit: ALERT_TO_EDIT,
};

const SUPPORTED_METRICS = {
    measureFormatMap: {},
    supportedMeasures: [SENTINEL_MEASURE],
    supportedAttributes: [] as AlertAttribute[],
    isResultLoading: false,
    getAttributeValues: vi.fn(),
    getMetricValue: vi.fn(),
};

beforeEach(() => {
    vi.clearAllMocks();

    mockUseAlertSupportedMetrics.mockReturnValue(SUPPORTED_METRICS);

    mockUseValidateExistingAutomationFilters.mockReturnValue(VALID_FILTERS_RESULT);
});

// Probes read and write the state the way a customer's own field would.
function DraftThresholdProbe() {
    const { editedAutomation } = useAlertDraft();
    return <span data-testid="draft-threshold">{getAlertThreshold(editedAutomation?.alert) ?? "NONE"}</span>;
}

function ConditionProbe() {
    const {
        onAnomalyDetectionChange,
        onComparisonOperatorChange,
        onRelativeOperatorChange,
        onTriggerModeChange,
    } = useAlertActions();
    return (
        <>
            <button
                data-testid="set-anomaly-detection"
                onClick={() => onAnomalyDetectionChange(MEASURE_WITH_COMPARATOR)}
            />
            <button
                data-testid="set-comparison"
                onClick={() => onComparisonOperatorChange(MEASURE_WITH_COMPARATOR, "GREATER_THAN")}
            />
            <button
                data-testid="set-change-operator"
                onClick={() => onRelativeOperatorChange(MEASURE_WITH_COMPARATOR, "INCREASES_BY", "CHANGE")}
            />
            <button
                data-testid="set-once-per-interval"
                onClick={() => onTriggerModeChange("ONCE_PER_INTERVAL")}
            />
        </>
    );
}

// A customer shell: every field block in its own markup, no FormFieldGroup, no slots.
function FieldsShell({
    comparisonOperator,
    children,
}: {
    comparisonOperator?: Partial<IAlertingDialogComparisonOperatorProps>;
    children?: ReactNode;
}) {
    return (
        <div data-testid="shell">
            <AlertingDialogMeasure />
            <AlertingDialogAttribute />
            <AlertingDialogComparisonOperator {...comparisonOperator} />
            <AlertingDialogThreshold />
            <AlertingDialogComparisonPeriod />
            <AlertingDialogSensitivity />
            <AlertingDialogGranularity />
            <AlertingDialogTriggerMode />
            <AlertingDialogTriggerInterval />
            {children}
        </div>
    );
}

function renderShell(
    shellProps?: Parameters<typeof FieldsShell>[0],
    contexts?: { dialogContext?: IAlertingDialogContextValue; automationsContext?: IAutomationsContextValue },
) {
    return render(
        <BlockProviders {...contexts}>
            <FieldsShell {...shellProps} />
        </BlockProviders>,
    );
}

describe("alerting dialog field blocks", () => {
    it("render the fields of a new comparison alert and nothing for the fields its condition has no value for", () => {
        const { container } = renderShell();

        expect(container.querySelector(MEASURE_SELECTOR)).not.toBeNull();
        expect(container.querySelector(OPERATOR_SELECTOR)).not.toBeNull();
        expect(container.querySelector(THRESHOLD_INPUT_SELECTOR)).not.toBeNull();
        expect(container.querySelector(TRIGGER_MODE_SELECTOR)).not.toBeNull();

        expect(container.querySelector(ATTRIBUTE_SELECTOR)).toBeNull();
        expect(container.querySelector(COMPARISON_SELECTOR)).toBeNull();
        expect(container.querySelector(SENSITIVITY_SELECTOR)).toBeNull();
        expect(container.querySelector(GRANULARITY_SELECTOR)).toBeNull();
        expect(container.querySelector(TRIGGER_INTERVAL_SELECTOR)).toBeNull();

        // The gated blocks hide their label row too, not just the control.
        expect(container.querySelectorAll(FORM_FIELD_SELECTOR)).toHaveLength(4);
    });

    it("render the attribute field once the insight has a non-date attribute", () => {
        mockUseAlertSupportedMetrics.mockReturnValue({
            ...SUPPORTED_METRICS,
            supportedAttributes: [SENTINEL_ATTRIBUTE],
        });

        const { container } = renderShell();

        expect(container.querySelector(ATTRIBUTE_SELECTOR)).not.toBeNull();
        expect(container.querySelectorAll(FORM_FIELD_SELECTOR)).toHaveLength(5);
    });

    it("write through the threshold block into the draft", () => {
        const view = renderShell({ children: <DraftThresholdProbe /> });

        fireEvent.change(view.container.querySelector<HTMLInputElement>(THRESHOLD_INPUT_SELECTOR)!, {
            target: { value: "15" },
        });

        expect(view.getByTestId("draft-threshold")).toHaveTextContent("15");
    });

    it("follow the draft: anomaly detection swaps the threshold for sensitivity and granularity", () => {
        mockUseAlertSupportedMetrics.mockReturnValue({
            ...SUPPORTED_METRICS,
            supportedMeasures: [MEASURE_WITH_COMPARATOR],
        });

        const view = renderShell({ children: <ConditionProbe /> });

        fireEvent.click(view.getByTestId("set-anomaly-detection"));

        expect(view.container.querySelector(THRESHOLD_INPUT_SELECTOR)).toBeNull();
        expect(view.container.querySelector(SENSITIVITY_SELECTOR)).not.toBeNull();
        expect(view.container.querySelector(GRANULARITY_SELECTOR)).not.toBeNull();
    });

    it("follow the draft: a change condition shows the comparison-period field", () => {
        mockUseAlertSupportedMetrics.mockReturnValue({
            ...SUPPORTED_METRICS,
            supportedMeasures: [MEASURE_WITH_COMPARATOR],
        });

        const view = renderShell({ children: <ConditionProbe /> });
        const fieldsBefore = view.container.querySelectorAll(FORM_FIELD_SELECTOR).length;

        fireEvent.click(view.getByTestId("set-change-operator"));

        expect(view.container.querySelector(COMPARISON_STATIC_SELECTOR)).not.toBeNull();
        expect(view.container.querySelectorAll(FORM_FIELD_SELECTOR)).toHaveLength(fieldsBefore + 1);
    });

    it("follow the draft: a once-per-interval trigger shows the interval field", () => {
        const view = renderShell({ children: <ConditionProbe /> });

        fireEvent.click(view.getByTestId("set-once-per-interval"));

        expect(view.container.querySelector(TRIGGER_INTERVAL_SELECTOR)).not.toBeNull();
    });

    it("render nothing while the dialog context is loading, without throwing", () => {
        let view: ReturnType<typeof renderShell> | undefined;

        expect(() => {
            view = renderShell(undefined, { dialogContext: { ...ALERTING_DIALOG_CONTEXT, isLoading: true } });
        }).not.toThrow();

        expect(within(view!.container).getByTestId("shell").childElementCount).toBe(0);
    });

    // The block calls the props hook before its anomaly-detection gate, so `useAlertThreshold`
    // stays mounted while the input is hidden. A conditional mount would reset the hook's value
    // and its `touched` state, and the auto-compute effect would overwrite the user's number.
    it("keep the threshold the user typed across a switch to anomaly detection and back", () => {
        mockUseAlertSupportedMetrics.mockReturnValue({
            ...SUPPORTED_METRICS,
            supportedMeasures: [MEASURE_WITH_COMPARATOR],
            getMetricValue: vi.fn(() => 42),
        });

        const view = renderShell({
            children: (
                <>
                    <ConditionProbe />
                    <DraftThresholdProbe />
                </>
            ),
        });

        fireEvent.change(view.container.querySelector<HTMLInputElement>(THRESHOLD_INPUT_SELECTOR)!, {
            target: { value: "15" },
        });
        expect(view.getByTestId("draft-threshold")).toHaveTextContent("15");

        fireEvent.click(view.getByTestId("set-anomaly-detection"));
        expect(view.container.querySelector(THRESHOLD_INPUT_SELECTOR)).toBeNull();

        fireEvent.click(view.getByTestId("set-comparison"));

        expect(view.container.querySelector<HTMLInputElement>(THRESHOLD_INPUT_SELECTOR)!.value).toBe("15");
        // Leaving anomaly detection clears the condition's threshold; a remounted hook would fill
        // that gap with the measure's current value (42), losing the 15 the user typed.
        expect(view.getByTestId("draft-threshold")).toHaveTextContent("NONE");
    });
});

// MC-4971: the Mastercard FI host hides the anomaly-detection condition options with a <style> hack
// against our listbox item ids; the block override is the supported way.
describe("AlertingDialogComparisonOperator — enableAnomalyDetectionAlert", () => {
    beforeEach(() => {
        mockUseAlertSupportedMetrics.mockReturnValue({
            ...SUPPORTED_METRICS,
            supportedMeasures: [MEASURE_WITH_COMPARATOR],
        });
    });

    function openOperatorList(container: HTMLElement) {
        fireEvent.click(container.querySelector(OPERATOR_SELECTOR)!);
        // The kit Dropdown renders its body through an Overlay portal, outside the render container.
        return document.body.querySelector(OPERATOR_LIST_SELECTOR);
    }

    it("offers the anomaly-detection operator when the features allow it", () => {
        const { container } = renderShell(undefined, { automationsContext: ANOMALY_DETECTION_CONTEXT });

        const list = openOperatorList(container);

        expect(list).not.toBeNull();
        expect(list!.querySelector(ANOMALY_DETECTION_OPTION_SELECTOR)).not.toBeNull();
    });

    it("hides the anomaly-detection operator with enableAnomalyDetectionAlert={false}", () => {
        const { container } = renderShell(
            { comparisonOperator: { enableAnomalyDetectionAlert: false } },
            { automationsContext: ANOMALY_DETECTION_CONTEXT },
        );

        const list = openOperatorList(container);

        expect(list).not.toBeNull();
        expect(list!.querySelector(ANOMALY_DETECTION_OPTION_SELECTOR)).toBeNull();
    });
});

// The threshold block is the one useAlertThreshold mount; its isNewAlert polarity decides whether
// the measure's current value overwrites the threshold on mount.
describe("AlertingDialogThreshold — the auto-computed threshold", () => {
    it("is computed from the measure's current value for a new alert", () => {
        mockUseAlertSupportedMetrics.mockReturnValue({
            ...SUPPORTED_METRICS,
            getMetricValue: vi.fn(() => 42),
        });

        const view = renderShell({ children: <DraftThresholdProbe /> });

        expect(view.container.querySelector<HTMLInputElement>(THRESHOLD_INPUT_SELECTOR)!.value).toBe("42");
        expect(view.getByTestId("draft-threshold")).toHaveTextContent("42");
    });

    it("leaves the saved threshold alone when editing", () => {
        mockUseAlertSupportedMetrics.mockReturnValue({
            ...SUPPORTED_METRICS,
            getMetricValue: vi.fn(() => 42),
        });

        const view = renderShell({ children: <DraftThresholdProbe /> }, { dialogContext: EDIT_MODE_CONTEXT });

        expect(view.container.querySelector<HTMLInputElement>(THRESHOLD_INPUT_SELECTOR)!.value).toBe("10");
        expect(view.getByTestId("draft-threshold")).toHaveTextContent("10");
    });
});

// Without the state provider but inside the dialog contexts — the shape of a shell that forgot to
// check isLoading. useIntl and the dialog contexts resolve, so the state-provider error is the one
// that surfaces.
function WithoutStateProvider({ children }: { children: ReactNode }) {
    return (
        <IntlWrapper>
            <AutomationsContextProvider value={AUTOMATIONS_CONTEXT}>
                <AlertingDialogContextProvider value={ALERTING_DIALOG_CONTEXT}>
                    {children}
                </AlertingDialogContextProvider>
            </AutomationsContextProvider>
        </IntlWrapper>
    );
}

// Explicitly typed: an inline it.each of mixed tuple members infers a union per position.
const HOOKS: [string, () => unknown][] = [
    ["useAlertingDialogMeasureProps", () => useAlertingDialogMeasureProps()],
    ["useAlertingDialogAttributeProps", () => useAlertingDialogAttributeProps()],
    ["useAlertingDialogComparisonOperatorProps", () => useAlertingDialogComparisonOperatorProps()],
    ["useAlertingDialogThresholdProps", () => useAlertingDialogThresholdProps()],
    ["useAlertingDialogComparisonPeriodProps", () => useAlertingDialogComparisonPeriodProps()],
    ["useAlertingDialogSensitivityProps", () => useAlertingDialogSensitivityProps()],
    ["useAlertingDialogGranularityProps", () => useAlertingDialogGranularityProps()],
    ["useAlertingDialogTriggerModeProps", () => useAlertingDialogTriggerModeProps()],
    ["useAlertingDialogTriggerIntervalProps", () => useAlertingDialogTriggerIntervalProps()],
];

describe("alerting field props hooks — outside the state provider", () => {
    it.each(HOOKS)("%s throws the state-provider error", (_name, hook) => {
        expect(() => renderHook(hook, { wrapper: WithoutStateProvider })).toThrow(
            /must be used within AlertingDialogStateProvider/,
        );
    });
});
