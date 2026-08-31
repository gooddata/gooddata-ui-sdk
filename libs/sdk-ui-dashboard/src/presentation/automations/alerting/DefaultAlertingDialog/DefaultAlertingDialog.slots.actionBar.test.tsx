// (C) 2026 GoodData Corporation

import { fireEvent, render, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAutomationMetadataObject, idRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { type ISlotProps } from "@gooddata/sdk-ui-kit";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { AlertingDialogContextProvider } from "../../contexts/AlertingDialogContext.js";
import { AutomationsContextProvider } from "../../contexts/AutomationsContext.js";
import { type IAutomationDialogActionBarProps } from "../../shared/slots/types.js";
import { AlertingDialogStateProvider } from "../state/AlertingDialogStateProvider.js";
import {
    ALERTING_DIALOG_CONTEXT,
    AUTOMATIONS_CONTEXT,
    SENTINEL_MEASURE,
} from "../tests/alerting.test.helpers.js";
import { VALID_FILTERS_RESULT } from "../tests/alertingBlocks.test.helpers.js";
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

// Form controls unrelated to the region under test, stubbed for mount cost only.
vi.mock("./DefaultAlertingDialogMeasure.js", () => ({
    DefaultAlertingDialogMeasure: () => null,
}));
vi.mock("./DefaultAlertingDialogComparisonOperator.js", () => ({
    DefaultAlertingDialogComparisonOperator: () => null,
}));
vi.mock("./DefaultAlertingDialogTriggerMode.js", () => ({
    DefaultAlertingDialogTriggerMode: () => null,
}));

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

    mockUseValidateExistingAutomationFilters.mockReturnValue(VALID_FILTERS_RESULT);
});

function renderDialog(props?: Partial<IDefaultAlertingDialogProps>, dialogContext = ALERTING_DIALOG_CONTEXT) {
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

// Edit-mode variant: the Delete button and the "save" label exist only with alertToEdit set.
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
};
const EDIT_MODE_CONTEXT = { ...ALERTING_DIALOG_CONTEXT, alertToEdit: ALERT_TO_EDIT };

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

describe("DefaultAlertingDialog slots.ActionBar", () => {
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
            { ...ALERTING_DIALOG_CONTEXT, isLoading: true },
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
});
