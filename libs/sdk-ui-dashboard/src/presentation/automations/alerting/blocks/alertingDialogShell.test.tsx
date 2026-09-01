// (C) 2026 GoodData Corporation

import { fireEvent, render, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IAutomationMetadataObject, idRef } from "@gooddata/sdk-model";
import { type ISlotProps } from "@gooddata/sdk-ui-kit";

import { type IAutomationDialogActionBarProps } from "../../shared/slots/types.js";
import { type IAlertDialogValidity } from "../state/types.js";
import { ALERTING_DIALOG_CONTEXT, SENTINEL_MEASURE } from "../tests/alerting.test.helpers.js";
import { BlockProviders, VALID_FILTERS_RESULT } from "../tests/alertingBlocks.test.helpers.js";
import {
    type AlertAttribute,
    type AlertingDialogHeaderDefaultProps,
    type IAlertingDialogShellProps,
} from "../types.js";

import { AlertingDialogShell } from "./AlertingDialogShell.js";

// `isolate: false` shares one module graph per worker, so the real modules imported above may
// already have been replaced by a sibling test file's `vi.mock()` earlier in the same worker.
// Dropping the module registry from `vi.hoisted()` (it runs before this file's own imports, unlike
// any `beforeEach`) makes those imports resolve through the real implementations again.
vi.hoisted(() => {
    vi.resetModules();
});

const { mockUseAlertSupportedMetrics, mockUseValidateExistingAutomationFilters, mockUseAlertDialogValidity } =
    vi.hoisted(() => ({
        mockUseAlertSupportedMetrics: vi.fn(),
        mockUseValidateExistingAutomationFilters: vi.fn(),
        mockUseAlertDialogValidity: vi.fn(),
    }));

vi.mock("../state/useAlertSupportedMetrics.js", () => ({
    useAlertSupportedMetrics: mockUseAlertSupportedMetrics,
}));

vi.mock("../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js", () => ({
    useValidateExistingAutomationFilters: mockUseValidateExistingAutomationFilters,
}));

// The shell turns the validity hook's message into a datapoint message; the rules behind the hook
// have their own suite.
vi.mock("../state/useAlertDialogValidity.js", () => ({
    useAlertDialogValidity: mockUseAlertDialogValidity,
}));

// The delete confirmation reads the management dialog context and the backend; the shell's part is
// mounting it and routing its callbacks.
vi.mock("../DefaultAlertingManagementDialog/components/DeleteAlertConfirmDialog.js", () => ({
    DeleteAlertConfirmDialog: ({
        alert,
        onSuccess,
        onCancel,
    }: {
        alert: IAutomationMetadataObject;
        onSuccess?: (alert: IAutomationMetadataObject) => void;
        onCancel: () => void;
    }) => (
        <div data-testid="delete-confirm">
            <button data-testid="confirm-delete" onClick={() => onSuccess?.(alert)} />
            <button data-testid="cancel-delete" onClick={onCancel} />
        </div>
    ),
}));

const DIALOG_SELECTOR = ".s-gd-notifications-channels-dialog";
const CONTENT_SELECTOR = ".gd-notifications-channel-dialog-content-wrapper";
const TITLE_INPUT_SELECTOR = ".s-gd-notifications-channels-dialog-title input";
const FOOTER_SELECTOR = ".gd-dialog-footer";
const ERROR_MESSAGE_SELECTOR = ".gd-notifications-channels-dialog-error";

const VALID: IAlertDialogValidity = {
    isSubmitDisabled: false,
    validationErrorMessage: undefined,
    isParentValid: true,
    canChangeMeasure: true,
    isInvalidConnectionToInsight: false,
};

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

const noop = () => {};

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
    mockUseAlertDialogValidity.mockReturnValue(VALID);
});

