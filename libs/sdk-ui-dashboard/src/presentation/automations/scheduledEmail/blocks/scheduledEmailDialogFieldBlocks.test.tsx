// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObject,
    type IExportDefinitionMetadataObject,
    type INotificationChannelIdentifier,
    idRef,
} from "@gooddata/sdk-model";
import { getTimezoneDisplayLabel } from "@gooddata/sdk-ui-kit";

import { useScheduledExportDraft } from "../state/ScheduledExportDraftContext.js";
import { useIsInPlatformChannel } from "../state/useIsInPlatformChannel.js";
import {
    useScheduledEmailDialogRecurrenceProps,
    useScheduledEmailDialogWidgetAttachmentsProps,
} from "../state/useScheduledEmailDialogFieldProps.js";
import { useScheduledExportAttachments } from "../state/useScheduledExportAttachments.js";
import {
    AUTOMATIONS_CONTEXT,
    SCHEDULED_EMAIL_DIALOG_CONTEXT,
    SENTINEL_CHANNEL,
    SENTINEL_INSIGHT,
    SENTINEL_WIDGET,
    makeWidgetExportDefinition,
} from "../tests/scheduledEmail.test.helpers.js";
import { BlockProviders } from "../tests/scheduledEmailBlocks.test.helpers.js";
import { getDefaultCronExpression } from "../utils/cron.js";
import { TIMEZONE_DEFAULT } from "../utils/timezone.js";

import { ScheduledEmailDialogDashboardAttachments } from "./ScheduledEmailDialogDashboardAttachments.js";
import { ScheduledEmailDialogEvaluationMode } from "./ScheduledEmailDialogEvaluationMode.js";
import { ScheduledEmailDialogMessage } from "./ScheduledEmailDialogMessage.js";
import { ScheduledEmailDialogRecurrence } from "./ScheduledEmailDialogRecurrence.js";
import { ScheduledEmailDialogSubject } from "./ScheduledEmailDialogSubject.js";
import { ScheduledEmailDialogWidgetAttachments } from "./ScheduledEmailDialogWidgetAttachments.js";

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

describe("useScheduledEmailDialogRecurrenceProps", () => {
    const noopKeyDown = () => {};

    function renderRecurrenceProps(opts?: {
        dialogContext?: Partial<typeof SCHEDULED_EMAIL_DIALOG_CONTEXT>;
    }) {
        return renderHook(() => useScheduledEmailDialogRecurrenceProps({ onKeyDownSubmit: noopKeyDown }), {
            wrapper: ({ children }: { children: ReactNode }) => (
                <BlockProviders dialogContext={{ ...SCHEDULED_EMAIL_DIALOG_CONTEXT, ...opts?.dialogContext }}>
                    {children}
                </BlockProviders>
            ),
        });
    }

    it("derives cronExpression from the draft with the default-cron fallback", () => {
        // BlockProviders mounts the real state provider, so the draft is seeded, not injected;
        // assert the absorbed derivation against the same render's draft rather than assuming
        // which branch the seed lands in
        const { result } = renderHook(
            () => ({
                props: useScheduledEmailDialogRecurrenceProps({ onKeyDownSubmit: noopKeyDown }),
                draft: useScheduledExportDraft(),
            }),
            {
                wrapper: ({ children }: { children: ReactNode }) => (
                    <BlockProviders>{children}</BlockProviders>
                ),
            },
        );
        const { editedAutomation, startDate } = result.current.draft;
        expect(result.current.props.cronExpression).toBe(
            editedAutomation.schedule?.cron ?? getDefaultCronExpression(startDate),
        );
        expect(result.current.props.startDate).toBe(startDate);
    });

    it("falls back to MM/dd/yyyy when the dialog context has no date format", () => {
        const { result } = renderRecurrenceProps({ dialogContext: { dateFormat: undefined } });
        expect(result.current.dateFormat).toBe("MM/dd/yyyy");
    });

    it("passes the context date format through when set", () => {
        const { result } = renderRecurrenceProps({ dialogContext: { dateFormat: "dd.MM.yyyy" } });
        expect(result.current.dateFormat).toBe("dd.MM.yyyy");
    });

    it("shows the friendly timezone label exactly when the timezone feature is on", () => {
        const { result } = renderHook(
            () => ({
                props: useScheduledEmailDialogRecurrenceProps({ onKeyDownSubmit: noopKeyDown }),
                draft: useScheduledExportDraft(),
            }),
            {
                wrapper: ({ children }: { children: ReactNode }) => (
                    <BlockProviders>{children}</BlockProviders>
                ),
            },
        );
        const timezoneId =
            result.current.draft.editedAutomation.schedule?.timezone ?? TIMEZONE_DEFAULT.identifier;
        expect(result.current.props.timezone).toBe(
            result.current.draft.isTimezoneFeatureEnabled ? getTimezoneDisplayLabel(timezoneId) : timezoneId,
        );
    });
});

