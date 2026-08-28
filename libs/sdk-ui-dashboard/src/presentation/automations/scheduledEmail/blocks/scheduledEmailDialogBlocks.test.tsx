// (C) 2026 GoodData Corporation

import { type ReactNode, createRef } from "react";

import { fireEvent, render, renderHook, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type INotificationChannelIdentifier } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../contexts/AutomationsContext.js";
import {
    type IScheduledEmailDialogContextValue,
    ScheduledEmailDialogContextProvider,
} from "../../contexts/ScheduledEmailDialogContext.js";
import { type IAutomationDialogActionBarProps } from "../../shared/slots/types.js";
import { ScheduledEmailDialogStateProvider } from "../state/ScheduledEmailDialogStateProvider.js";
import { useScheduledExportActions } from "../state/ScheduledExportActionsContext.js";
import { useScheduledExportDraft } from "../state/ScheduledExportDraftContext.js";
import { useSaveScheduledEmailToBackend } from "../state/useSaveScheduledEmailToBackend.js";
import {
    useScheduledEmailDialogActionBarProps,
    useScheduledEmailDialogDestinationProps,
    useScheduledEmailDialogFiltersProps,
    useScheduledEmailDialogHeaderProps,
    useScheduledEmailDialogRecipientsProps,
    useScheduledEmailDialogTimezoneProps,
} from "../state/useScheduledEmailDialogRegionProps.js";
import { useScheduledExportAttachments } from "../state/useScheduledExportAttachments.js";
import { useScheduledExportDialogValidity } from "../state/useScheduledExportDialogValidity.js";
import {
    AUTOMATIONS_CONTEXT,
    SCHEDULED_EMAIL_DIALOG_CONTEXT,
    SENTINEL_CHANNEL,
} from "../tests/scheduledEmail.test.helpers.js";
import { type ScheduledEmailDialogHeaderDefaultProps } from "../types.js";

import { ScheduledEmailDialogActionBar } from "./ScheduledEmailDialogActionBar.js";
import { ScheduledEmailDialogDestination } from "./ScheduledEmailDialogDestination.js";
import { ScheduledEmailDialogFilters } from "./ScheduledEmailDialogFilters.js";
import { ScheduledEmailDialogHeader } from "./ScheduledEmailDialogHeader.js";
import { ScheduledEmailDialogRecipients } from "./ScheduledEmailDialogRecipients.js";
import { ScheduledEmailDialogTimezone } from "./ScheduledEmailDialogTimezone.js";

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

const TITLE_INPUT_SELECTOR = ".s-gd-notifications-channels-dialog-title input";
const FILTERS_SELECTOR = ".s-gd-notifications-channels-dialog-automation-filters";
const DESTINATION_SELECTOR = ".s-gd-notifications-channels-dialog-destination";
const RECIPIENTS_SELECTOR = ".s-gd-notifications-channels-dialog-recipients";
const TIMEZONE_SELECTOR = ".s-gd-schedule-timezone";
const SUBMIT_BUTTON_SELECTOR = ".s-dialog-submit-button";

const SECOND_CHANNEL: INotificationChannelIdentifier = {
    type: "notificationChannel",
    destinationType: "webhook",
    id: "channel-2",
    title: "Second channel",
    allowedRecipients: "internal",
};

const TWO_CHANNEL_CONTEXT: IScheduledEmailDialogContextValue = {
    ...SCHEDULED_EMAIL_DIALOG_CONTEXT,
    notificationChannels: [SENTINEL_CHANNEL, SECOND_CHANNEL],
};

