// (C) 2026 GoodData Corporation

import { fireEvent, render, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAutomationUserRecipient, type INotificationChannelIdentifier } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { type ISlotProps } from "@gooddata/sdk-ui-kit";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { AlertingDialogContextProvider } from "../../contexts/AlertingDialogContext.js";
import { AutomationsContextProvider } from "../../contexts/AutomationsContext.js";
import {
    type IAutomationDialogDestinationProps,
    type IAutomationDialogRecipientsProps,
} from "../../shared/slots/types.js";
import { AlertingDialogStateProvider } from "../state/AlertingDialogStateProvider.js";
import {
    ALERTING_DIALOG_CONTEXT,
    AUTOMATIONS_CONTEXT,
    SENTINEL_CHANNEL,
    SENTINEL_MEASURE,
} from "../tests/alerting.test.helpers.js";
import { type AlertAttribute, type IDefaultAlertingDialogProps } from "../types.js";

import { DefaultAlertingDialog } from "./DefaultAlertingDialog.js";

// `isolate: false` shares one module graph per worker, so the real modules imported above may
// already have been replaced by a sibling test file's `vi.mock()` earlier in the same worker.
// Dropping the module registry from `vi.hoisted()` (it runs before this file's own imports, unlike
// any `beforeEach`) makes those imports resolve through the real implementations again.
vi.hoisted(() => {
    vi.resetModules();
});

// The two hooks unrelated to slot threading, mocked the same way the state acceptance test mocks them:
// useAlertSupportedMetrics resolves measures from an execution result, useValidateExistingAutomationFilters
// computes staleness against the dashboard's current filters — neither is read by the assertions below.
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

// The filter bar's attribute dropdown reads the dashboard redux store, which this harness does not mount.
vi.mock("../../../filterBar/attributeFilter/addAttributeFilter/AttributesDropdown.js", () => ({
    AttributesDropdown: () => null,
}));

// A selected attribute filter chip reads the dashboard redux store, which this harness does not mount.
vi.mock("../../../filterBar/attributeFilter/DefaultDashboardAttributeFilter.js", () => ({
    DefaultDashboardAttributeFilter: () => null,
}));

// Unlike the sibling slots suite, RecipientsSelect renders for REAL here — its region is this
// suite's subject. It reaches the backend through useBackendStrict/useWorkspaceStrict, so the
// harness provides a real (dummy) backend and workspace instead of mocking that hook — the search
// itself never activates in these tests (no dropdown focus), so the backend is never queried.

// Form controls unrelated to the two regions under test, stubbed for mount cost only.
vi.mock("./components/AlertMeasureSelect.js", () => ({
    AlertMeasureSelect: () => null,
}));
vi.mock("./components/AlertComparisonOperatorSelect.js", () => ({
    AlertComparisonOperatorSelect: () => null,
}));
vi.mock("./components/AlertTriggerModeSelect.js", () => ({
    AlertTriggerModeSelect: () => null,
}));

const DEFAULT_DESTINATION_SELECTOR = ".s-alert-destination-select";
const DEFAULT_RECIPIENTS_SELECTOR = ".s-gd-notifications-channels-dialog-recipients";
const TITLE_INPUT_SELECTOR = ".s-gd-notifications-channels-dialog-title input";

const SECOND_CHANNEL: INotificationChannelIdentifier = {
    type: "notificationChannel",
    destinationType: "webhook",
    id: "channel-2",
    title: "Second channel",
    allowedRecipients: "internal",
};

// The shared fixture context has a single channel, under which the default dialog hides the
// destination row entirely — the two-channel variant is what makes the region exist.
const TWO_CHANNEL_CONTEXT = {
    ...ALERTING_DIALOG_CONTEXT,
    notificationChannels: [SENTINEL_CHANNEL, SECOND_CHANNEL],
};

const NEW_RECIPIENT: IAutomationUserRecipient = {
    type: "user",
    id: "user-2",
    name: "New user",
    email: "user2@example.com",
};

// Slot components live at module scope: a slot's reference identity is load-bearing, and defining
// them inline in a test would not exercise the contract the renderer relies on.
function CustomDestination() {
    return <div data-testid="custom-destination" />;
}

function CustomRecipients() {
    return <div data-testid="custom-recipients" />;
}

function WrappingDestination({ Default, defaultProps }: ISlotProps<IAutomationDialogDestinationProps>) {
    return (
        <>
            <button data-testid="set-destination" onClick={() => defaultProps.onChange(SECOND_CHANNEL.id)} />
            <Default {...defaultProps} />
        </>
    );
}

function WrappingRecipients({ Default, defaultProps }: ISlotProps<IAutomationDialogRecipientsProps>) {
    return (
        <>
            <button data-testid="set-recipients" onClick={() => defaultProps.onChange([NEW_RECIPIENT])} />
            <Default {...defaultProps} />
        </>
    );
}

