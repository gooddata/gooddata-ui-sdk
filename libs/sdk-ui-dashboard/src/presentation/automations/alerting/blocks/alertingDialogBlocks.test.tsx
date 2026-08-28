// (C) 2026 GoodData Corporation

import { type ReactNode, createRef } from "react";

import { fireEvent, render, renderHook, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type INotificationChannelIdentifier } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import {
    AlertingDialogContextProvider,
    type IAlertingDialogContextValue,
} from "../../contexts/AlertingDialogContext.js";
import { AutomationsContextProvider } from "../../contexts/AutomationsContext.js";
import { type IAutomationDialogActionBarProps } from "../../shared/slots/types.js";
import { useAlertActions } from "../state/AlertActionsContext.js";
import { useAlertDraft } from "../state/AlertDraftContext.js";
import { AlertingDialogStateProvider } from "../state/AlertingDialogStateProvider.js";
import { useAlertDialogValidity } from "../state/useAlertDialogValidity.js";
import {
    useAlertingDialogActionBarProps,
    useAlertingDialogDestinationProps,
    useAlertingDialogFiltersProps,
    useAlertingDialogHeaderProps,
    useAlertingDialogRecipientsProps,
} from "../state/useAlertingDialogRegionProps.js";
import { useAlertSelectedValues } from "../state/useAlertSelectedValues.js";
import { useAlertSubmit } from "../state/useAlertSubmit.js";
import {
    ALERTING_DIALOG_CONTEXT,
    AUTOMATIONS_CONTEXT,
    SENTINEL_CHANNEL,
    SENTINEL_MEASURE,
} from "../tests/alerting.test.helpers.js";
import { type AlertAttribute, type AlertingDialogHeaderDefaultProps } from "../types.js";

import { AlertingDialogActionBar } from "./AlertingDialogActionBar.js";
import { AlertingDialogDestination } from "./AlertingDialogDestination.js";
import { AlertingDialogFilters } from "./AlertingDialogFilters.js";
import { AlertingDialogHeader } from "./AlertingDialogHeader.js";
import { AlertingDialogRecipients } from "./AlertingDialogRecipients.js";

// `isolate: false` shares one module graph per worker, so the real modules imported above may
// already have been replaced by a sibling test file's `vi.mock()` earlier in the same worker.
// Dropping the module registry from `vi.hoisted()` (it runs before this file's own imports, unlike
// any `beforeEach`) makes those imports resolve through the real implementations again.
vi.hoisted(() => {
    vi.resetModules();
});

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

// The filter bar's attribute dropdown and a selected attribute filter chip read the dashboard redux
// store, which this harness does not mount.
vi.mock("../../../filterBar/attributeFilter/addAttributeFilter/AttributesDropdown.js", () => ({
    AttributesDropdown: () => null,
}));
vi.mock("../../../filterBar/attributeFilter/DefaultDashboardAttributeFilter.js", () => ({
    DefaultDashboardAttributeFilter: () => null,
}));

const TITLE_INPUT_SELECTOR = ".s-gd-notifications-channels-dialog-title input";
const FILTERS_SELECTOR = ".s-gd-notifications-channels-dialog-automation-filters";
const DESTINATION_SELECTOR = ".s-alert-destination-select";
const RECIPIENTS_SELECTOR = ".s-gd-notifications-channels-dialog-recipients";
const SUBMIT_BUTTON_SELECTOR = ".s-dialog-submit-button";

const SECOND_CHANNEL: INotificationChannelIdentifier = {
    type: "notificationChannel",
    destinationType: "webhook",
    id: "channel-2",
    title: "Second channel",
    allowedRecipients: "internal",
};

const TWO_CHANNEL_CONTEXT: IAlertingDialogContextValue = {
    ...ALERTING_DIALOG_CONTEXT,
    notificationChannels: [SENTINEL_CHANNEL, SECOND_CHANNEL],
};

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

// Probes read the state the way a customer's own field would.
function DraftTitleProbe() {
    const { editedAutomation } = useAlertDraft();
    return <span data-testid="draft-title">{editedAutomation?.title ?? ""}</span>;
}

function DestinationProbe() {
    const { onDestinationChange } = useAlertActions();
    return <button data-testid="set-destination" onClick={() => onDestinationChange(SECOND_CHANNEL.id)} />;
}

// A customer shell: our blocks in its own markup, no ConfirmDialogBase, no slots.
function BlocksShell({
    header,
    actionBar,
    children,
}: {
    header?: Partial<AlertingDialogHeaderDefaultProps>;
    actionBar?: Partial<IAutomationDialogActionBarProps>;
    children?: ReactNode;
}) {
    return (
        <div data-testid="shell">
            <AlertingDialogHeader onCancel={noop} {...header} />
            <AlertingDialogFilters />
            <AlertingDialogDestination />
            <AlertingDialogRecipients />
            <AlertingDialogActionBar onCancel={noop} onSubmit={noop} isSaving={false} {...actionBar} />
            {children}
        </div>
    );
}

