// (C) 2026 GoodData Corporation

import { fireEvent, render, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { IntlWrapper } from "../../../../localization/IntlWrapper.js";
import { AutomationsContextProvider } from "../../../contexts/AutomationsContext.js";
import { ScheduledEmailDialogContextProvider } from "../../../contexts/ScheduledEmailDialogContext.js";
import { type ISlotProps } from "../../../shared/slots/types.js";
import { ScheduledEmailDialogStateProvider } from "../../state/ScheduledEmailDialogStateProvider.js";
import { AUTOMATIONS_CONTEXT, SCHEDULED_EMAIL_DIALOG_CONTEXT } from "../../state/test/fixtures.js";
import {
    type IDefaultScheduledEmailDialogProps,
    type IScheduledEmailDialogFiltersProps,
    type ScheduledEmailDialogHeaderDefaultProps,
} from "../../types.js";
import { DefaultScheduledEmailDialog } from "../DefaultScheduledEmailDialog.js";

// The one hook unrelated to slot threading, mocked the same way the SE state acceptance test mocks it:
// useValidateExistingAutomationFilters computes staleness against the dashboard's current filters and is
// not read by the assertions below.
const { mockUseValidateExistingAutomationFilters } = vi.hoisted(() => ({
    mockUseValidateExistingAutomationFilters: vi.fn(),
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
vi.mock("../../DefaultScheduledEmailDialog/components/RecipientsSelect/RecipientsSelect.js", () => ({
    RecipientsSelect: () => null,
}));

const DEFAULT_HEADER_SELECTOR = ".s-gd-notifications-channels-dialog-title";
const SUBMIT_BUTTON_SELECTOR = ".s-dialog-submit-button";
const OVER_LONG_TITLE = "x".repeat(300);

// Slot components live at module scope: a slot's reference identity is load-bearing, and defining
// them inline in a test would not exercise the contract the renderer relies on.
function CustomHeader() {
    return <div data-testid="custom-header" />;
}

function WrappingHeader({ Default, defaultProps }: ISlotProps<ScheduledEmailDialogHeaderDefaultProps>) {
    return (
        <>
            <div data-testid="slot-banner" />
            <Default {...defaultProps} />
        </>
    );
}

function OverLongTitleHeader({ defaultProps }: ISlotProps<ScheduledEmailDialogHeaderDefaultProps>) {
    return (
        <button data-testid="set-over-long-title" onClick={() => defaultProps.onChange(OVER_LONG_TITLE)} />
    );
}

const DEFAULT_FILTERS_SELECTOR = ".s-gd-notifications-channels-dialog-automation-filters";

function CustomFilters() {
    return <div data-testid="custom-filters" />;
}

function WrappingFilters({ Default, defaultProps }: ISlotProps<IScheduledEmailDialogFiltersProps>) {
    return (
        <>
            <div data-testid="filters-banner" />
            <Default {...defaultProps} />
        </>
    );
}

const capturedFiltersProps: IScheduledEmailDialogFiltersProps[] = [];

function StoreToggleFilters({ Default, defaultProps }: ISlotProps<IScheduledEmailDialogFiltersProps>) {
    capturedFiltersProps.push(defaultProps);
    return (
        <>
            <button
                data-testid="toggle-store"
                onClick={() =>
                    defaultProps.onStoreFiltersChange(
                        !defaultProps.storeFilters,
                        defaultProps.selectedFilters,
                        undefined,
                    )
                }
            />
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
    capturedFiltersProps.length = 0;

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
        <IntlWrapper>
            <AutomationsContextProvider value={AUTOMATIONS_CONTEXT}>
                <ScheduledEmailDialogContextProvider value={dialogContext}>
                    <ScheduledEmailDialogStateProvider>
                        <DefaultScheduledEmailDialog onCancel={() => {}} {...props} />
                    </ScheduledEmailDialogStateProvider>
                </ScheduledEmailDialogContextProvider>
            </AutomationsContextProvider>
        </IntlWrapper>,
    );
}

describe("DefaultScheduledEmailDialog slots.Header", () => {
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
            { ...SCHEDULED_EMAIL_DIALOG_CONTEXT, isLoading: true },
        );

        // the loading dialog renders (its shell class is present), without the slot or the default header
        expect(baseElement.querySelector(".s-gd-notifications-channels-dialog")).not.toBeNull();
        expect(within(baseElement).queryByTestId("custom-header")).toBeNull();
        expect(baseElement.querySelector(DEFAULT_HEADER_SELECTOR)).toBeNull();
    });
});

describe("DefaultScheduledEmailDialog slots.Filters", () => {
    it("renders the default filters region on the filters tab when no slots are passed", async () => {
        const { baseElement } = renderDialog();

        await selectFiltersTab(baseElement);
        expect(baseElement.querySelector(DEFAULT_FILTERS_SELECTOR)).not.toBeNull();
    });

    it("replaces the default filters region when the slot renders its own content", async () => {
        const { baseElement } = renderDialog({ slots: { Filters: CustomFilters } });

        await selectFiltersTab(baseElement);
        expect(within(baseElement).getByTestId("custom-filters")).toBeInTheDocument();
        expect(baseElement.querySelector(DEFAULT_FILTERS_SELECTOR)).toBeNull();
    });

    it("wraps the default filters region", async () => {
        const { baseElement } = renderDialog({ slots: { Filters: WrappingFilters } });

        await selectFiltersTab(baseElement);
        expect(within(baseElement).getByTestId("filters-banner")).toBeInTheDocument();
        expect(baseElement.querySelector(DEFAULT_FILTERS_SELECTOR)).not.toBeNull();
    });

    it("renders the slot only while the filters tab is selected, on one mounted tree", async () => {
        const { baseElement } = renderDialog({ slots: { Filters: CustomFilters } });

        // the dialog opens on the General tab - the slot is not mounted
        expect(within(baseElement).queryByTestId("custom-filters")).toBeNull();

        await selectFiltersTab(baseElement);
        expect(within(baseElement).getByTestId("custom-filters")).toBeInTheDocument();

        fireEvent.click(within(baseElement).getByRole("tab", { name: /general/i }));
        expect(within(baseElement).queryByTestId("custom-filters")).toBeNull();
    });

    it("passes live defaultProps: onStoreFiltersChange round-trips the toggle", async () => {
        const { baseElement } = renderDialog({ slots: { Filters: StoreToggleFilters } });

        await selectFiltersTab(baseElement);
        const initial = capturedFiltersProps.at(-1)!.storeFilters;

        fireEvent.click(within(baseElement).getByTestId("toggle-store"));

        expect(capturedFiltersProps.at(-1)!.storeFilters).toBe(!initial);
    });

    it("does not render the slot while the dialog context is loading", () => {
        const { baseElement } = renderDialog(
            { slots: { Filters: CustomFilters } },
            { ...SCHEDULED_EMAIL_DIALOG_CONTEXT, isLoading: true },
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
        expect(within(baseElement).queryByRole("tab", { name: /filters/i })).toBeNull();
    });
});
