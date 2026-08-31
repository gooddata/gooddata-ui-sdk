// (C) 2026 GoodData Corporation

import { render, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { AlertingDialogContextProvider } from "../../contexts/AlertingDialogContext.js";
import { AutomationsContextProvider } from "../../contexts/AutomationsContext.js";
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

describe("DefaultAlertingDialog topContent/bottomContent", () => {
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
            { ...ALERTING_DIALOG_CONTEXT, isLoading: true },
        );
        expect(queryByTestId("top-content")).not.toBeInTheDocument();
        expect(queryByTestId("bottom-content")).not.toBeInTheDocument();
    });
});
