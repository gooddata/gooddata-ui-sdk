// (C) 2026 GoodData Corporation

import { fireEvent, render, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAutomationUserRecipient, type INotificationChannelIdentifier } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { type ISlotProps } from "@gooddata/sdk-ui-kit";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { AutomationsContextProvider } from "../../contexts/AutomationsContext.js";
import { ScheduledEmailDialogContextProvider } from "../../contexts/ScheduledEmailDialogContext.js";
import { type IAutomationDialogDestinationProps } from "../../shared/slots/types.js";
import { ScheduledEmailDialogStateProvider } from "../state/ScheduledEmailDialogStateProvider.js";
import {
    AUTOMATIONS_CONTEXT,
    SCHEDULED_EMAIL_DIALOG_CONTEXT,
    SENTINEL_CHANNEL,
} from "../tests/scheduledEmail.test.helpers.js";
import {
    type IDefaultScheduledEmailDialogProps,
    type IScheduledEmailDialogRecipientsProps,
} from "../types.js";

import { DefaultScheduledEmailDialog } from "./DefaultScheduledEmailDialog.js";

// `isolate: false` shares one module graph per worker, so the real modules imported above may
// already have been replaced by a sibling test file's `vi.mock()` earlier in the same worker.
// Dropping the module registry from `vi.hoisted()` (it runs before this file's own imports, unlike
// any `beforeEach`) makes those imports resolve through the real implementations again.
vi.hoisted(() => {
    vi.resetModules();
});

