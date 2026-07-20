// (C) 2026 GoodData Corporation

import { type ReactElement, Suspense, lazy, useCallback, useMemo, useRef, useState } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { LoadingComponent } from "@gooddata/sdk-ui";
import { ConfirmDialog, UiButton, UiIcon, UiLink, UiTooltip } from "@gooddata/sdk-ui-kit";

import { useIsWhiteLabeled } from "../permission/PermissionsContext.js";
import { extractBackendErrorDetail } from "../utils/backendError.js";

import type { IAsCodeDefinition, IAsCodeDescriptor } from "./descriptor.js";

const AsCodeEditorBody = lazy(() =>
    import("./AsCodeEditorBody.js").then((m) => ({ default: m.AsCodeEditorBody })),
);

// Chrome shared by every as-code type; the entity-specific copy comes from `descriptor.messages`.
const messages = defineMessages({
    createSubmit: { id: "analyticsCatalog.asCode.dialog.create.submit" },
    editSubmit: { id: "analyticsCatalog.asCode.dialog.edit.submit" },
    cancel: { id: "analyticsCatalog.asCode.dialog.cancel" },
});

/** Whether the dialog creates a new object or edits an existing one. */
type AsCodeDialogMode = "create" | "edit";

type Props = {
    descriptor: IAsCodeDescriptor;
    mode: AsCodeDialogMode;
    // Optional because the frame renders before an edited object is fetched (see `isLoading`); the
    // editor body mounts only after loading finishes, by which point this is set, so it is always
    // seeded with real data.
    initialDefinition?: IAsCodeDefinition;
    isLoading?: boolean;
    // In edit mode, the identity the YAML must keep; validation reports an error if the id is changed.
    fixedIdentifier?: string;
    onClose: () => void;
    onSubmit: (definition: IAsCodeDefinition) => Promise<void>;
    onDuplicate?: (definition: IAsCodeDefinition) => void;
};

/**
 * Generic create/edit dialog for an as-code object, entity-agnostic via its `descriptor`: it renders
 * the shared editor chrome and delegates serialization, validation, and copy to the descriptor. The
 * caller owns loading and persistence (passes `initialDefinition`, handles `onSubmit`); this component
 * owns only the editing surface.
 *
 * @internal
 */
