// (C) 2026 GoodData Corporation

import { fireEvent, render, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    idRef,
} from "@gooddata/sdk-model";
import { type ISlotProps } from "@gooddata/sdk-ui-kit";

import { type IAutomationDialogActionBarProps } from "../../shared/slots/types.js";
import {
    AUTOMATIONS_CONTEXT,
    SCHEDULED_EMAIL_DIALOG_CONTEXT,
    SENTINEL_WIDGET,
} from "../tests/scheduledEmail.test.helpers.js";
import { BlockProviders } from "../tests/scheduledEmailBlocks.test.helpers.js";
import {
    type IScheduledEmailDialogFiltersProps,
    type IScheduledEmailDialogShellProps,
    type ScheduledEmailDialogHeaderDefaultProps,
} from "../types.js";

import { ScheduledEmailDialogShell } from "./ScheduledEmailDialogShell.js";

// `isolate: false` shares one module graph per worker, so the real modules imported above may
// already have been replaced by a sibling test file's `vi.mock()` earlier in the same worker.
// Dropping the module registry from `vi.hoisted()` (it runs before this file's own imports, unlike
// any `beforeEach`) makes those imports resolve through the real implementations again.
vi.hoisted(() => {
    vi.resetModules();
});

const { mockUseValidateExistingAutomationFilters } = vi.hoisted(() => ({
    mockUseValidateExistingAutomationFilters: vi.fn(),
}));

