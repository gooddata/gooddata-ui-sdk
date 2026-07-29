// (C) 2026 GoodData Corporation

import { type ReactElement, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { LoadingComponent } from "@gooddata/sdk-ui";
import { ConfirmDialog, UiButton, UiIcon, UiLink, UiTooltip } from "@gooddata/sdk-ui-kit";

import { useIsWhiteLabeled } from "../permission/PermissionsContext.js";
import { extractBackendErrorDetail } from "../utils/backendError.js";

import type { AsCodeValidationContext, IAsCodeDescriptor } from "./descriptor.js";
import { useAsCodeLoadFailure } from "./useAsCodeLoadFailure.js";

const AsCodeEditorBody = lazy(() =>
    import("./AsCodeEditorBody.js").then((m) => ({ default: m.AsCodeEditorBody })),
);

const messages = defineMessages({
    createSubmit: { id: "analyticsCatalog.asCode.dialog.create.submit" },
    editSubmit: { id: "analyticsCatalog.asCode.dialog.edit.submit" },
    cancel: { id: "analyticsCatalog.asCode.dialog.cancel" },
});

type Props = {
    descriptor: IAsCodeDescriptor;
    initialDefinition?: unknown;
    isLoading?: boolean;
    onClose: () => void;
    onSubmit: (definition: unknown) => Promise<void>;
    onDuplicate?: (definition: unknown) => void;
} & ({ mode: "create"; fixedIdentifier?: undefined } | { mode: "edit"; fixedIdentifier: string });

/** @internal */
export function AsCodeDialog(props: Props) {
    const { descriptor, mode, initialDefinition, isLoading = false, fixedIdentifier } = props;
    const { onClose, onSubmit, onDuplicate } = props;
    const intl = useIntl();
    const isEdit = mode === "edit";
    const isWhiteLabeled = useIsWhiteLabeled();
    // Descriptor is fixed per mount, so these hook calls are unconditional (rules of hooks). `useEditing`
    // returns `null` while the async editing brain loads.
    const editing = descriptor.useEditing();
    const requestEditing = descriptor.useRequestEditing?.();
    const fail = useAsCodeLoadFailure(descriptor, onClose);

    // Displaying the dialog requests the brain; a rejection is this mount's own request, so only a
    // still-mounted dialog reacts to it.
    useEffect(() => {
        let disposed = false;
        requestEditing?.().catch(() => {
            if (!disposed) {
                fail();
            }
        });
        return () => {
            disposed = true;
        };
    }, [requestEditing, fail]);

    // Serialize runs during render, so a throw becomes `null` and routes to the close-on-failure effect.
    const initialYaml = useMemo(() => {
        if (initialDefinition === undefined || !editing) {
            return "";
        }
        try {
            return editing.serialize(initialDefinition);
        } catch {
            return null;
        }
    }, [initialDefinition, editing]);
    const serializeFailed = initialYaml === null;
    useEffect(() => {
        if (serializeFailed) {
            fail();
        }
    }, [serializeFailed, fail]);

    const loading = isLoading || editing === null || serializeFailed;
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

    // Base is the loaded object (edit) or the copy source (duplicate); a blank create reconciles to a no-op.
    const reconcileWithBase = useCallback(
        (edited: unknown) =>
            editing?.reconcile && initialDefinition !== undefined
                ? editing.reconcile(initialDefinition, edited)
                : edited,
        [editing, initialDefinition],
    );

    const handleSubmit = useCallback(async () => {
        if (!editing || initialYaml === null) {
            return;
        }
        const context: AsCodeValidationContext =
            mode === "edit" ? { intent: "edit", fixedIdentifier } : { intent: "create" };
        const result = editing.validate(yamlValue.current ?? initialYaml, context);
        if (!result.isValid) {
            setValidationError(result.error);
            return;
        }

        const toPersist = reconcileWithBase(result.definition);

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await onSubmit(toPersist);
        } catch (error) {
            setSubmitError(
                extractBackendErrorDetail(error) ?? intl.formatMessage(descriptor.messages.submitError),
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [descriptor, editing, fixedIdentifier, initialYaml, intl, mode, onSubmit, reconcileWithBase]);

    const handleDuplicate = useCallback(() => {
        if (!onDuplicate || !editing || initialYaml === null) {
            return;
        }
        setSubmitError(null);
        // The document still carries the source id; `toCopy` derives fresh identity downstream.
        const result = editing.validate(yamlValue.current ?? initialYaml, { intent: "duplicate" });
        if (!result.isValid) {
            setValidationError(result.error);
            return;
        }

        onDuplicate(reconcileWithBase(result.definition));
    }, [editing, initialYaml, onDuplicate, reconcileWithBase]);

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
                        isDisabled={isSubmitting || loading}
                        onClick={handleDuplicate}
                    />
                ) : null}
            </div>
        ),
        [descriptor, handleDuplicate, intl, isEdit, loading, isSubmitting, isWhiteLabeled, onDuplicate],
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
            isSubmitDisabled={isSubmitting || loading || (isEdit && !isDirty)}
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
                    {loading ? (
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
                                    completionSource={editing.completionSource}
                                    syntaxErrorMessage={editing.syntaxErrorMessage}
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