// the section renders only when the timezone feature is on and the dashboard allows the
// view-mode override; the inputs arrive via the automations context (filled by connectors)
const TIMEZONE_SECTION_CONTEXT: IAutomationsContextValue = {
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

const noop = () => {};

beforeEach(() => {
    vi.clearAllMocks();

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
    const { editedAutomation } = useScheduledExportDraft();
    return <span data-testid="draft-title">{editedAutomation.title ?? ""}</span>;
}

function DestinationProbe() {
    const { onDestinationChange } = useScheduledExportActions();
    return <button data-testid="set-destination" onClick={() => onDestinationChange(SECOND_CHANNEL.id)} />;
}

// A customer shell: our blocks in its own markup, no ConfirmDialogBase, no tabs, no slots.
function BlocksShell({
    header,
    actionBar,
    children,
}: {
    header?: Partial<ScheduledEmailDialogHeaderDefaultProps>;
    actionBar?: Partial<IAutomationDialogActionBarProps>;
    children?: ReactNode;
}) {
    return (
        <div data-testid="shell">
            <ScheduledEmailDialogHeader onBack={noop} {...header} />
            <ScheduledEmailDialogFilters />
            <ScheduledEmailDialogDestination />
            <ScheduledEmailDialogRecipients />
            <ScheduledEmailDialogTimezone />
            <ScheduledEmailDialogActionBar onCancel={noop} onSubmit={noop} isSaving={false} {...actionBar} />
            {children}
        </div>
    );
}

function Providers({
    children,
    dialogContext = TWO_CHANNEL_CONTEXT,
    automationsContext = AUTOMATIONS_CONTEXT,
}: {
    children: ReactNode;
    dialogContext?: IScheduledEmailDialogContextValue;
    automationsContext?: IAutomationsContextValue;
}) {
    return (
        <BackendProvider backend={dummyBackend()}>
            <WorkspaceProvider workspace="ws-1">
                <IntlWrapper>
                    <AutomationsContextProvider value={automationsContext}>
                        <ScheduledEmailDialogContextProvider value={dialogContext}>
                            <ScheduledEmailDialogStateProvider>{children}</ScheduledEmailDialogStateProvider>
                        </ScheduledEmailDialogContextProvider>
                    </AutomationsContextProvider>
                </IntlWrapper>
            </WorkspaceProvider>
        </BackendProvider>
    );
}

function renderShell(
    shellProps?: Parameters<typeof BlocksShell>[0],
    dialogContext = TWO_CHANNEL_CONTEXT,
    automationsContext = AUTOMATIONS_CONTEXT,
) {
    return render(
        <Providers dialogContext={dialogContext} automationsContext={automationsContext}>
            <BlocksShell {...shellProps} />
        </Providers>,
    );
}

describe("scheduled-email dialog blocks", () => {
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
            target: { value: "Monday report" },
        });

        expect(view.getByTestId("draft-title")).toHaveTextContent("Monday report");
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

    it("render the timezone block when the schedule may select its timezone", () => {
        const { container } = renderShell(undefined, TWO_CHANNEL_CONTEXT, TIMEZONE_SECTION_CONTEXT);

        expect(container.querySelector(TIMEZONE_SELECTOR)).not.toBeNull();
    });

    it("render nothing for the timezone block when the schedule may not select its timezone", () => {
        const { container } = renderShell();

        expect(container.querySelector(TIMEZONE_SELECTOR)).toBeNull();
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
                <ScheduledEmailDialogContextProvider value={TWO_CHANNEL_CONTEXT}>
                    {children}
                </ScheduledEmailDialogContextProvider>
            </AutomationsContextProvider>
        </IntlWrapper>
    );
}

// Explicitly typed: an inline it.each of mixed tuple members infers a union per position.
const HOOKS: [string, () => unknown][] = [
    [
        "useScheduledEmailDialogHeaderProps",
        () => useScheduledEmailDialogHeaderProps({ onTitleKeyDown: noop }),
    ],
    ["useScheduledEmailDialogFiltersProps", () => useScheduledEmailDialogFiltersProps()],
    ["useScheduledEmailDialogDestinationProps", () => useScheduledEmailDialogDestinationProps()],
    [
        "useScheduledEmailDialogRecipientsProps",
        () => useScheduledEmailDialogRecipientsProps({ onKeyDownSubmit: noop }),
    ],
    ["useScheduledEmailDialogTimezoneProps", () => useScheduledEmailDialogTimezoneProps()],
    [
        "useScheduledEmailDialogActionBarProps",
        () => useScheduledEmailDialogActionBarProps({ onSubmit: noop, isSaving: false }),
    ],
    ["useScheduledExportDialogValidity", () => useScheduledExportDialogValidity()],
    ["useScheduledExportAttachments", () => useScheduledExportAttachments()],
    ["useSaveScheduledEmailToBackend", () => useSaveScheduledEmailToBackend({})],
];

describe("scheduled-email Level 2 hooks — outside the state provider", () => {
    it.each(HOOKS)("%s throws the state-provider error", (_name, hook) => {
        expect(() => renderHook(hook, { wrapper: WithoutStateProvider })).toThrow(
            /must be used within ScheduledEmailDialogStateProvider/,
        );
    });
});