function Providers({
    children,
    dialogContext = TWO_CHANNEL_CONTEXT,
}: {
    children: ReactNode;
    dialogContext?: IAlertingDialogContextValue;
}) {
    return (
        <BackendProvider backend={dummyBackend()}>
            <WorkspaceProvider workspace="ws-1">
                <IntlWrapper>
                    <AutomationsContextProvider value={AUTOMATIONS_CONTEXT}>
                        <AlertingDialogContextProvider value={dialogContext}>
                            <AlertingDialogStateProvider>{children}</AlertingDialogStateProvider>
                        </AlertingDialogContextProvider>
                    </AutomationsContextProvider>
                </IntlWrapper>
            </WorkspaceProvider>
        </BackendProvider>
    );
}

function renderShell(shellProps?: Parameters<typeof BlocksShell>[0], dialogContext = TWO_CHANNEL_CONTEXT) {
    return render(
        <Providers dialogContext={dialogContext}>
            <BlocksShell {...shellProps} />
        </Providers>,
    );
}

describe("alerting dialog blocks", () => {
    it("render every region under the state providers", () => {
        const { container } = renderShell();

        expect(container.querySelector(TITLE_INPUT_SELECTOR)).not.toBeNull();
        expect(container.querySelector(FILTERS_SELECTOR)).not.toBeNull();
        expect(container.querySelector(DESTINATION_SELECTOR)).not.toBeNull();
        expect(container.querySelector(RECIPIENTS_SELECTOR)).not.toBeNull();
        expect(container.querySelector(SUBMIT_BUTTON_SELECTOR)).not.toBeNull();
    });

    it("write through a block into the draft", () => {
        const view = renderShell({ children: <DraftTitleProbe /> });

        fireEvent.change(view.container.querySelector<HTMLInputElement>(TITLE_INPUT_SELECTOR)!, {
            target: { value: "Revenue drop" },
        });

        expect(view.getByTestId("draft-title")).toHaveTextContent("Revenue drop");
    });

    it("read the live draft into a block", () => {
        const view = renderShell({ children: <DestinationProbe /> });

        fireEvent.click(view.getByTestId("set-destination"));

        expect(view.container.querySelector(DESTINATION_SELECTOR)).toHaveTextContent("Second channel");
    });

    it("forward a ref to the title input", () => {
        const ref = createRef<HTMLInputElement>();
        const { container } = renderShell({ header: { ref } });

        expect(ref.current).toBe(container.querySelector(TITLE_INPUT_SELECTOR));
    });

    it("let an override prop replace the hook's value", () => {
        const { container } = renderShell({
            header: { placeholder: "Custom placeholder" },
            actionBar: { submitButtonText: "Go" },
        });

        expect(container.querySelector<HTMLInputElement>(TITLE_INPUT_SELECTOR)!.placeholder).toBe(
            "Custom placeholder",
        );
        expect(container.querySelector(SUBMIT_BUTTON_SELECTOR)).toHaveTextContent("Go");
    });

    it("render nothing while the dialog context is loading, without throwing", () => {
        let view: ReturnType<typeof renderShell> | undefined;

        expect(() => {
            view = renderShell(undefined, { ...TWO_CHANNEL_CONTEXT, isLoading: true });
        }).not.toThrow();

        expect(within(view!.container).getByTestId("shell").childElementCount).toBe(0);
    });
});

// Without the state provider but inside the dialog contexts — the shape of a shell that forgot to
// check isLoading. useIntl and the dialog contexts resolve, so the state-provider error is the one
// that surfaces.
function WithoutStateProvider({ children }: { children: ReactNode }) {
    return (
        <IntlWrapper>
            <AutomationsContextProvider value={AUTOMATIONS_CONTEXT}>
                <AlertingDialogContextProvider value={TWO_CHANNEL_CONTEXT}>
                    {children}
                </AlertingDialogContextProvider>
            </AutomationsContextProvider>
        </IntlWrapper>
    );
}

// Explicitly typed: an inline it.each of mixed tuple members infers a union per position.
const HOOKS: [string, () => unknown][] = [
    ["useAlertingDialogHeaderProps", () => useAlertingDialogHeaderProps({})],
    ["useAlertingDialogFiltersProps", () => useAlertingDialogFiltersProps()],
    ["useAlertingDialogDestinationProps", () => useAlertingDialogDestinationProps()],
    ["useAlertingDialogRecipientsProps", () => useAlertingDialogRecipientsProps()],
    [
        "useAlertingDialogActionBarProps",
        () => useAlertingDialogActionBarProps({ onSubmit: noop, isSaving: false }),
    ],
    ["useAlertSelectedValues", () => useAlertSelectedValues()],
    ["useAlertDialogValidity", () => useAlertDialogValidity()],
    ["useAlertSubmit", () => useAlertSubmit({})],
];

describe("alerting Level 2 hooks — outside the state provider", () => {
    it.each(HOOKS)("%s throws the state-provider error", (_name, hook) => {
        expect(() => renderHook(hook, { wrapper: WithoutStateProvider })).toThrow(
            /must be used within AlertingDialogStateProvider/,
        );
    });
});