// The one hook unrelated to slot threading, mocked the same way the SE state acceptance test mocks it:
// useValidateExistingAutomationFilters computes staleness against the dashboard's current filters and is
// not read by the assertions below.
const { mockUseValidateExistingAutomationFilters } = vi.hoisted(() => ({
    mockUseValidateExistingAutomationFilters: vi.fn(),
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

const DEFAULT_DESTINATION_SELECTOR = ".s-gd-notifications-channels-dialog-destination";
const DEFAULT_RECIPIENTS_SELECTOR = ".s-gd-notifications-channels-dialog-recipients";
const DEFAULT_HEADER_SELECTOR = ".s-gd-notifications-channels-dialog-title";

const SECOND_CHANNEL: INotificationChannelIdentifier = {
    type: "notificationChannel",
    destinationType: "webhook",
    id: "channel-2",
    title: "Second channel",
    allowedRecipients: "internal",
};

const TWO_CHANNEL_CONTEXT = {
    ...SCHEDULED_EMAIL_DIALOG_CONTEXT,
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

const capturedRecipientsProps: IScheduledEmailDialogRecipientsProps[] = [];

function WrappingRecipients({ Default, defaultProps }: ISlotProps<IScheduledEmailDialogRecipientsProps>) {
    capturedRecipientsProps.push(defaultProps);
    return (
        <>
            <button data-testid="set-recipients" onClick={() => defaultProps.onChange([NEW_RECIPIENT])} />
            <Default {...defaultProps} />
        </>
    );
}

// The dialog's Overlay aligns itself (and lifts the visibility:hidden it renders with initially)
// on a real timer, not inside React's commit phase - the tab is only accessible-by-role once that
// has run, so finding it needs to poll rather than query synchronously.
async function selectFiltersTab(baseElement: HTMLElement) {
    const tab = await within(baseElement).findByRole("tab", { name: /filters/i });
    fireEvent.click(tab);
}

beforeEach(() => {
    vi.clearAllMocks();
    capturedRecipientsProps.length = 0;

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

function renderDialog(
    props?: Partial<IDefaultScheduledEmailDialogProps>,
    dialogContext = SCHEDULED_EMAIL_DIALOG_CONTEXT,
) {
    return render(
        <BackendProvider backend={dummyBackend()}>
            <WorkspaceProvider workspace="ws-1">
                <IntlWrapper>
                    <AutomationsContextProvider value={AUTOMATIONS_CONTEXT}>
                        <ScheduledEmailDialogContextProvider value={dialogContext}>
                            <ScheduledEmailDialogStateProvider>
                                <DefaultScheduledEmailDialog onCancel={() => {}} {...props} />
                            </ScheduledEmailDialogStateProvider>
                        </ScheduledEmailDialogContextProvider>
                    </AutomationsContextProvider>
                </IntlWrapper>
            </WorkspaceProvider>
        </BackendProvider>,
    );
}

describe("DefaultScheduledEmailDialog slots.Destination", () => {
    it("renders the default destination region when no slots are passed", () => {
        const { baseElement } = renderDialog();

        expect(baseElement.querySelector(DEFAULT_DESTINATION_SELECTOR)).not.toBeNull();
    });

    it("replaces the default destination region when the slot renders its own content", () => {
        const { baseElement } = renderDialog({ slots: { Destination: CustomDestination } });

        expect(within(baseElement).getByTestId("custom-destination")).toBeInTheDocument();
        expect(baseElement.querySelector(DEFAULT_DESTINATION_SELECTOR)).toBeNull();
    });

    it("wraps the default destination region with live defaultProps", () => {
        const { baseElement } = renderDialog(
            { slots: { Destination: WrappingDestination } },
            TWO_CHANNEL_CONTEXT,
        );

        expect(baseElement.querySelector(DEFAULT_DESTINATION_SELECTOR)).not.toBeNull();

        // defaultProps are the live values: onChange round-trips through the draft and back
        // into the default select's button text
        fireEvent.click(within(baseElement).getByTestId("set-destination"));

        expect(baseElement.querySelector(DEFAULT_DESTINATION_SELECTOR)).toHaveTextContent("Second channel");
    });

    it("renders the slot only while the General tab is selected, on one mounted tree", async () => {
        const { baseElement } = renderDialog({ slots: { Destination: CustomDestination } });

        // the dialog opens on the General tab - the slot is mounted
        expect(within(baseElement).getByTestId("custom-destination")).toBeInTheDocument();

        await selectFiltersTab(baseElement);
        expect(within(baseElement).queryByTestId("custom-destination")).toBeNull();

        fireEvent.click(within(baseElement).getByRole("tab", { name: /general/i }));
        expect(within(baseElement).getByTestId("custom-destination")).toBeInTheDocument();
    });

    it("does not render the slot while the dialog context is loading", () => {
        const { baseElement } = renderDialog(
            { slots: { Destination: CustomDestination } },
            { ...SCHEDULED_EMAIL_DIALOG_CONTEXT, isLoading: true },
        );

        expect(baseElement.querySelector(".s-gd-notifications-channels-dialog")).not.toBeNull();
        expect(within(baseElement).queryByTestId("custom-destination")).toBeNull();
        expect(baseElement.querySelector(DEFAULT_DESTINATION_SELECTOR)).toBeNull();
    });
});

describe("DefaultScheduledEmailDialog slots.Recipients", () => {
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
        // into the default select's rendered recipient chips; the SE-only submit hook is threaded
        expect(typeof capturedRecipientsProps.at(-1)!.onKeyDownSubmit).toBe("function");
        fireEvent.click(within(baseElement).getByTestId("set-recipients"));

        expect(baseElement.querySelector(DEFAULT_RECIPIENTS_SELECTOR)).toHaveTextContent("New user");
    });

    it("keeps the wrapped recipients input focused across draft-driven re-renders", () => {
        const { baseElement } = renderDialog({ slots: { Recipients: WrappingRecipients } });

        const recipientsInput = baseElement.querySelector<HTMLInputElement>(
            '[id="schedule.email.recipients"]',
        )!;
        expect(recipientsInput).not.toBeNull();
        recipientsInput.focus();

        // drive re-renders from above the slot through the draft (title changes), not through
        // the select itself — a threading identity churn would remount the region and drop focus
        const titleInput = baseElement.querySelector<HTMLInputElement>(`${DEFAULT_HEADER_SELECTOR} input`)!;
        fireEvent.change(titleInput, { target: { value: "N" } });
        fireEvent.change(titleInput, { target: { value: "Ne" } });

        expect(document.activeElement).toBe(recipientsInput);
    });

    it("renders the slot only while the General tab is selected, on one mounted tree", async () => {
        const { baseElement } = renderDialog({ slots: { Recipients: CustomRecipients } });

        expect(within(baseElement).getByTestId("custom-recipients")).toBeInTheDocument();

        await selectFiltersTab(baseElement);
        expect(within(baseElement).queryByTestId("custom-recipients")).toBeNull();

        fireEvent.click(within(baseElement).getByRole("tab", { name: /general/i }));
        expect(within(baseElement).getByTestId("custom-recipients")).toBeInTheDocument();
    });

    it("does not render the slot while the dialog context is loading", () => {
        const { baseElement } = renderDialog(
            { slots: { Recipients: CustomRecipients } },
            { ...SCHEDULED_EMAIL_DIALOG_CONTEXT, isLoading: true },
        );

        expect(within(baseElement).queryByTestId("custom-recipients")).toBeNull();
        expect(baseElement.querySelector(DEFAULT_RECIPIENTS_SELECTOR)).toBeNull();
    });
});
