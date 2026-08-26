// (C) 2026 GoodData Corporation

import { fireEvent, render, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type ISlotProps } from "@gooddata/sdk-ui-kit";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { AutomationsContextProvider } from "../../contexts/AutomationsContext.js";
import { ScheduledEmailDialogContextProvider } from "../../contexts/ScheduledEmailDialogContext.js";
import { ScheduledEmailDialogStateProvider } from "../state/ScheduledEmailDialogStateProvider.js";
import { AUTOMATIONS_CONTEXT, SCHEDULED_EMAIL_DIALOG_CONTEXT } from "../tests/scheduledEmail.test.helpers.js";
import {
    type IDefaultScheduledEmailDialogProps,
    type IScheduledEmailDialogFiltersProps,
    type ScheduledEmailDialogHeaderDefaultProps,
    type ScheduledEmailDialogTimezoneDefaultProps,
} from "../types.js";

import { DefaultScheduledEmailDialog } from "./DefaultScheduledEmailDialog.js";

// The one hook unrelated to slot threading, mocked the same way the SE state acceptance test mocks it:
// useValidateExistingAutomationFilters computes staleness against the dashboard's current filters and is
// not read by the assertions below.
// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

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

// RecipientsSelect resolves users through useBackendStrict, which this harness does not provide.
vi.mock("../DefaultScheduledEmailDialog/components/RecipientsSelect/RecipientsSelect.js", () => ({
    RecipientsSelect: () => null,
}));

const DEFAULT_HEADER_SELECTOR = ".s-gd-notifications-channels-dialog-title";
const DEFAULT_TIMEZONE_SELECTOR = ".s-gd-schedule-timezone";
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

function CustomTimezoneSection() {
    return <div data-testid="custom-timezone" />;
}

function WrappingTimezoneSection({
    Default,
    defaultProps,
}: ISlotProps<ScheduledEmailDialogTimezoneDefaultProps>) {
    return (
        <>
            <div data-testid="timezone-slot-banner" data-is-widget={String(defaultProps.isWidget)} />
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
    automationsContext = AUTOMATIONS_CONTEXT,
) {
    return render(
        <IntlWrapper>
            <AutomationsContextProvider value={automationsContext}>
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

describe("DefaultScheduledEmailDialog slots.Timezone", () => {
    // the section renders only when the timezone feature is on and the dashboard allows the
    // view-mode override; the inputs arrive via the automations context (filled by connectors)
    const TIMEZONE_SECTION_CONTEXT = {
        ...AUTOMATIONS_CONTEXT,
        exportTimezones: {
            isTimezoneFeatureEnabled: true,
            allowUserOverrideInViewMode: true,
            configuredTimezoneId: undefined,
            workspaceTimezone: "Europe/Prague",
            effectiveTimezone: undefined,
            scheduledExportTimezone: undefined,
        },
    };

    function renderDialogWithTimezoneSection(props?: Partial<IDefaultScheduledEmailDialogProps>) {
        return renderDialog(props, SCHEDULED_EMAIL_DIALOG_CONTEXT, TIMEZONE_SECTION_CONTEXT);
    }

    it("renders the default section when no slots are passed", () => {
        const { baseElement } = renderDialogWithTimezoneSection();

        expect(baseElement.querySelector(DEFAULT_TIMEZONE_SELECTOR)).not.toBeNull();
    });

    it("replaces the default section when the slot renders its own content", () => {
        const { baseElement } = renderDialogWithTimezoneSection({
            slots: { Timezone: CustomTimezoneSection },
        });

        expect(within(baseElement).getByTestId("custom-timezone")).toBeInTheDocument();
        expect(baseElement.querySelector(DEFAULT_TIMEZONE_SELECTOR)).toBeNull();
    });

    it("wraps the default section with the exact props the default dialog would render it with", () => {
        const { baseElement } = renderDialogWithTimezoneSection({
            slots: { Timezone: WrappingTimezoneSection },
        });

        const banner = within(baseElement).getByTestId("timezone-slot-banner");
        // the dialog context fixture schedules a dashboard export, so defaultProps say so
        expect(banner).toHaveAttribute("data-is-widget", "false");
        expect(baseElement.querySelector(DEFAULT_TIMEZONE_SELECTOR)).not.toBeNull();
    });

    it("associates the section label and hints with the dropdown trigger", () => {
        const { baseElement } = renderDialogWithTimezoneSection();

        const section = baseElement.querySelector(DEFAULT_TIMEZONE_SELECTOR)!;
        const label = section.querySelector<HTMLLabelElement>("label.gd-label")!;
        const trigger = section.querySelector<HTMLButtonElement>(".s-timezone-select-button")!;
        const note = section.querySelector(".s-gd-schedule-timezone-note")!;
        const currentTime = section.querySelector(".s-gd-schedule-timezone-current-time")!;

        expect(label.htmlFor).toBe(trigger.id);
        const describedBy = trigger.getAttribute("aria-describedby")?.split(" ") ?? [];
        expect(describedBy).toContain(note.id);
        expect(describedBy).toContain(currentTime.id);
    });

    it("does not render the slot when the section is hidden (timezone feature off)", () => {
        const { baseElement } = renderDialog({ slots: { Timezone: CustomTimezoneSection } });

        expect(within(baseElement).queryByTestId("custom-timezone")).toBeNull();
        expect(baseElement.querySelector(DEFAULT_TIMEZONE_SELECTOR)).toBeNull();
    });

    it("does not render the slot when the dashboard forbids the view-mode override", () => {
        const { baseElement } = renderDialog(
            { slots: { Timezone: CustomTimezoneSection } },
            SCHEDULED_EMAIL_DIALOG_CONTEXT,
            {
                ...TIMEZONE_SECTION_CONTEXT,
                exportTimezones: {
                    ...TIMEZONE_SECTION_CONTEXT.exportTimezones,
                    allowUserOverrideInViewMode: false,
                },
            },
        );

        expect(within(baseElement).queryByTestId("custom-timezone")).toBeNull();
        expect(baseElement.querySelector(DEFAULT_TIMEZONE_SELECTOR)).toBeNull();
    });
});