export function AsCodeDialog(props: Props) {
    const { descriptor, mode, initialDefinition, isLoading = false, fixedIdentifier } = props;
    const { onClose, onSubmit, onDuplicate } = props;
    const intl = useIntl();
    const isEdit = mode === "edit";
    const isWhiteLabeled = useIsWhiteLabeled();
    // The descriptor is fixed for the dialog's lifetime (one dialog edits one entity type), so calling
    // its `useEditing` hook here is unconditional and stable — the rules of hooks hold.
    const editing = descriptor.useEditing();
    const { serialize, validate, completionSource, syntaxErrorMessage } = editing;

    const initialYaml = useMemo(
        () => (initialDefinition === undefined ? "" : serialize(initialDefinition)),
        [initialDefinition, serialize],
    );
    // The user's edits; `null` until they type. Submit falls back to `initialYaml`, so the editor
    // mounts once with real data and is the single source of truth — no re-seed effect needed.
    const yamlValue = useRef<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const headlineMessage = intl.formatMessage(
        isEdit ? descriptor.messages.editTitle : descriptor.messages.createTitle,
    );
    const submitMessage = intl.formatMessage(isEdit ? messages.editSubmit : messages.createSubmit);
    const cancelMessage = intl.formatMessage(messages.cancel);

    const handleClose = useCallback(() => {
        if (!isSubmitting) {
            onClose();
        }
    }, [isSubmitting, onClose]);

    const handleChange = useCallback((nextValue: string) => {
        yamlValue.current = nextValue;
        setIsDirty(true);
        setSubmitError(null);
        setValidationError(null);
    }, []);

    const handleSubmit = useCallback(async () => {
        const result = validate(yamlValue.current ?? initialYaml, { fixedIdentifier });
        if (!result.isValid) {
            setValidationError(result.error);
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await onSubmit(result.definition);
        } catch (error) {
            setSubmitError(
                extractBackendErrorDetail(error) ?? intl.formatMessage(descriptor.messages.submitError),
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [descriptor, fixedIdentifier, initialYaml, intl, onSubmit, validate]);

    const handleDuplicate = useCallback(() => {
        if (!onDuplicate) {
            return;
        }
        setSubmitError(null);
        // A duplicate is a fresh object, so identity is not fixed even though we started from an edit.
        const result = validate(yamlValue.current ?? initialYaml, { fixedIdentifier: undefined });
        if (!result.isValid) {
            setValidationError(result.error);
            return;
        }

        onDuplicate(result.definition);
    }, [initialYaml, onDuplicate, validate]);

    const footerLeftRenderer = useCallback(
        (): ReactElement => (
            <div className="gd-ascode-dialog-footer-left">
                {isWhiteLabeled ? null : (
                    <UiLink
                        variant="secondary"
                        href={descriptor.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <UiIcon type="question" size={14} color="complementary-6" />
                        {intl.formatMessage(descriptor.messages.help)}
                    </UiLink>
                )}
                {isEdit && onDuplicate ? (
                    <UiButton
                        label={intl.formatMessage(descriptor.messages.duplicate)}
                        variant="tertiary"
                        isDisabled={isSubmitting || isLoading}
                        onClick={handleDuplicate}
                    />
                ) : null}
            </div>
        ),
        [descriptor, handleDuplicate, intl, isEdit, isLoading, isSubmitting, isWhiteLabeled, onDuplicate],
    );

    const bodySpinner = (
        <div className="gd-ascode-dialog-loading">
            <LoadingComponent />
        </div>
    );

    return (
        <ConfirmDialog
            className="gd-ascode-dialog"
            containerClassName="gd-ascode-dialog-overlay"
            headline={headlineMessage}
            cancelButtonText={cancelMessage}
            submitButtonText={submitMessage}
            isPositive
            isSubmitDisabled={isSubmitting || isLoading || (isEdit && !isDirty)}
            isCancelDisabled={isSubmitting}
            shouldCloseOnEscape={!isSubmitting}
            onCancel={handleClose}
            onClose={handleClose}
            onSubmit={handleSubmit}
            displayCloseButton={!isSubmitting}
            footerLeftRenderer={footerLeftRenderer}
        >
            <div className="gd-ascode-dialog-content">
                {/* One spinner for both phases: the object fetch (isLoading) and the editor chunk
                    download (Suspense). The frame around it never unmounts, so there is no blink. */}
                <Suspense fallback={bodySpinner}>
                    {isLoading ? (
                        bodySpinner
                    ) : (
                        <>
                            <div className="gd-ascode-dialog-section-header">
                                {intl.formatMessage(descriptor.messages.sectionHeader)}
                                <UiTooltip
                                    arrowPlacement="top"
                                    optimalPlacement
                                    triggerBy={["hover", "click", "focus"]}
                                    anchor={<UiIcon type="question" size={14} color="complementary-6" />}
                                    content={intl.formatMessage(descriptor.messages.sectionHeaderTooltip)}
                                />
                            </div>
                            <div className="gd-ascode-dialog-editor">
                                <AsCodeEditorBody
                                    initialValue={initialYaml}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    completionSource={completionSource}
                                    syntaxErrorMessage={syntaxErrorMessage}
                                />
                            </div>
                            {validationError || submitError ? (
                                <div className="gd-ascode-dialog-error">
                                    <span className="gd-ascode-dialog-error-label">
                                        <FormattedMessage id="analyticsCatalog.dialog.error.label" />
                                    </span>{" "}
                                    {validationError ?? submitError}
                                </div>
                            ) : null}
                        </>
                    )}
                </Suspense>
            </div>
        </ConfirmDialog>
    );
}
