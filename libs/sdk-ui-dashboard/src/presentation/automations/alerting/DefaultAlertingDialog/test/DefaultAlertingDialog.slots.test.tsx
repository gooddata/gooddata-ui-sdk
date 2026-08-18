// (C) 2026 GoodData Corporation

import { fireEvent, render, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { IntlWrapper } from "../../../../localization/IntlWrapper.js";
import { AlertingDialogContextProvider } from "../../../contexts/AlertingDialogContext.js";
import { AutomationsContextProvider } from "../../../contexts/AutomationsContext.js";
import { type ISlotProps } from "../../../shared/slots/types.js";
import { AlertingDialogStateProvider } from "../../state/AlertingDialogStateProvider.js";
import {
    ALERTING_DIALOG_CONTEXT,
    AUTOMATIONS_CONTEXT,
    NEXT_FILTER,
    SENTINEL_MEASURE,
} from "../../state/test/fixtures.js";
import {
    type AlertAttribute,
    type AlertingDialogHeaderDefaultProps,
    type IAlertingDialogFiltersProps,
    type IDefaultAlertingDialogProps,
} from "../../types.js";
import { DefaultAlertingDialog } from "../DefaultAlertingDialog.js";

// The two hooks unrelated to slot threading, mocked the same way the state acceptance test mocks them:
// useAlertSupportedMetrics resolves measures from an execution result, useValidateExistingAutomationFilters
// computes staleness against the dashboard's current filters — neither is read by the assertions below.
const { mockUseAlertSupportedMetrics, mockUseValidateExistingAutomationFilters } = vi.hoisted(() => ({
    mockUseAlertSupportedMetrics: vi.fn(),
    mockUseValidateExistingAutomationFilters: vi.fn(),
}));

vi.mock("../../state/useAlertSupportedMetrics.js", () => ({
    useAlertSupportedMetrics: mockUseAlertSupportedMetrics,
}));

vi.mock("../../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

// The filter bar's attribute dropdown reads the dashboard redux store, which this harness does not mount.
vi.mock("../../../../filterBar/attributeFilter/addAttributeFilter/AttributesDropdown.js", () => ({
    AttributesDropdown: () => null,
}));

// A selected attribute filter chip reads the dashboard redux store, which this harness does not mount.
vi.mock("../../../../filterBar/attributeFilter/DefaultDashboardAttributeFilter.js", () => ({
    DefaultDashboardAttributeFilter: () => null,
}));

// RecipientsSelect resolves users through useBackendStrict, which this harness does not provide.
vi.mock(
    "../../../scheduledEmail/DefaultScheduledEmailDialog/components/RecipientsSelect/RecipientsSelect.js",
    () => ({
        RecipientsSelect: () => null,
    }),
);

// The form controls below the header, stubbed for cost rather than for missing wiring: every test here
// mounts the whole dialog, and these subtrees are the bulk of each mount's render work while none of them
// is read by the assertions below. Only the controls this fixture actually renders are stubbed — a single
// notification channel, no supported attributes and the default trigger mode leave the rest unrendered.
// The dialog shell, the alert state providers, the default header and the threshold input (the one control
// a test drives) all still render for real, so the Header slot contract is exercised unchanged.
// AutomationFiltersSelect renders for real — the slots.Filters suite below asserts on its DOM and drives
// onFiltersChange through it — so its AttributesDropdown/DefaultDashboardAttributeFilter children are
// mocked individually above instead of being stubbed out with it.
vi.mock("../components/AlertMeasureSelect.js", () => ({
    AlertMeasureSelect: () => null,
}));
vi.mock("../components/AlertComparisonOperatorSelect.js", () => ({
    AlertComparisonOperatorSelect: () => null,
}));
vi.mock("../components/AlertTriggerModeSelect.js", () => ({
    AlertTriggerModeSelect: () => null,
}));

const DEFAULT_HEADER_SELECTOR = ".s-gd-notifications-channels-dialog-title";
const SUBMIT_BUTTON_SELECTOR = ".s-dialog-submit-button";
// The threshold value input; filling it completes the new alert, so submit reflects the title only.
const THRESHOLD_INPUT_SELECTOR = "input.gd-input-field-small";
const OVER_LONG_TITLE = "x".repeat(300);

// Slot components live at module scope: a slot's reference identity is load-bearing, and defining
// them inline in a test would not exercise the contract the renderer relies on.
function CustomHeader() {
    return <div data-testid="custom-header" />;
}

function WrappingHeader({ Default, defaultProps }: ISlotProps<AlertingDialogHeaderDefaultProps>) {
    return (
        <>
            <div data-testid="slot-banner" />
            <Default {...defaultProps} />
        </>
    );
}

function OverLongTitleHeader({ defaultProps }: ISlotProps<AlertingDialogHeaderDefaultProps>) {
    return (
        <button data-testid="set-over-long-title" onClick={() => defaultProps.onChange(OVER_LONG_TITLE)} />
    );
}

const DEFAULT_FILTERS_SELECTOR = ".s-gd-notifications-channels-dialog-automation-filters";

function CustomFilters() {
    return <div data-testid="custom-filters" />;
}

function WrappingFilters({ Default, defaultProps }: ISlotProps<IAlertingDialogFiltersProps>) {
    return (
        <>
            <div data-testid="filters-banner" />
            <Default {...defaultProps} />
        </>
    );
}

const capturedFiltersProps: IAlertingDialogFiltersProps[] = [];

function RecordingFilters({ Default, defaultProps }: ISlotProps<IAlertingDialogFiltersProps>) {
    capturedFiltersProps.push(defaultProps);
    return (
        <>
            <button data-testid="set-filters" onClick={() => defaultProps.onFiltersChange([NEXT_FILTER])} />
            <Default {...defaultProps} />
        </>
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    capturedFiltersProps.length = 0;

    mockUseAlertSupportedMetrics.mockReturnValue({
        measureFormatMap: {},
        supportedMeasures: [SENTINEL_MEASURE],
        supportedAttributes: [] as AlertAttribute[],
        isResultLoading: false,
        getAttributeValues: vi.fn(),
        getMetricValue: vi.fn(),
    });

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
});

function renderDialog(props?: Partial<IDefaultAlertingDialogProps>, dialogContext = ALERTING_DIALOG_CONTEXT) {
    return render(
        <IntlWrapper>
            <AutomationsContextProvider value={AUTOMATIONS_CONTEXT}>
                <AlertingDialogContextProvider value={dialogContext}>
                    <AlertingDialogStateProvider>
                        <DefaultAlertingDialog onCancel={() => {}} {...props} />
                    </AlertingDialogStateProvider>
                </AlertingDialogContextProvider>
            </AutomationsContextProvider>
        </IntlWrapper>,
    );
}

describe("DefaultAlertingDialog slots.Header", () => {
    it("renders the default header when no slots are passed", () => {
        const { baseElement } = renderDialog();

        expect(baseElement.querySelector(`${DEFAULT_HEADER_SELECTOR} input`)).not.toBeNull();
    });

    it("replaces the default header when the slot renders its own content", () => {
        const { baseElement } = renderDialog({ slots: { Header: CustomHeader } });

        expect(within(baseElement).getByTestId("custom-header")).toBeInTheDocument();
        expect(baseElement.querySelector(DEFAULT_HEADER_SELECTOR)).toBeNull();
    });

    it("wraps the default header with live defaultProps", () => {
        const { baseElement } = renderDialog({ slots: { Header: WrappingHeader } });

        expect(within(baseElement).getByTestId("slot-banner")).toBeInTheDocument();
        const input = baseElement.querySelector<HTMLInputElement>(`${DEFAULT_HEADER_SELECTOR} input`);
        expect(input).not.toBeNull();

        // defaultProps are the live values: typing round-trips through the draft and back into the input
        fireEvent.change(input!, { target: { value: "New title" } });
        expect(input!.value).toBe("New title");
    });

    it("disables submit when a replacement header sets an over-long title", () => {
        const { baseElement } = renderDialog({ slots: { Header: OverLongTitleHeader } });

        fireEvent.change(baseElement.querySelector<HTMLInputElement>(THRESHOLD_INPUT_SELECTOR)!, {
            target: { value: "42" },
        });
        expect(baseElement.querySelector(SUBMIT_BUTTON_SELECTOR)).toHaveAttribute("aria-disabled", "false");

        fireEvent.click(within(baseElement).getByTestId("set-over-long-title"));

        expect(baseElement.querySelector(SUBMIT_BUTTON_SELECTOR)).toHaveAttribute("aria-disabled", "true");
    });

    it("keeps the wrapped header input focused across draft-driven re-renders", () => {
        const { baseElement } = renderDialog({ slots: { Header: WrappingHeader } });

        const input = baseElement.querySelector<HTMLInputElement>(`${DEFAULT_HEADER_SELECTOR} input`)!;
        input.focus();

        fireEvent.change(input, { target: { value: "N" } });
        fireEvent.change(input, { target: { value: "Ne" } });

        expect(document.activeElement).toBe(input);
        expect(input.value).toBe("Ne");
    });

    it("does not render the slot while the dialog context is loading", () => {
        const { baseElement } = renderDialog(
            { slots: { Header: CustomHeader } },
            { ...ALERTING_DIALOG_CONTEXT, isLoading: true },
        );

        // the loading dialog renders (its shell class is present), without the slot or the default header
        expect(baseElement.querySelector(".s-gd-notifications-channels-dialog")).not.toBeNull();
        expect(within(baseElement).queryByTestId("custom-header")).toBeNull();
        expect(baseElement.querySelector(DEFAULT_HEADER_SELECTOR)).toBeNull();
    });
});

describe("DefaultAlertingDialog slots.Filters", () => {
    it("renders the default filters region when no slots are passed", () => {
        const { baseElement } = renderDialog();

        expect(baseElement.querySelector(DEFAULT_FILTERS_SELECTOR)).not.toBeNull();
    });

    it("replaces the default filters region when the slot renders its own content", () => {
        const { baseElement } = renderDialog({ slots: { Filters: CustomFilters } });

        expect(within(baseElement).getByTestId("custom-filters")).toBeInTheDocument();
        expect(baseElement.querySelector(DEFAULT_FILTERS_SELECTOR)).toBeNull();
    });

    it("wraps the default filters region", () => {
        const { baseElement } = renderDialog({ slots: { Filters: WrappingFilters } });

        expect(within(baseElement).getByTestId("filters-banner")).toBeInTheDocument();
        expect(baseElement.querySelector(DEFAULT_FILTERS_SELECTOR)).not.toBeNull();
    });

    it("passes live defaultProps: onFiltersChange round-trips through the draft", () => {
        const { baseElement } = renderDialog({ slots: { Filters: RecordingFilters } });

        fireEvent.click(within(baseElement).getByTestId("set-filters"));

        const latest = capturedFiltersProps.at(-1)!;
        expect(latest.selectedFilters).toEqual([NEXT_FILTER]);
    });

    it("does not render the slot while the dialog context is loading", () => {
        const { baseElement } = renderDialog(
            { slots: { Filters: CustomFilters } },
            { ...ALERTING_DIALOG_CONTEXT, isLoading: true },
        );

        expect(within(baseElement).queryByTestId("custom-filters")).toBeNull();
        expect(baseElement.querySelector(DEFAULT_FILTERS_SELECTOR)).toBeNull();
    });

    it("does not render the slot while the stale-filters confirmation is shown", () => {
        mockUseValidateExistingAutomationFilters.mockReturnValue({
            isValid: false,
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
        const { baseElement } = renderDialog({ slots: { Filters: CustomFilters } });

        expect(within(baseElement).queryByTestId("custom-filters")).toBeNull();
        expect(baseElement.querySelector(DEFAULT_FILTERS_SELECTOR)).toBeNull();
    });
});