describe("useScheduledEmailDialogWidgetAttachmentsProps", () => {
    it("passes the raw selection through unnarrowed for an all-widget-typed draft", () => {
        // proves against the raw selection rather than re-filtering the hook's own output by the
        // same list the hook itself uses, which could never catch a narrowing that drops a format
        const { result } = renderHook(
            () => ({
                props: useScheduledEmailDialogWidgetAttachmentsProps(),
                attachments: useScheduledExportAttachments(),
            }),
            {
                wrapper: ({ children }: { children: ReactNode }) => (
                    <BlockProviders>{children}</BlockProviders>
                ),
            },
        );
        expect(result.current.props.selectedAttachments).toEqual(
            result.current.attachments.selectedAttachments,
        );
    });

    it("keeps a saved HTML export in the narrowed selection", () => {
        // HTML is offered nowhere in the widget-attachments picker UI but is a valid
        // WidgetAttachmentType a saved automation may already carry; the narrowing filter must not
        // silently drop it, or a subsequent save would permanently remove the format
        const htmlExportDefinition: IExportDefinitionMetadataObject = {
            ...makeWidgetExportDefinition("HTML"),
            title: "HTML widget export",
            id: "export-html",
            uri: "/export-html",
            ref: idRef("export-html"),
            description: "",
            production: true,
            deprecated: false,
            unlisted: false,
        };
        const scheduledExportToEdit: IAutomationMetadataObject = {
            type: "automation",
            id: "automation-html",
            uri: "/automation-html",
            ref: idRef("automation-html"),
            title: "HTML export",
            description: "",
            production: true,
            deprecated: false,
            unlisted: false,
            notificationChannel: SENTINEL_CHANNEL.id,
            exportDefinitions: [htmlExportDefinition],
        };

        const { result } = renderHook(() => useScheduledEmailDialogWidgetAttachmentsProps(), {
            wrapper: ({ children }: { children: ReactNode }) => (
                <BlockProviders dialogContext={{ ...SCHEDULED_EMAIL_DIALOG_CONTEXT, scheduledExportToEdit }}>
                    {children}
                </BlockProviders>
            ),
        });

        expect(result.current.selectedAttachments).toContain("HTML");
    });
});

const IN_PLATFORM_CHANNEL: INotificationChannelIdentifier = {
    ...SENTINEL_CHANNEL,
    destinationType: "inPlatform",
};

function inPlatformChannelDialogContext() {
    return { ...SCHEDULED_EMAIL_DIALOG_CONTEXT, notificationChannels: [IN_PLATFORM_CHANNEL] };
}

describe("useIsInPlatformChannel", () => {
    function renderIsInPlatform(dialogContext = SCHEDULED_EMAIL_DIALOG_CONTEXT) {
        return renderHook(() => useIsInPlatformChannel(), {
            wrapper: ({ children }: { children: ReactNode }) => (
                <BlockProviders dialogContext={dialogContext}>{children}</BlockProviders>
            ),
        });
    }

    it("is false for the webhook sentinel channel", () => {
        expect(renderIsInPlatform().result.current).toBe(false);
    });

    it("is true when the draft's channel resolves to an inPlatform destination", () => {
        expect(renderIsInPlatform(inPlatformChannelDialogContext()).result.current).toBe(true);
    });
});

