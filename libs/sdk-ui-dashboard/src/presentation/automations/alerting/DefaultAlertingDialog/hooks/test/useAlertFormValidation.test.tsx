// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import type * as ReactIntl from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IAutomationRecipient,
    type INotificationChannelMetadataObject,
} from "@gooddata/sdk-model";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted; factories must not reference top-level
// let/const declared after them. We use vi.fn() inline and retrieve spies via
// vi.mocked() after the import statements.
// ---------------------------------------------------------------------------

vi.mock("../useAlertValidation.js", () => ({
    useAlertValidation: vi.fn(),
}));

vi.mock("../../utils/guards.js", () => ({
    isAlertValueDefined: vi.fn(),
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
import * as guardsModule from "../../utils/guards.js";
import { useAlertFormValidation, type IUseAlertFormValidationProps } from "../useAlertFormValidation.js";
import * as useAlertValidationModule from "../useAlertValidation.js";

// ---------------------------------------------------------------------------
// Typed spy references (resolved after import)
// ---------------------------------------------------------------------------

const useAlertValidationSpy = vi.mocked(useAlertValidationModule.useAlertValidation);
const isAlertValueDefinedSpy = vi.mocked(guardsModule.isAlertValueDefined);

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

const smtpChannel: INotificationChannelMetadataObject = {
    type: "notificationChannel",
    id: "smtp-channel",
    ref: { identifier: "smtp-channel" },
    uri: "/smtp-channel",
    identifier: "smtp-channel",
    title: "SMTP Channel",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    destinationType: "smtp",
    allowedRecipients: "all",
} as unknown as INotificationChannelMetadataObject;

const nonSmtpChannel: INotificationChannelMetadataObject = {
    ...smtpChannel,
    id: "webhook-channel",
    destinationType: "webhook",
} as unknown as INotificationChannelMetadataObject;

const makeAutomation = (
    overrides: Partial<IAutomationMetadataObjectDefinition> = {},
): IAutomationMetadataObjectDefinition =>
    ({
        type: "automation",
        title: "Test Alert",
        notificationChannel: "smtp-channel",
        recipients: [userRecipient],
        alert: { condition: { type: "comparison", operator: "GREATER_THAN", left: {}, right: 42 } },
        ...overrides,
    }) as unknown as IAutomationMetadataObjectDefinition;

const BASE_PROPS: IUseAlertFormValidationProps = {
    editedAutomation: makeAutomation(),
    originalAutomation: makeAutomation(),
    alertToEdit: undefined,
    widget: undefined,
    insight: undefined,
    catalogDateDatasets: [],
    isInvalidConnectionToInsight: false,
    selectedNotificationChannel: nonSmtpChannel,
    allowExternalRecipients: false,
    allowOnlyLoggedUserRecipients: false,
    maxAutomationsRecipients: 10,
    defaultRecipient,
    isTitleValid: true,
};

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();
    // Default: original automation is valid, no invalidity reason, threshold defined
    useAlertValidationSpy.mockReturnValue({ isValid: true, invalidityReason: undefined });
    isAlertValueDefinedSpy.mockReturnValue(true);
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderValidationHook(props: Partial<IUseAlertFormValidationProps> = {}) {
    const mergedProps: IUseAlertFormValidationProps = { ...BASE_PROPS, ...props };
    return renderHook(() => useAlertFormValidation(mergedProps), { wrapper: IntlWrapper });
}

// ---------------------------------------------------------------------------
// Case 1: valid draft → isSubmitDisabled false
// ---------------------------------------------------------------------------

describe("useAlertFormValidation — valid draft", () => {
    it("returns isSubmitDisabled=false when all rules pass (no alertToEdit: new alert mode)", () => {
        const { result } = renderValidationHook();

        // New-alert mode (alertToEdit undefined): no dirty-check applies, so a fully valid draft
        // enables submit. The hook coerces the underlying `boolean | undefined` to `boolean`, so the
        // value is `false` (not `undefined`) — same truthiness the renderer relied on.
        expect(result.current.isSubmitDisabled).toBe(false);
    });

    it("returns validationErrorMessage=undefined when original automation is valid", () => {
        const { result } = renderValidationHook();

        expect(result.current.validationErrorMessage).toBeUndefined();
    });

    it("returns isParentValid=true when invalidityReason is undefined", () => {
        const { result } = renderValidationHook();

        expect(result.current.isParentValid).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Case 2: each failing rule → isSubmitDisabled true
// ---------------------------------------------------------------------------

describe("useAlertFormValidation — individual failing rules", () => {
    it("isSubmitDisabled=true when no recipients", () => {
        const { result } = renderValidationHook({
            editedAutomation: makeAutomation({ recipients: [] }),
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when over maxAutomationsRecipients", () => {
        const { result } = renderValidationHook({
            editedAutomation: makeAutomation({
                recipients: [userRecipient, { type: "user", id: "user-3", email: "u3@e.com" }],
            }),
            maxAutomationsRecipients: 1,
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when external recipient and allowExternalRecipients=false", () => {
        const { result } = renderValidationHook({
            editedAutomation: makeAutomation({ recipients: [externalRecipient] }),
            allowExternalRecipients: false,
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when unknown recipient present", () => {
        const { result } = renderValidationHook({
            editedAutomation: makeAutomation({ recipients: [unknownRecipient] }),
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when smtp channel with a non-email user recipient", () => {
        const { result } = renderValidationHook({
            editedAutomation: makeAutomation({ recipients: [userRecipientNoEmail] }),
            selectedNotificationChannel: smtpChannel,
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when title is invalid", () => {
        const { result } = renderValidationHook({
            isTitleValid: false,
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when threshold is undefined (isAlertValueDefined returns false)", () => {
        isAlertValueDefinedSpy.mockReturnValue(false);

        const { result } = renderValidationHook();

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=true when editedAutomation is undefined", () => {
        const { result } = renderValidationHook({
            editedAutomation: undefined,
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Case 3: edit-mode dirty check
// ---------------------------------------------------------------------------

describe("useAlertFormValidation — edit-mode dirty check", () => {
    const original = makeAutomation({ title: "Original Title" }) as unknown as IAutomationMetadataObject;
    const identicalEdited = makeAutomation({
        title: "Original Title",
    }) as unknown as IAutomationMetadataObjectDefinition;
    const changedEdited = makeAutomation({ title: "Changed Title" });

    it("isSubmitDisabled=true when alertToEdit is set and edited equals original (no dirty changes)", () => {
        const { result } = renderValidationHook({
            alertToEdit: original,
            originalAutomation: identicalEdited,
            editedAutomation: identicalEdited,
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled=false when alertToEdit is set but edited differs from original (dirty)", () => {
        const { result } = renderValidationHook({
            alertToEdit: original,
            originalAutomation: identicalEdited,
            editedAutomation: changedEdited,
        });

        expect(result.current.isSubmitDisabled).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Case 4: creator-only channel (allowOnlyLoggedUserRecipients)
// ---------------------------------------------------------------------------

describe("useAlertFormValidation — creator-only channel", () => {
    it("valid when exactly one recipient matching defaultRecipient.id", () => {
        const { result } = renderValidationHook({
            allowOnlyLoggedUserRecipients: true,
            editedAutomation: makeAutomation({ recipients: [defaultRecipient] }),
        });

        // New-alert mode (no alertToEdit): a valid creator-only draft enables submit.
        expect(result.current.isSubmitDisabled).toBe(false);
    });

    it("invalid when allowOnlyLoggedUserRecipients and recipient id differs from defaultRecipient", () => {
        const otherRecipient: IAutomationRecipient = { type: "user", id: "other-user" };
        const { result } = renderValidationHook({
            allowOnlyLoggedUserRecipients: true,
            editedAutomation: makeAutomation({ recipients: [otherRecipient] }),
        });

        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("invalid when allowOnlyLoggedUserRecipients and more than one recipient", () => {
        const { result } = renderValidationHook({
            allowOnlyLoggedUserRecipients: true,
            editedAutomation: makeAutomation({ recipients: [defaultRecipient, userRecipient] }),
        });

        // Two recipients even if both are defaultRecipient: length !== 1
        expect(result.current.isSubmitDisabled).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Case 5: allowExternalRecipients=true accepts external recipients
// ---------------------------------------------------------------------------

describe("useAlertFormValidation — allowExternalRecipients=true", () => {
    it("accepts external recipients when allowExternalRecipients is true", () => {
        const { result } = renderValidationHook({
            allowExternalRecipients: true,
            editedAutomation: makeAutomation({ recipients: [externalRecipient] }),
        });

        // New-alert mode (no alertToEdit): external recipients are accepted, submit enabled.
        expect(result.current.isSubmitDisabled).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Case 6: validationErrorMessage branches
// ---------------------------------------------------------------------------

describe("useAlertFormValidation — validationErrorMessage", () => {
    it("returns undefined when original automation is valid", () => {
        useAlertValidationSpy.mockReturnValue({ isValid: true, invalidityReason: undefined });

        const { result } = renderValidationHook();

        expect(result.current.validationErrorMessage).toBeUndefined();
    });

    it("returns invalidWidget message when original automation invalid and isInvalidConnectionToInsight=true", () => {
        useAlertValidationSpy.mockReturnValue({ isValid: false, invalidityReason: "missingWidget" });

        const { result } = renderValidationHook({
            isInvalidConnectionToInsight: true,
        });

        expect(result.current.validationErrorMessage).toBe("insightAlert.config.invalidWidget");
    });

    it("returns unusedWidget message when original automation invalid and isInvalidConnectionToInsight=false", () => {
        useAlertValidationSpy.mockReturnValue({ isValid: false, invalidityReason: "missingMetric" });

        const { result } = renderValidationHook({
            isInvalidConnectionToInsight: false,
        });

        expect(result.current.validationErrorMessage).toBe("insightAlert.config.unusedWidget");
    });
});

// ---------------------------------------------------------------------------
// Case 7: isParentValid — missingWidget vs missingMetric/undefined
// ---------------------------------------------------------------------------

describe("useAlertFormValidation — isParentValid", () => {
    it("isParentValid=false when invalidityReason === 'missingWidget'", () => {
        useAlertValidationSpy.mockReturnValue({ isValid: false, invalidityReason: "missingWidget" });

        const { result } = renderValidationHook();

        expect(result.current.isParentValid).toBe(false);
    });

    it("isParentValid=true when invalidityReason === 'missingMetric'", () => {
        useAlertValidationSpy.mockReturnValue({ isValid: false, invalidityReason: "missingMetric" });

        const { result } = renderValidationHook();

        expect(result.current.isParentValid).toBe(true);
    });

    it("isParentValid=true when invalidityReason is undefined", () => {
        useAlertValidationSpy.mockReturnValue({ isValid: true, invalidityReason: undefined });

        const { result } = renderValidationHook();

        expect(result.current.isParentValid).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Case 8: rerender — isSubmitDisabled recomputes on draft mutation
// ---------------------------------------------------------------------------

describe("useAlertFormValidation — rerender on draft change", () => {
    it("stays disabled in edit mode when the rerendered draft becomes valid but re-equals the original (isEqual dirty-check)", () => {
        const existingAlert = makeAutomation({
            recipients: [userRecipient],
        }) as unknown as IAutomationMetadataObject;
        const emptyRecipientsDraft = makeAutomation({ recipients: [] });
        const populatedDraft = makeAutomation({ recipients: [userRecipient] });

        const { result, rerender } = renderHook(
            ({ props }: { props: IUseAlertFormValidationProps }) => useAlertFormValidation(props),
            {
                initialProps: {
                    props: {
                        ...BASE_PROPS,
                        alertToEdit: existingAlert,
                        originalAutomation: makeAutomation({ recipients: [userRecipient] }),
                        editedAutomation: emptyRecipientsDraft,
                    },
                },
                wrapper: IntlWrapper,
            },
        );

        // Initially disabled because the draft has no recipients (invalid).
        expect(result.current.isSubmitDisabled).toBe(true);

        // Rerender with a now-valid draft whose values match the original exactly.
        rerender({
            props: {
                ...BASE_PROPS,
                alertToEdit: existingAlert,
                originalAutomation: makeAutomation({ recipients: [userRecipient] }),
                editedAutomation: populatedDraft,
            },
        });

        // Still disabled: in edit mode the rerendered draft is structurally equal to the original,
        // so the isEqual dirty-check keeps submit disabled even though the form is now valid. The
        // invalid -> valid-AND-dirty transition that actually enables submit is covered by the next test.
        expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("isSubmitDisabled recomputes from true to false when draft changes from invalid to valid-and-dirty", () => {
        const existingAlert = makeAutomation({ title: "Original" }) as unknown as IAutomationMetadataObject;
        const originalAutomation = makeAutomation({ title: "Original" });
        // Invalid draft: no recipients
        const invalidDraft = makeAutomation({ title: "Original", recipients: [] });
        // Valid draft that is also dirty (title changed)
        const dirtyValidDraft = makeAutomation({ title: "Changed", recipients: [userRecipient] });

        const { result, rerender } = renderHook(
            ({ props }: { props: IUseAlertFormValidationProps }) => useAlertFormValidation(props),
            {
                initialProps: {
                    props: {
                        ...BASE_PROPS,
                        alertToEdit: existingAlert,
                        originalAutomation,
                        editedAutomation: invalidDraft,
                    },
                },
                wrapper: IntlWrapper,
            },
        );

        // Initially disabled because no recipients
        expect(result.current.isSubmitDisabled).toBe(true);

        // Rerender with a valid dirty draft
        rerender({
            props: {
                ...BASE_PROPS,
                alertToEdit: existingAlert,
                originalAutomation,
                editedAutomation: dirtyValidDraft,
            },
        });

        // Now enabled: form is valid AND draft differs from original
        expect(result.current.isSubmitDisabled).toBe(false);
    });

    it("isSubmitDisabled recomputes when isTitleValid changes from false to true (new alert mode)", () => {
        const { result, rerender } = renderHook(
            ({ props }: { props: IUseAlertFormValidationProps }) => useAlertFormValidation(props),
            {
                initialProps: {
                    props: { ...BASE_PROPS, isTitleValid: false },
                },
                wrapper: IntlWrapper,
            },
        );

        // Initially disabled because title invalid
        expect(result.current.isSubmitDisabled).toBe(true);

        rerender({ props: { ...BASE_PROPS, isTitleValid: true } });

        // New-alert mode (no alertToEdit): once the title becomes valid the form is valid, so submit enables.
        expect(result.current.isSubmitDisabled).toBe(false);
    });
});
