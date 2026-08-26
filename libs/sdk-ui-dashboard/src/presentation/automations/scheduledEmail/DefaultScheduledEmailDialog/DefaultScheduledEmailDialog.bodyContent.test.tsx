// (C) 2026 GoodData Corporation

import { fireEvent, render, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { AutomationsContextProvider } from "../../contexts/AutomationsContext.js";
import { ScheduledEmailDialogContextProvider } from "../../contexts/ScheduledEmailDialogContext.js";
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

// The dialog's Overlay aligns itself (and lifts the visibility:hidden it renders with initially)
// on a real timer, not inside React's commit phase - the tab is only accessible-by-role once that
// has run, so finding it needs to poll rather than query synchronously.
async function selectFiltersTab(baseElement: HTMLElement) {
    const tab = await within(baseElement).findByRole("tab", { name: /filters/i });
    fireEvent.click(tab);
}

describe("DefaultScheduledEmailDialog topContent/bottomContent", () => {
    it("renders topContent first and bottomContent last inside the scrollable content area", () => {
        const { baseElement } = renderDialog({
            topContent: <div data-testid="top-content" />,
            bottomContent: <div data-testid="bottom-content" />,
        });
        const wrapper = baseElement.querySelector(
            ".gd-notifications-channel-dialog-content-wrapper",
        ) as HTMLElement;
        expect(within(wrapper).getByTestId("top-content")).toBeInTheDocument();
        expect(within(wrapper).getByTestId("bottom-content")).toBeInTheDocument();
        expect((wrapper.firstElementChild as HTMLElement).dataset["testid"]).toBe("top-content");
        expect((wrapper.lastElementChild as HTMLElement).dataset["testid"]).toBe("bottom-content");
    });

    it("renders neither while the dialog context reports loading", () => {
        const { queryByTestId } = renderDialog(
            {
                topContent: <div data-testid="top-content" />,
                bottomContent: <div data-testid="bottom-content" />,
            },
            { ...SCHEDULED_EMAIL_DIALOG_CONTEXT, isLoading: true },
        );
        expect(queryByTestId("top-content")).not.toBeInTheDocument();
        expect(queryByTestId("bottom-content")).not.toBeInTheDocument();
    });

    it("renders both on the General and the Filters tab", async () => {
        const { baseElement, getByTestId } = renderDialog({
            topContent: <div data-testid="top-content" />,
            bottomContent: <div data-testid="bottom-content" />,
        });

        expect(getByTestId("top-content")).toBeInTheDocument();
        expect(getByTestId("bottom-content")).toBeInTheDocument();

        await selectFiltersTab(baseElement);
        expect(getByTestId("top-content")).toBeInTheDocument();
        expect(getByTestId("bottom-content")).toBeInTheDocument();
    });
});
