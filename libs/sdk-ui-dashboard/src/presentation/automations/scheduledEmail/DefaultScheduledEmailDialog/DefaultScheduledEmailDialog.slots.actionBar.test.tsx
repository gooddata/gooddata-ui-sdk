// (C) 2026 GoodData Corporation

import { fireEvent, render, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAutomationMetadataObject, idRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { type ISlotProps } from "@gooddata/sdk-ui-kit";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { AutomationsContextProvider } from "../../contexts/AutomationsContext.js";
import { ScheduledEmailDialogContextProvider } from "../../contexts/ScheduledEmailDialogContext.js";
import { type IAutomationDialogActionBarProps } from "../../shared/slots/types.js";
import { ScheduledEmailDialogStateProvider } from "../state/ScheduledEmailDialogStateProvider.js";
import { AUTOMATIONS_CONTEXT, SCHEDULED_EMAIL_DIALOG_CONTEXT } from "../tests/scheduledEmail.test.helpers.js";
import { type IDefaultScheduledEmailDialogProps } from "../types.js";

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

// RecipientsSelect renders for real under this harness; it reaches the backend through
// useBackendStrict/useWorkspaceStrict, so the harness provides a real (dummy) backend and
// workspace — the search never activates in these tests, so the backend is never queried.

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

beforeEach(() => {
    vi.clearAllMocks();

    mockUseValidateExistingAutomationFilters.mockReturnValue(VALID_FILTERS_RESULT);
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

// Edit-mode variant: the Delete button and the "Save" label exist only with scheduledExportToEdit set.
const SCHEDULED_EXPORT_TO_EDIT: IAutomationMetadataObject = {
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
const EDIT_MODE_CONTEXT = {
    ...SCHEDULED_EMAIL_DIALOG_CONTEXT,
    scheduledExportToEdit: SCHEDULED_EXPORT_TO_EDIT,
};

function CustomActionBar() {
    return <div data-testid="custom-action-bar" />;
}

function WrappingActionBar({ Default, defaultProps }: ISlotProps<IAutomationDialogActionBarProps>) {
    return (
        <>
            <button data-testid="fire-cancel" onClick={() => defaultProps.onCancel()} />
            <Default {...defaultProps} submitButtonText="Send now" />
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

describe("DefaultScheduledEmailDialog slots.ActionBar", () => {
    it("renders the default action bar when no slots are passed", () => {
        const { baseElement } = renderDialog();
        const footer = baseElement.querySelector(".gd-dialog-footer");
        expect(footer).toBeInTheDocument();
        expect(within(footer as HTMLElement).getByText("Cancel")).toBeInTheDocument();
        expect(within(footer as HTMLElement).getByText("Create")).toBeInTheDocument();
        expect(baseElement.querySelector("#confirm-dialog-base-id")).toBeInTheDocument();
        // help link present, Delete absent in create mode
        expect(
            baseElement.querySelector(".gd-notifications-channels-dialog-footer-link"),
        ).toBeInTheDocument();
        expect(within(footer as HTMLElement).queryByText("Delete")).not.toBeInTheDocument();
    });

    it("shows Delete and the save label in edit mode", () => {
        const { baseElement } = renderDialog(undefined, EDIT_MODE_CONTEXT);
        const footer = baseElement.querySelector(".gd-dialog-footer") as HTMLElement;
        expect(within(footer).getByText("Save")).toBeInTheDocument();
        expect(within(footer).getByText("Delete")).toBeInTheDocument();
    });

    it("replaces the action bar with the slot component", () => {
        const { baseElement, getByTestId } = renderDialog({ slots: { ActionBar: CustomActionBar } });
        expect(getByTestId("custom-action-bar")).toBeInTheDocument();
        expect(baseElement.querySelector(".gd-dialog-footer")).toBeNull();
        expect(baseElement.querySelector("#confirm-dialog-base-id")).toBeNull();
    });

    it("wraps the default and receives live defaultProps", () => {
        const onCancel = vi.fn();
        const { baseElement, getByTestId } = renderDialog({
            onCancel,
            slots: { ActionBar: WrappingActionBar },
        });
        // the default row renders inside the wrap, relabeled through a defaultProps override
        const footer = baseElement.querySelector(".gd-dialog-footer") as HTMLElement;
        expect(within(footer).getByText("Send now")).toBeInTheDocument();
        expect(baseElement.querySelector("#confirm-dialog-base-id")).toBeInTheDocument();
        // defaultProps.onCancel is the live dialog callback
        fireEvent.click(getByTestId("fire-cancel"));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("does not render the slot while the dialog context reports loading", () => {
        const { queryByTestId } = renderDialog(
            { slots: { ActionBar: CustomActionBar } },
            { ...SCHEDULED_EMAIL_DIALOG_CONTEXT, isLoading: true },
        );
        expect(queryByTestId("custom-action-bar")).not.toBeInTheDocument();
    });

    it("does not render the slot while the stale-filters confirmation is shown", () => {
        // automationIsValid derives from useValidateExistingAutomationFilters; isValid: false opens
        // ApplyCurrentFiltersConfirmDialog before the main dialog renders any region.
        mockUseValidateExistingAutomationFilters.mockReturnValue({
            ...VALID_FILTERS_RESULT,
            isValid: false,
            filtersAreStale: true,
        });
        const { queryByTestId, baseElement } = renderDialog({ slots: { ActionBar: CustomActionBar } });
        expect(queryByTestId("custom-action-bar")).not.toBeInTheDocument();
        expect(baseElement.querySelector(".s-gd-notifications-channels-dialog")).toBeNull();
    });

    it("renders the ActionBar slot on both the General and the Filters tab", async () => {
        const { baseElement, getByTestId } = renderDialog({ slots: { ActionBar: CustomActionBar } });

        expect(getByTestId("custom-action-bar")).toBeInTheDocument();

        await selectFiltersTab(baseElement);
        expect(getByTestId("custom-action-bar")).toBeInTheDocument();
    });
});