beforeEach(() => {
    vi.clearAllMocks();

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

function renderDialog(props?: Partial<IDefaultAlertingDialogProps>, dialogContext = TWO_CHANNEL_CONTEXT) {
    return render(
        <BackendProvider backend={dummyBackend()}>
            <WorkspaceProvider workspace="ws-1">
                <IntlWrapper>
                    <AutomationsContextProvider value={AUTOMATIONS_CONTEXT}>
                        <AlertingDialogContextProvider value={dialogContext}>
                            <AlertingDialogStateProvider>
                                <DefaultAlertingDialog onCancel={() => {}} {...props} />
                            </AlertingDialogStateProvider>
                        </AlertingDialogContextProvider>
                    </AutomationsContextProvider>
                </IntlWrapper>
            </WorkspaceProvider>
        </BackendProvider>,
    );
}

describe("DefaultAlertingDialog slots.Destination", () => {
    it("renders the default destination region when no slots are passed", () => {
        const { baseElement } = renderDialog();

        expect(baseElement.querySelector(DEFAULT_DESTINATION_SELECTOR)).not.toBeNull();
    });

    it("hides the destination region with a single channel when no slots are passed", () => {
        const { baseElement } = renderDialog(undefined, ALERTING_DIALOG_CONTEXT);

        expect(baseElement.querySelector(DEFAULT_DESTINATION_SELECTOR)).toBeNull();
    });

    it("replaces the default destination region when the slot renders its own content", () => {
        const { baseElement } = renderDialog({ slots: { Destination: CustomDestination } });

        expect(within(baseElement).getByTestId("custom-destination")).toBeInTheDocument();
        expect(baseElement.querySelector(DEFAULT_DESTINATION_SELECTOR)).toBeNull();
    });

    it("wraps the default destination region with live defaultProps", () => {
        const { baseElement } = renderDialog({ slots: { Destination: WrappingDestination } });

        expect(baseElement.querySelector(DEFAULT_DESTINATION_SELECTOR)).not.toBeNull();

        // defaultProps are the live values: onChange round-trips through the draft and back
        // into the default select's button text
        fireEvent.click(within(baseElement).getByTestId("set-destination"));

        expect(baseElement.querySelector(DEFAULT_DESTINATION_SELECTOR)).toHaveTextContent("Second channel");
    });

    it("does not render the slot with a single channel", () => {
        const { baseElement } = renderDialog(
            { slots: { Destination: CustomDestination } },
            ALERTING_DIALOG_CONTEXT,
        );

        expect(within(baseElement).queryByTestId("custom-destination")).toBeNull();
        expect(baseElement.querySelector(DEFAULT_DESTINATION_SELECTOR)).toBeNull();
    });

    it("does not render the slot while the dialog context is loading", () => {
        const { baseElement } = renderDialog(
            { slots: { Destination: CustomDestination } },
            { ...TWO_CHANNEL_CONTEXT, isLoading: true },
        );

        expect(baseElement.querySelector(".s-gd-notifications-channels-dialog")).not.toBeNull();
        expect(within(baseElement).queryByTestId("custom-destination")).toBeNull();
        expect(baseElement.querySelector(DEFAULT_DESTINATION_SELECTOR)).toBeNull();
    });
});

describe("DefaultAlertingDialog slots.Recipients", () => {
    it("renders the default recipients region when no slots are passed", () => {
        const { baseElement } = renderDialog();

        expect(baseElement.querySelector(DEFAULT_RECIPIENTS_SELECTOR)).not.toBeNull();
    });

    it("replaces the default recipients region when the slot renders its own content", () => {
        const { baseElement } = renderDialog({ slots: { Recipients: CustomRecipients } });

        expect(within(baseElement).getByTestId("custom-recipients")).toBeInTheDocument();
        expect(baseElement.querySelector(DEFAULT_RECIPIENTS_SELECTOR)).toBeNull();
    });

    it("wraps the default recipients region with live defaultProps", () => {
        const { baseElement } = renderDialog({ slots: { Recipients: WrappingRecipients } });

        expect(baseElement.querySelector(DEFAULT_RECIPIENTS_SELECTOR)).not.toBeNull();

        // defaultProps are the live values: onChange round-trips through the draft and back
        // into the default select's rendered recipient chips
        fireEvent.click(within(baseElement).getByTestId("set-recipients"));

        expect(baseElement.querySelector(DEFAULT_RECIPIENTS_SELECTOR)).toHaveTextContent("New user");
    });

    it("keeps the wrapped recipients input focused across draft-driven re-renders", () => {
        const { baseElement } = renderDialog({ slots: { Recipients: WrappingRecipients } });

        const recipientsInput = baseElement.querySelector<HTMLInputElement>('[id="alert.recipients"]')!;
        expect(recipientsInput).not.toBeNull();
        recipientsInput.focus();

        // drive re-renders from above the slot through the draft (title changes), not through
        // the select itself — a threading identity churn would remount the region and drop focus
        const titleInput = baseElement.querySelector<HTMLInputElement>(TITLE_INPUT_SELECTOR)!;
        fireEvent.change(titleInput, { target: { value: "N" } });
        fireEvent.change(titleInput, { target: { value: "Ne" } });

        expect(document.activeElement).toBe(recipientsInput);
    });

    it("does not render the slot while the dialog context is loading", () => {
        const { baseElement } = renderDialog(
            { slots: { Recipients: CustomRecipients } },
            { ...TWO_CHANNEL_CONTEXT, isLoading: true },
        );

        expect(within(baseElement).queryByTestId("custom-recipients")).toBeNull();
        expect(baseElement.querySelector(DEFAULT_RECIPIENTS_SELECTOR)).toBeNull();
    });
});
