// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import type * as ReactIntl from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IAutomationRecipient,
    type INotificationChannelIdentifier,
} from "@gooddata/sdk-model";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them. We use vi.fn() inline and retrieve spies via
// vi.mocked() after the import statements.
// ---------------------------------------------------------------------------

vi.mock("../useScheduleValidation.js", () => ({
    useScheduleValidation: vi.fn(),
}));

// formatMessage is mocked to return the descriptor id rather than resolved copy, so
// assertions below don't couple to the exact English translation text.
vi.mock("react-intl", async () => {
    const actual = await vi.importActual<typeof ReactIntl>("react-intl");
    return {
        ...actual,
        useIntl: () => ({ formatMessage: (descriptor: { id: string }) => descriptor.id }),
    };
});

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";
import {
    useScheduledEmailFormValidity,
    type IUseScheduledEmailFormValidityProps,
} from "../useScheduledEmailFormValidity.js";
import * as useScheduleValidationModule from "../useScheduleValidation.js";

// ---------------------------------------------------------------------------
// Typed spy references (resolved after import)
// ---------------------------------------------------------------------------

const useScheduleValidationSpy = vi.mocked(useScheduleValidationModule.useScheduleValidation);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const userRecipient: IAutomationRecipient = { type: "user", id: "user-1", email: "user@example.com" };
const externalRecipient: IAutomationRecipient = {
    type: "externalUser",
    id: "ext-1",
    email: "ext@example.com",
};
const unknownRecipient: IAutomationRecipient = {
    type: "unknownUser",
    id: "unknown-1",
} as IAutomationRecipient;
const userRecipientNoEmail: IAutomationRecipient = { type: "user", id: "user-2" };

const defaultRecipient: IAutomationRecipient = userRecipient;

// Only `id`, `destinationType` and `allowedRecipients` are read by the hook under test, so
// fixtures are typed as the lightweight `INotificationChannelIdentifier` (one of the two shapes
// `notificationChannels` accepts) rather than the full, persisted `INotificationChannelMetadataObject`.
const smtpChannel: INotificationChannelIdentifier = {
    type: "notificationChannel",
    id: "smtp-channel",
    title: "SMTP Channel",
    description: "",
    destinationType: "smtp",
};

const nonSmtpChannel: INotificationChannelIdentifier = {
    ...smtpChannel,
    id: "webhook-channel",
    destinationType: "webhook",
};

const externalChannel: INotificationChannelIdentifier = {
    ...smtpChannel,
    id: "external-channel",
    destinationType: "webhook",
    allowedRecipients: "external",
};

const creatorOnlyChannel: INotificationChannelIdentifier = {
    ...smtpChannel,
    id: "creator-channel",
    destinationType: "webhook",
    allowedRecipients: "creator",
};

const exportDefinition: NonNullable<IAutomationMetadataObjectDefinition["exportDefinitions"]>[number] = {
    type: "exportDefinition",
    title: "Dashboard export",
    requestPayload: {
        type: "dashboard",
        fileName: "Dashboard",
        format: "PDF",
        content: { dashboard: "dashboard-1" },
    },
};

const makeAutomation = (
    overrides: Partial<IAutomationMetadataObjectDefinition> = {},
): IAutomationMetadataObjectDefinition => ({
    type: "automation",
    title: "Test Scheduled Email",
    notificationChannel: "smtp-channel",
    recipients: [userRecipient],
    exportDefinitions: [exportDefinition],
    ...overrides,
});

const BASE_PROPS: IUseScheduledEmailFormValidityProps = {
    editedAutomation: makeAutomation(),
    originalAutomation: makeAutomation(),
    scheduledExportToEdit: undefined,
    notificationChannels: [nonSmtpChannel],
    defaultRecipient,
    maxAutomationsRecipients: 10,
    isCronValid: true,
    isTitleValid: true,
    isSubjectValid: true,
    isOnMessageValid: true,
};

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();
    useScheduleValidationSpy.mockReturnValue({ isValid: true });
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderValidityHook(props: Partial<IUseScheduledEmailFormValidityProps> = {}) {
    const mergedProps: IUseScheduledEmailFormValidityProps = { ...BASE_PROPS, ...props };
    return renderHook(() => useScheduledEmailFormValidity(mergedProps), { wrapper: IntlWrapper });
}