function renderShell(props?: Partial<IAlertingDialogShellProps>, dialogContext = ALERTING_DIALOG_CONTEXT) {
    return render(
        <BlockProviders dialogContext={dialogContext}>
            <AlertingDialogShell onCancel={noop} onSubmit={noop} isSaving={false} {...props}>
                {props?.children ?? <div data-testid="child" />}
            </AlertingDialogShell>
        </BlockProviders>,
    );
}

function CustomHeader() {
    return <div data-testid="custom-header" />;
}

function CustomActionBar() {
    return <div data-testid="custom-action-bar" />;
}

describe("AlertingDialogShell", () => {
    it("renders the chrome around its children: overlay, dialog, title input, footer", () => {
        const { baseElement, getByTestId } = renderShell();
        expect(baseElement.querySelector(".gd-notifications-channels-dialog-overlay")).not.toBeNull();
        const dialog = baseElement.querySelector(DIALOG_SELECTOR) as HTMLElement;
        expect(dialog).not.toBeNull();
        expect(baseElement.querySelector("#alerting-dialog")).not.toBeNull();
        expect(within(dialog).getByText("Alert", { selector: ".sr-only", exact: false })).toBeInTheDocument();
        expect(baseElement.querySelector(TITLE_INPUT_SELECTOR)).not.toBeNull();
        const footer = baseElement.querySelector(FOOTER_SELECTOR) as HTMLElement;
        expect(within(footer).getByText("Cancel")).toBeInTheDocument();
        expect(within(footer).getByText("Create")).toBeInTheDocument();
        expect(baseElement.querySelector(".gd-notifications-channels-dialog-footer-link")).not.toBeNull();
        expect(within(footer).queryByText("Delete")).toBeNull();
        expect(within(dialog).getByTestId("child")).toBeInTheDocument();
        expect(getByTestId("child").closest(CONTENT_SELECTOR)).not.toBeNull();
    });

    it("frames the body: topContent, the divider, children, the messages, bottomContent — in that order", () => {
        mockUseAlertDialogValidity.mockReturnValue({
            ...VALID,
            validationErrorMessage: "Broken connection",
            isInvalidConnectionToInsight: true,
        });
        const { baseElement } = renderShell({
            topContent: <div data-testid="top" />,
            bottomContent: <div data-testid="bottom" />,
        });
        const content = baseElement.querySelector(CONTENT_SELECTOR) as HTMLElement;
        const order = Array.from(content.children).map(
            (node) => (node as HTMLElement).dataset["testid"] ?? node.className,
        );
        expect(order[0]).toBe("top");
        expect(order[1]).toBe("gd-divider-with-margin");
        expect(order[2]).toBe("child");
        expect(order[order.length - 1]).toBe("bottom");
        const message = content.querySelector(ERROR_MESSAGE_SELECTOR) as HTMLElement;
        expect(message).toHaveTextContent("Broken connection");
        expect(message.classList.contains("error")).toBe(true);
        expect(
            within(content).getByTestId("child").compareDocumentPosition(message) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(
            message.compareDocumentPosition(within(content).getByTestId("bottom")) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });

    it("renders a warning-severity datapoint as a warning message", () => {
        mockUseAlertDialogValidity.mockReturnValue({
            ...VALID,
            validationErrorMessage: "Pick a metric",
            isInvalidConnectionToInsight: false,
        });
        const { baseElement } = renderShell();
        const message = baseElement.querySelector(ERROR_MESSAGE_SELECTOR) as HTMLElement;
        expect(message).toHaveTextContent("Pick a metric");
        expect(message.classList.contains("warning")).toBe(true);
    });

    it("routes the Header slot with the live default props", () => {
        const onCancel = vi.fn();
        const seen: AlertingDialogHeaderDefaultProps[] = [];
        function WrappingHeader({ Default, defaultProps }: ISlotProps<AlertingDialogHeaderDefaultProps>) {
            seen.push(defaultProps);
            return (
                <>
                    <button data-testid="fire-cancel" onClick={() => defaultProps.onCancel?.()} />
                    <Default {...defaultProps} />
                </>
            );
        }
        const { baseElement, getByTestId } = renderShell({ onCancel, slots: { Header: WrappingHeader } });
        expect(baseElement.querySelector(TITLE_INPUT_SELECTOR)).not.toBeNull();
        expect(seen[0]!.ref).toBeDefined();
        fireEvent.click(getByTestId("fire-cancel"));
        expect(onCancel).toHaveBeenCalledTimes(1);
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
        const footer = baseElement.querySelector(FOOTER_SELECTOR) as HTMLElement;
        expect(within(footer).getByText("Send now")).toBeInTheDocument();
    });

    it("replaces the action bar with the slot component", () => {
        const { baseElement, getByTestId } = renderShell({ slots: { ActionBar: CustomActionBar } });
        expect(getByTestId("custom-action-bar")).toBeInTheDocument();
        expect(baseElement.querySelector(FOOTER_SELECTOR)).toBeNull();
    });

    it("submits through the default footer button", () => {
        const onSubmit = vi.fn();
        const { baseElement } = renderShell({ onSubmit });
        fireEvent.click(baseElement.querySelector(".s-dialog-submit-button") as HTMLElement);
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("renders the loading skeleton and no children while the dialog context reports loading", () => {
        const { baseElement, queryByTestId } = renderShell(undefined, {
            ...ALERTING_DIALOG_CONTEXT,
            isLoading: true,
        });
        expect(baseElement.querySelector(DIALOG_SELECTOR)).not.toBeNull();
        expect(baseElement.querySelector(TITLE_INPUT_SELECTOR)).toBeNull();
        expect(queryByTestId("child")).toBeNull();
    });

    it("shows the stale-filters confirmation instead of the dialog while the saved filters are invalid", () => {
        mockUseValidateExistingAutomationFilters.mockReturnValue({
            ...VALID_FILTERS_RESULT,
            isValid: false,
            filtersAreStale: true,
        });
        const { baseElement, queryByTestId } = renderShell();
        expect(queryByTestId("child")).toBeNull();
        expect(baseElement.querySelector(DIALOG_SELECTOR)).toBeNull();
        expect(baseElement.querySelectorAll('[role="dialog"]').length).toBe(1);
    });

    it("opens the delete confirmation from the footer in edit mode and routes its success", () => {
        const onDeleteSuccess = vi.fn();
        const { baseElement, getByTestId, queryByTestId } = renderShell(
            { onDeleteSuccess },
            EDIT_MODE_CONTEXT,
        );
        const footer = baseElement.querySelector(FOOTER_SELECTOR) as HTMLElement;
        expect(within(footer).getByText("Save")).toBeInTheDocument();
        expect(queryByTestId("delete-confirm")).toBeNull();
        fireEvent.click(within(footer).getByText("Delete"));
        expect(getByTestId("delete-confirm")).toBeInTheDocument();
        fireEvent.click(getByTestId("confirm-delete"));
        expect(onDeleteSuccess).toHaveBeenCalledWith(ALERT_TO_EDIT);
        expect(queryByTestId("delete-confirm")).toBeNull();
    });

    it("closes the delete confirmation on its cancel", () => {
        const { baseElement, getByTestId, queryByTestId } = renderShell(undefined, EDIT_MODE_CONTEXT);
        fireEvent.click(
            within(baseElement.querySelector(FOOTER_SELECTOR) as HTMLElement).getByText("Delete"),
        );
        fireEvent.click(getByTestId("cancel-delete"));
        expect(queryByTestId("delete-confirm")).toBeNull();
    });

    it("throws outside the alerting dialog providers", () => {
        vi.spyOn(console, "error").mockImplementation(noop);
        expect(() =>
            render(
                <AlertingDialogShell onCancel={noop} onSubmit={noop} isSaving={false}>
                    <div />
                </AlertingDialogShell>,
            ),
        ).toThrow();
    });
});