describe("ScheduledEmailDialogSubject", () => {
    it("renders the subject input for a non-inPlatform channel", () => {
        const { getByPlaceholderText } = render(
            <BlockProviders>
                <ScheduledEmailDialogSubject />
            </BlockProviders>,
        );
        // fixture dashboardTitle is the placeholder
        expect(getByPlaceholderText(SCHEDULED_EMAIL_DIALOG_CONTEXT.dashboardTitle!)).toBeInTheDocument();
    });

    it("renders nothing when the selected channel is inPlatform", () => {
        const { container } = render(
            <BlockProviders dialogContext={inPlatformChannelDialogContext()}>
                <ScheduledEmailDialogSubject />
            </BlockProviders>,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("renders nothing while the dialog context is loading", () => {
        const { container } = render(
            <BlockProviders dialogContext={{ ...SCHEDULED_EMAIL_DIALOG_CONTEXT, isLoading: true }}>
                <ScheduledEmailDialogSubject />
            </BlockProviders>,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("override props win over the hook's values", () => {
        const { getByPlaceholderText } = render(
            <BlockProviders>
                <ScheduledEmailDialogSubject dashboardTitle="Overridden title" />
            </BlockProviders>,
        );
        expect(getByPlaceholderText("Overridden title")).toBeInTheDocument();
    });
});

describe("ScheduledEmailDialogMessage", () => {
    const MESSAGE_PLACEHOLDER =
        "Hello, Your scheduled email is ready. You can download the dashboard in attachments.";

    it("renders the message textarea for a non-inPlatform channel", () => {
        const { getByPlaceholderText } = render(
            <BlockProviders>
                <ScheduledEmailDialogMessage />
            </BlockProviders>,
        );
        expect(getByPlaceholderText(MESSAGE_PLACEHOLDER)).toBeInTheDocument();
    });

    it("renders nothing when the selected channel is inPlatform", () => {
        const { container } = render(
            <BlockProviders dialogContext={inPlatformChannelDialogContext()}>
                <ScheduledEmailDialogMessage />
            </BlockProviders>,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("renders nothing while the dialog context is loading", () => {
        const { container } = render(
            <BlockProviders dialogContext={{ ...SCHEDULED_EMAIL_DIALOG_CONTEXT, isLoading: true }}>
                <ScheduledEmailDialogMessage />
            </BlockProviders>,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("override props win over the hook's values", () => {
        const { getByDisplayValue } = render(
            <BlockProviders>
                <ScheduledEmailDialogMessage value="Overridden message" />
            </BlockProviders>,
        );
        expect(getByDisplayValue("Overridden message")).toBeInTheDocument();
    });
});

const WIDGET_DIALOG_CONTEXT = {
    ...SCHEDULED_EMAIL_DIALOG_CONTEXT,
    widget: SENTINEL_WIDGET,
    insight: SENTINEL_INSIGHT,
};

describe("ScheduledEmailDialogWidgetAttachments", () => {
    it("renders the attachments group when the dialog context has a widget", () => {
        const { container } = render(
            <BlockProviders dialogContext={WIDGET_DIALOG_CONTEXT}>
                <ScheduledEmailDialogWidgetAttachments />
            </BlockProviders>,
        );
        expect(container.querySelectorAll(".gd-attachment-list")).toHaveLength(1);
    });

    it("renders nothing when the dialog context has no widget", () => {
        const { container } = render(
            <BlockProviders>
                <ScheduledEmailDialogWidgetAttachments />
            </BlockProviders>,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("renders nothing while the dialog context is loading", () => {
        const { container } = render(
            <BlockProviders dialogContext={{ ...WIDGET_DIALOG_CONTEXT, isLoading: true }}>
                <ScheduledEmailDialogWidgetAttachments />
            </BlockProviders>,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("override props win over the hook's values", () => {
        render(
            <BlockProviders dialogContext={WIDGET_DIALOG_CONTEXT}>
                <ScheduledEmailDialogWidgetAttachments selectedAttachments={["CSV_RAW"]} />
            </BlockProviders>,
        );
        expect(screen.getByText("Raw data (.csv)")).toBeInTheDocument();
    });
});

describe("ScheduledEmailDialogDashboardAttachments", () => {
    it("renders the attachments group when the dialog context has no widget", () => {
        const { container } = render(
            <BlockProviders>
                <ScheduledEmailDialogDashboardAttachments />
            </BlockProviders>,
        );
        expect(container.querySelectorAll(".gd-attachment-list")).toHaveLength(1);
    });

    it("renders nothing when the dialog context has a widget", () => {
        const { container } = render(
            <BlockProviders dialogContext={WIDGET_DIALOG_CONTEXT}>
                <ScheduledEmailDialogDashboardAttachments />
            </BlockProviders>,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("renders nothing while the dialog context is loading", () => {
        const { container } = render(
            <BlockProviders dialogContext={{ ...SCHEDULED_EMAIL_DIALOG_CONTEXT, isLoading: true }}>
                <ScheduledEmailDialogDashboardAttachments />
            </BlockProviders>,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("override props win over the hook's values", () => {
        render(
            <BlockProviders>
                <ScheduledEmailDialogDashboardAttachments selectedAttachments={["XLSX"]} />
            </BlockProviders>,
        );
        expect(screen.getByText("Data (.xlsx)")).toBeInTheDocument();
    });

    it("renders exactly one attachments group when both attachment blocks are used together", () => {
        // the recipe usage: both blocks side by side, gated on the same widget presence — only
        // the matching one ever renders its group
        const { container } = render(
            <BlockProviders>
                <ScheduledEmailDialogWidgetAttachments />
                <ScheduledEmailDialogDashboardAttachments />
            </BlockProviders>,
        );
        expect(container.querySelectorAll(".gd-attachment-list")).toHaveLength(1);
    });
});

const EVALUATION_MODE_ENABLED_CONTEXT = {
    ...AUTOMATIONS_CONTEXT,
    features: { ...AUTOMATIONS_CONTEXT.features, enableAutomationEvaluationMode: true },
};

describe("ScheduledEmailDialogEvaluationMode", () => {
    it("renders the shared-evaluation checkbox when the feature is enabled", () => {
        render(
            <BlockProviders automationsContext={EVALUATION_MODE_ENABLED_CONTEXT}>
                <ScheduledEmailDialogEvaluationMode />
            </BlockProviders>,
        );
        expect(screen.getByText("Use the same attachments for all recipients")).toBeInTheDocument();
    });

    it("renders nothing when the feature is disabled", () => {
        const { container } = render(
            <BlockProviders>
                <ScheduledEmailDialogEvaluationMode />
            </BlockProviders>,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("renders nothing while the dialog context is loading", () => {
        const { container } = render(
            <BlockProviders
                automationsContext={EVALUATION_MODE_ENABLED_CONTEXT}
                dialogContext={{ ...SCHEDULED_EMAIL_DIALOG_CONTEXT, isLoading: true }}
            >
                <ScheduledEmailDialogEvaluationMode />
            </BlockProviders>,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("override props win over the hook's values", () => {
        render(
            <BlockProviders automationsContext={EVALUATION_MODE_ENABLED_CONTEXT}>
                <ScheduledEmailDialogEvaluationMode isShared />
            </BlockProviders>,
        );
        expect(screen.getByRole("checkbox")).toBeChecked();
    });
});

describe("ScheduledEmailDialogRecurrence", () => {
    it("renders the recurrence form under default fixtures", () => {
        const { container } = render(
            <BlockProviders>
                <ScheduledEmailDialogRecurrence />
            </BlockProviders>,
        );
        expect(container.querySelector(".gd-recurrence-form-repeat")).toBeInTheDocument();
    });

    it("renders nothing while the dialog context is loading", () => {
        const { container } = render(
            <BlockProviders dialogContext={{ ...SCHEDULED_EMAIL_DIALOG_CONTEXT, isLoading: true }}>
                <ScheduledEmailDialogRecurrence />
            </BlockProviders>,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("override props win over the hook's values", () => {
        // cronExpression must be overridden alongside cronDescription: an expression the
        // recurrence form classifies as a recognized cadence (daily/weekly/…) hides the
        // free-form cron description regardless of its value.
        const { getByText } = render(
            <BlockProviders>
                <ScheduledEmailDialogRecurrence
                    cronExpression="*/15 * * * *"
                    cronDescription="Every 15 minutes, overridden"
                />
            </BlockProviders>,
        );
        expect(getByText("Every 15 minutes, overridden")).toBeInTheDocument();
    });
});