// ---------------------------------------------------------------------------
// Case 1: valid draft → isSubmitDisabled false
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormValidity — valid draft", () => {
    it("returns a falsy isSubmitDisabled when all rules pass (no scheduledExportToEdit: new schedule mode)", () => {
        const { result } = renderValidityHook();

        // Verbatim expression: `!isValid || (scheduledExportToEdit && areAutomationsEqual(...))`.
        // With `scheduledExportToEdit` unset, `undefined && ...` short-circuits to `undefined` rather
        // than `false` — same falsy semantics consumers rely on (e.g. `disabled={isSubmitDisabled}`).
        expect(result.current.isSubmitDisabled).toBeFalsy();
    });
});

// ---------------------------------------------------------------------------
// Case 2: each failing rule → isSubmitDisabled true
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormValidity — individual failing rules", () => {
    it("isSubmitDisabled=true when no attachments (no export definitions)", () => {
        const { result } = renderValidityHook({
            editedAutomation: makeAutomation({ exportDefinitions: [] }),
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when no recipients", () => {
        const { result } = renderValidityHook({
            editedAutomation: makeAutomation({ recipients: [] }),
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when over maxAutomationsRecipients", () => {
        const { result } = renderValidityHook({
            editedAutomation: makeAutomation({
                recipients: [userRecipient, { type: "user", id: "user-3", email: "u3@e.com" }],
            }),
            maxAutomationsRecipients: 1,
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when no destination (notificationChannel unset)", () => {
        const { result } = renderValidityHook({
            editedAutomation: makeAutomation({ notificationChannel: undefined }),
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when external recipient and allowExternalRecipients=false", () => {
        const { result } = renderValidityHook({
            editedAutomation: makeAutomation({ recipients: [externalRecipient] }),
            notificationChannels: [nonSmtpChannel],
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when unknown recipient present", () => {
        const { result } = renderValidityHook({
            editedAutomation: makeAutomation({ recipients: [unknownRecipient] }),
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when smtp channel with a non-email user recipient", () => {
        const { result } = renderValidityHook({
            editedAutomation: makeAutomation({ recipients: [userRecipientNoEmail] }),
            notificationChannels: [smtpChannel],
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when isCronValid is false", () => {
        const { result } = renderValidityHook({ isCronValid: false });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when isTitleValid is false", () => {
        const { result } = renderValidityHook({ isTitleValid: false });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when isSubjectValid is false", () => {
        const { result } = renderValidityHook({ isSubjectValid: false });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when isOnMessageValid is false", () => {
        const { result } = renderValidityHook({ isOnMessageValid: false });

        expect(result.current.isSubmitDisabled).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Case 3: edit-mode dirty check
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormValidity — edit-mode dirty check", () => {
    // `scheduledExportToEdit` is only read for truthiness by the hook, so a full
    // `IAutomationMetadataObject` (with a real `ref`/`id`/`uri`/etc.) isn't needed here — every
    // field the `Definition` type declares is optional, so it overlaps enough with the target
    // type for a direct assertion (no `unknown` needed).
    const original = makeAutomation({
        title: "Original Title",
    }) as IAutomationMetadataObject;
    const identicalEdited = makeAutomation({ title: "Original Title" });
    const changedEdited = makeAutomation({ title: "Changed Title" });

    it("isSubmitDisabled=true when scheduledExportToEdit is set and edited equals original (no dirty changes)", () => {
        const { result } = renderValidityHook({
            scheduledExportToEdit: original,
            originalAutomation: identicalEdited,
            editedAutomation: identicalEdited,
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=false when scheduledExportToEdit is set but edited differs from original (dirty)", () => {
        const { result } = renderValidityHook({
            scheduledExportToEdit: original,
            originalAutomation: identicalEdited,
            editedAutomation: changedEdited,
        });

        expect(result.current.isSubmitDisabled).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Case 4: creator-only channel (allowOnlyLoggedUserRecipients)
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormValidity — creator-only channel", () => {
    it("valid when exactly one recipient matching defaultRecipient.id", () => {
        const { result } = renderValidityHook({
            notificationChannels: [creatorOnlyChannel],
            editedAutomation: makeAutomation({
                notificationChannel: "creator-channel",
                recipients: [defaultRecipient],
            }),
        });

        // See "valid draft" case above re: falsy-not-strictly-false when scheduledExportToEdit is unset.
        expect(result.current.isSubmitDisabled).toBeFalsy();
        expect(result.current.allowOnlyLoggedUserRecipients).toBe(true);
    });

    it("invalid when allowOnlyLoggedUserRecipients and recipient id differs from defaultRecipient", () => {
        const otherRecipient: IAutomationRecipient = { type: "user", id: "other-user" };
        const { result } = renderValidityHook({
            notificationChannels: [creatorOnlyChannel],
            editedAutomation: makeAutomation({
                notificationChannel: "creator-channel",
                recipients: [otherRecipient],
            }),
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("invalid when allowOnlyLoggedUserRecipients and more than one recipient", () => {
        const { result } = renderValidityHook({
            notificationChannels: [creatorOnlyChannel],
            editedAutomation: makeAutomation({
                notificationChannel: "creator-channel",
                recipients: [defaultRecipient, userRecipient],
            }),
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Case 5: allowExternalRecipients=true accepts external recipients
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormValidity — allowExternalRecipients=true", () => {
    it("accepts external recipients when allowExternalRecipients is true", () => {
        const { result } = renderValidityHook({
            notificationChannels: [externalChannel],
            editedAutomation: makeAutomation({
                notificationChannel: "external-channel",
                recipients: [externalRecipient],
            }),
        });

        // See "valid draft" case above re: falsy-not-strictly-false when scheduledExportToEdit is unset.
        expect(result.current.isSubmitDisabled).toBeFalsy();
        expect(result.current.allowExternalRecipients).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Case 6: validationErrorMessage / isParentValid branches
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormValidity — validationErrorMessage / isParentValid", () => {
    it("returns validationErrorMessage=undefined and isParentValid=true when useScheduleValidation is valid", () => {
        useScheduleValidationSpy.mockReturnValue({ isValid: true });

        const { result } = renderValidityHook();

        expect(result.current.validationErrorMessage).toBeUndefined();
        expect(result.current.isParentValid).toBe(true);
    });

    it("returns widgetError message and isParentValid=false when useScheduleValidation is invalid", () => {
        useScheduleValidationSpy.mockReturnValue({ isValid: false });

        const { result } = renderValidityHook();

        expect(result.current.validationErrorMessage).toBe("dialogs.schedule.email.widgetError");
        expect(result.current.isParentValid).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Case 7: allow* flags derive from the matched notification channel
// ---------------------------------------------------------------------------

describe("useScheduledEmailFormValidity — allow* flags derivation", () => {
    it("both flags false for a channel with allowedRecipients 'all'", () => {
        const { result } = renderValidityHook({
            notificationChannels: [nonSmtpChannel],
            editedAutomation: makeAutomation({ notificationChannel: "webhook-channel" }),
        });

        expect(result.current.allowExternalRecipients).toBe(false);
        expect(result.current.allowOnlyLoggedUserRecipients).toBe(false);
    });

    it("allowExternalRecipients true for a channel with allowedRecipients 'external'", () => {
        const { result } = renderValidityHook({
            notificationChannels: [externalChannel],
            editedAutomation: makeAutomation({ notificationChannel: "external-channel" }),
        });

        expect(result.current.allowExternalRecipients).toBe(true);
        expect(result.current.allowOnlyLoggedUserRecipients).toBe(false);
    });

    it("allowOnlyLoggedUserRecipients true for a channel with allowedRecipients 'creator'", () => {
        const { result } = renderValidityHook({
            notificationChannels: [creatorOnlyChannel],
            editedAutomation: makeAutomation({ notificationChannel: "creator-channel" }),
        });

        expect(result.current.allowOnlyLoggedUserRecipients).toBe(true);
        expect(result.current.allowExternalRecipients).toBe(false);
    });

    it("both flags false when notificationChannel does not match any known channel", () => {
        const { result } = renderValidityHook({
            notificationChannels: [nonSmtpChannel],
            editedAutomation: makeAutomation({ notificationChannel: "unknown-channel" }),
        });

        expect(result.current.allowExternalRecipients).toBe(false);
        expect(result.current.allowOnlyLoggedUserRecipients).toBe(false);
    });
});