vi.mock("../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

// The filter bar's attribute dropdown and a selected attribute filter chip read the dashboard redux
// store, which this harness does not mount.
vi.mock("../../../filterBar/attributeFilter/addAttributeFilter/AttributesDropdown.js", () => ({
    AttributesDropdown: () => null,
}));
vi.mock("../../../filterBar/attributeFilter/DefaultDashboardAttributeFilter.js", () => ({
    DefaultDashboardAttributeFilter: () => null,
}));

// The delete confirmation reads the management dialog context and the backend; the shell's part is
// mounting it and routing its callbacks.
vi.mock("../DefaultScheduledEmailManagementDialog/components/DeleteScheduleConfirmDialog.js", () => ({
    DeleteScheduleConfirmDialog: ({
        onSuccess,
        onCancel,
    }: {
        scheduledEmail: IAutomationMetadataObject | IAutomationMetadataObjectDefinition;
        onSuccess?: () => void;
        onCancel: () => void;
    }) => (
        <div data-testid="delete-confirm">
            <button data-testid="confirm-delete" onClick={() => onSuccess?.()} />
            <button data-testid="cancel-delete" onClick={onCancel} />
        </div>
    ),
}));

const DIALOG_SELECTOR = ".s-gd-notifications-channels-dialog";
const CONTENT_SELECTOR = ".gd-notifications-channel-dialog-content-wrapper";
const TITLE_INPUT_SELECTOR = ".s-gd-notifications-channels-dialog-title input";
const FOOTER_SELECTOR = ".gd-dialog-footer";
const FILTERS_SELECTOR = ".s-gd-notifications-channels-dialog-automation-filters";
const ERROR_MESSAGE_SELECTOR = ".gd-notifications-channels-dialog-error";
const TAB_INFO_SELECTOR = ".gd-schedule-dialog-tab-content-info";

const VALID_FILTERS_RESULT = {
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
};

const SCHEDULE_TO_EDIT: IAutomationMetadataObject = {
    type: "automation",
    id: "schedule-1",
    uri: "/schedule-1",
    ref: idRef("schedule-1"),
    title: "Schedule",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
};
const EDIT_MODE_CONTEXT = { ...SCHEDULED_EMAIL_DIALOG_CONTEXT, scheduledExportToEdit: SCHEDULE_TO_EDIT };

const noop = () => {};

beforeEach(() => {
    vi.clearAllMocks();
    mockUseValidateExistingAutomationFilters.mockReturnValue(VALID_FILTERS_RESULT);
});

function renderShell(
    props?: Partial<IScheduledEmailDialogShellProps>,
    dialogContext = SCHEDULED_EMAIL_DIALOG_CONTEXT,
    automationsContext = AUTOMATIONS_CONTEXT,
) {
    return render(
        <BlockProviders dialogContext={dialogContext} automationsContext={automationsContext}>
            <ScheduledEmailDialogShell onCancel={noop} onSubmit={noop} isSaving={false} {...props}>
                {props?.children ?? <div data-testid="child" />}
            </ScheduledEmailDialogShell>
        </BlockProviders>,
    );
}

// The dialog's Overlay aligns itself (and lifts the visibility:hidden it renders with initially)
// on a real timer, not inside React's commit phase - the tab is only accessible-by-role once that
// has run, so finding it needs to poll rather than query synchronously.
async function selectTab(baseElement: HTMLElement, name: RegExp) {
    fireEvent.click(await within(baseElement).findByRole("tab", { name }));
}

function CustomHeader() {
    return <div data-testid="custom-header" />;
}

function CustomActionBar() {
    return <div data-testid="custom-action-bar" />;
}

function CustomFilters() {
    return <div data-testid="custom-filters" />;
}

describe("ScheduledEmailDialogShell", () => {
    it("renders the chrome around its children: overlay, dialog, title input, tabs, footer", async () => {
        const { baseElement, getByTestId } = renderShell();
        expect(baseElement.querySelector(".gd-notifications-channels-dialog-overlay")).not.toBeNull();
        expect(baseElement.querySelector(DIALOG_SELECTOR)).not.toBeNull();
        expect(baseElement.querySelector("#scheduled-email-dialog")).not.toBeNull();
        expect(baseElement.querySelector(TITLE_INPUT_SELECTOR)).not.toBeNull();
        expect(await within(baseElement).findByRole("tab", { name: /general/i })).toBeInTheDocument();
        expect(within(baseElement).getByRole("tab", { name: /filters/i })).toBeInTheDocument();
        const footer = baseElement.querySelector(FOOTER_SELECTOR) as HTMLElement;
        expect(within(footer).getByText("Cancel")).toBeInTheDocument();
        expect(within(footer).getByText("Create")).toBeInTheDocument();
        expect(within(footer).queryByText("Delete")).toBeNull();
        expect(getByTestId("child").closest(".gd-schedule-dialog-tab-content")).not.toBeNull();
        expect(getByTestId("child").closest(CONTENT_SELECTOR)).not.toBeNull();
    });

    it("frames the body: topContent, the divider, the General tab with children then the error message, bottomContent", () => {
        const { baseElement } = renderShell({
            topContent: <div data-testid="top" />,
            bottomContent: <div data-testid="bottom" />,
            savingErrorMessage: "Saving failed",
        });
        const content = baseElement.querySelector(CONTENT_SELECTOR) as HTMLElement;
        expect((content.firstElementChild as HTMLElement).dataset["testid"]).toBe("top");
        expect(content.children[1]!.className).toBe("gd-divider-with-margin");
        expect((content.lastElementChild as HTMLElement).dataset["testid"]).toBe("bottom");
        const tab = content.children[2] as HTMLElement;
        expect(tab.className).toContain("gd-schedule-dialog-tab-content");
        const message = tab.querySelector(ERROR_MESSAGE_SELECTOR) as HTMLElement;
        expect(message).toHaveTextContent("Saving failed");
        expect(
            within(tab).getByTestId("child").compareDocumentPosition(message) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });

    it("shows the per-tab info message only for a dashboard export on a tabbed dashboard", () => {
        // each variant is asserted against document.body (render()'s default baseElement), so the
        // previous variant's tree must be unmounted first or its markup leaks into the next check
        const { baseElement: plain, unmount: unmountPlain } = renderShell();
        expect(plain.querySelector(TAB_INFO_SELECTOR)).toBeNull();
        unmountPlain();

        const { baseElement: tabbed, unmount: unmountTabbed } = renderShell(
            undefined,
            SCHEDULED_EMAIL_DIALOG_CONTEXT,
            { ...AUTOMATIONS_CONTEXT, tabIds: ["tab-1", "tab-2"] },
        );
        expect(tabbed.querySelector(TAB_INFO_SELECTOR)).not.toBeNull();
        unmountTabbed();

        const { baseElement: widget } = renderShell(
            undefined,
            { ...SCHEDULED_EMAIL_DIALOG_CONTEXT, widget: SENTINEL_WIDGET },
            { ...AUTOMATIONS_CONTEXT, tabIds: ["tab-1", "tab-2"] },
        );
        expect(widget.querySelector(TAB_INFO_SELECTOR)).toBeNull();
    });

    it("switches between the General tab's children and the Filters tab's content on one mounted tree", async () => {
        const { baseElement, queryByTestId } = renderShell({
            filtersTabContent: <div data-testid="filters-tab" />,
        });
        expect(queryByTestId("child")).not.toBeNull();
        expect(queryByTestId("filters-tab")).toBeNull();

        await selectTab(baseElement, /filters/i);
        expect(queryByTestId("child")).toBeNull();
        expect(queryByTestId("filters-tab")).not.toBeNull();
        expect(queryByTestId("filters-tab")!.closest(".gd-schedule-dialog-tab-content")).not.toBeNull();

        await selectTab(baseElement, /general/i);
        expect(queryByTestId("child")).not.toBeNull();
        expect(queryByTestId("filters-tab")).toBeNull();
    });

    it("renders the default filters region on the Filters tab when no content is passed", async () => {
        const { baseElement } = renderShell();
        expect(baseElement.querySelector(FILTERS_SELECTOR)).toBeNull();
        await selectTab(baseElement, /filters/i);
        expect(baseElement.querySelector(FILTERS_SELECTOR)).not.toBeNull();
    });

    it("routes the Filters slot on the Filters tab with the live default props", async () => {
        const seen: IScheduledEmailDialogFiltersProps[] = [];
        function WrappingFilters({ Default, defaultProps }: ISlotProps<IScheduledEmailDialogFiltersProps>) {
            seen.push(defaultProps);
            return (
                <div data-testid="wrapped-filters">
                    <Default {...defaultProps} />
                </div>
            );
        }
        const { baseElement, queryByTestId } = renderShell({ slots: { Filters: WrappingFilters } });
        expect(queryByTestId("wrapped-filters")).toBeNull();
        await selectTab(baseElement, /filters/i);
        expect(queryByTestId("wrapped-filters")).not.toBeNull();
        expect(baseElement.querySelector(FILTERS_SELECTOR)).not.toBeNull();
        expect(typeof seen[0]!.onFiltersChange).toBe("function");
    });

    it("prefers filtersTabContent over the Filters slot", async () => {
        const { baseElement, queryByTestId } = renderShell({
            slots: { Filters: CustomFilters },
            filtersTabContent: <div data-testid="filters-tab" />,
        });
        await selectTab(baseElement, /filters/i);
        expect(queryByTestId("filters-tab")).not.toBeNull();
        expect(queryByTestId("custom-filters")).toBeNull();
    });

    it("routes the Header slot with the live default props", () => {
        const onSubmit = vi.fn();
        const onBack = vi.fn();
        const seen: ScheduledEmailDialogHeaderDefaultProps[] = [];
        function WrappingHeader({
            Default,
            defaultProps,
        }: ISlotProps<ScheduledEmailDialogHeaderDefaultProps>) {
            seen.push(defaultProps);
            return <Default {...defaultProps} />;
        }
        renderShell({ onSubmit, onBack, slots: { Header: WrappingHeader } });
        expect(seen[0]!.onBack).toBe(onBack);
        expect(seen[0]!.ref).toBeDefined();
        expect(typeof seen[0]!.onTitleKeyDown).toBe("function");
    });

    it("replaces the header with the slot component", () => {
        const { baseElement, getByTestId } = renderShell({ slots: { Header: CustomHeader } });
        expect(getByTestId("custom-header")).toBeInTheDocument();
        expect(baseElement.querySelector(TITLE_INPUT_SELECTOR)).toBeNull();
    });

    it("routes the ActionBar slot with the caller's submit and saving state", () => {
        const onSubmit = vi.fn();
        const seen: IAutomationDialogActionBarProps[] = [];
        function WrappingActionBar({ Default, defaultProps }: ISlotProps<IAutomationDialogActionBarProps>) {
            seen.push(defaultProps);
            return <Default {...defaultProps} submitButtonText="Send now" />;
        }
        const { baseElement } = renderShell({
            onSubmit,
            isSaving: true,
            slots: { ActionBar: WrappingActionBar },
        });
        expect(seen[0]!.onSubmit).toBe(onSubmit);
        expect(seen[0]!.isSaving).toBe(true);
        expect(seen[0]!.isSubmitDisabled).toBe(true);
        expect(
            within(baseElement.querySelector(FOOTER_SELECTOR) as HTMLElement).getByText("Send now"),
        ).toBeInTheDocument();
    });

    it("replaces the action bar with the slot component", () => {
        const { baseElement, getByTestId } = renderShell({ slots: { ActionBar: CustomActionBar } });
        expect(getByTestId("custom-action-bar")).toBeInTheDocument();
        expect(baseElement.querySelector(FOOTER_SELECTOR)).toBeNull();
    });

    it("renders the loading skeleton and no children while the dialog context reports loading", () => {
        const { baseElement, queryByTestId } = renderShell(undefined, {
            ...SCHEDULED_EMAIL_DIALOG_CONTEXT,
            isLoading: true,
        });
        expect(baseElement.querySelector(DIALOG_SELECTOR)).not.toBeNull();
        expect(baseElement.querySelector(TITLE_INPUT_SELECTOR)).toBeNull();
        expect(queryByTestId("child")).toBeNull();
    });

    it("shows the stale-filters confirmation instead of the dialog while the saved filters are invalid", () => {
        mockUseValidateExistingAutomationFilters.mockReturnValue({ ...VALID_FILTERS_RESULT, isValid: false });
        const { baseElement, queryByTestId } = renderShell();
        expect(queryByTestId("child")).toBeNull();
        expect(baseElement.querySelector(DIALOG_SELECTOR)).toBeNull();
        expect(within(baseElement).queryByRole("tab", { name: /filters/i })).toBeNull();
    });

    it("opens the delete confirmation from the footer in edit mode and routes its success", () => {
        const onDeleteSuccess = vi.fn();
        const { baseElement, getByTestId, queryByTestId } = renderShell(
            { onDeleteSuccess },
            EDIT_MODE_CONTEXT,
        );
        const footer = baseElement.querySelector(FOOTER_SELECTOR) as HTMLElement;
        expect(within(footer).getByText("Save")).toBeInTheDocument();
        fireEvent.click(within(footer).getByText("Delete"));
        expect(getByTestId("delete-confirm")).toBeInTheDocument();
        fireEvent.click(getByTestId("confirm-delete"));
        expect(onDeleteSuccess).toHaveBeenCalledTimes(1);
        expect(queryByTestId("delete-confirm")).toBeNull();
    });

    it("throws outside the scheduled-email dialog providers", () => {
        vi.spyOn(console, "error").mockImplementation(noop);
        expect(() =>
            render(
                <ScheduledEmailDialogShell onCancel={noop} onSubmit={noop} isSaving={false}>
                    <div />
                </ScheduledEmailDialogShell>,
            ),
        ).toThrow();
    });
});
