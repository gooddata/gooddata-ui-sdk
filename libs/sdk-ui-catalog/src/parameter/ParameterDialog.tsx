// (C) 2026 GoodData Corporation

import { type ReactElement, useCallback, useRef, useState } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";
import { ConfirmDialog, UiButton, UiIcon, UiLink, UiTooltip } from "@gooddata/sdk-ui-kit";

import { useIsWhiteLabeled } from "../permission/PermissionsContext.js";
import { extractBackendErrorDetail } from "../utils/backendError.js";

import { type ParameterDraft, serializeParameterToYaml } from "./parameterSerialization.js";
import { validateParameterYaml } from "./parameterValidation.js";
import { ParameterYamlEditor } from "./ParameterYamlEditor.js";

const PARAMETER_DOCS_URL = "https://www.gooddata.ai/docs/cloud/experimental-features/numeric-parameters/";

const messages = defineMessages({
    empty: { id: "analyticsCatalog.parameter.validation.empty" },
    syntax: { id: "analyticsCatalog.parameter.validation.syntax" },
    invalidStructure: { id: "analyticsCatalog.parameter.validation.invalidStructure" },
    idImmutable: { id: "analyticsCatalog.parameter.dialog.edit.idImmutable" },
    unsupportedType: { id: "analyticsCatalog.parameter.validation.unsupportedType" },
    invalidDefaultValue: { id: "analyticsCatalog.parameter.validation.invalidDefaultValue" },
    invalidConstraints: { id: "analyticsCatalog.parameter.validation.invalidConstraints" },
    invalidConstraintRange: { id: "analyticsCatalog.parameter.validation.invalidConstraintRange" },
    invalidTags: { id: "analyticsCatalog.parameter.validation.invalidTags" },
    dialogSubmitError: { id: "analyticsCatalog.parameter.dialog.submit.error" },
    dialogCreateTitle: { id: "analyticsCatalog.parameter.dialog.create.title" },
    dialogEditTitle: { id: "analyticsCatalog.parameter.dialog.edit.title" },
    dialogCreateSubmit: { id: "analyticsCatalog.parameter.dialog.create.submit" },
    dialogEditSubmit: { id: "analyticsCatalog.parameter.dialog.edit.submit" },
    dialogCancel: { id: "analyticsCatalog.parameter.dialog.cancel" },
    dialogDuplicate: { id: "analyticsCatalog.parameter.dialog.edit.duplicate" },
});

export type ParameterDialogMode = "create" | "edit";

type Props = {
    mode: ParameterDialogMode;
    initialParameter?: ParameterDraft;
    onClose: () => void;
    onSubmit: (parameter: IParameterMetadataObjectDefinition) => Promise<void>;
    onDuplicate?: (parameter: IParameterMetadataObjectDefinition) => void;
};

export function ParameterDialog(props: Props) {
    const { mode, initialParameter, onClose, onSubmit, onDuplicate } = props;
    const intl = useIntl();
    const isEdit = mode === "edit";
    const isWhiteLabeled = useIsWhiteLabeled();
    const initialYaml = initialParameter ? serializeParameterToYaml(initialParameter) : "";
    const yamlValue = useRef(initialYaml);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const headlineMessage = intl.formatMessage(
        isEdit ? messages.dialogEditTitle : messages.dialogCreateTitle,
    );
    const submitMessage = intl.formatMessage(
        isEdit ? messages.dialogEditSubmit : messages.dialogCreateSubmit,
    );
    const cancelMessage = intl.formatMessage(messages.dialogCancel);
    const fixedIdentifier = isEdit ? initialParameter?.id : undefined;

    const validate = useCallback(
        (value: string, allowIdChange = false) => {
            return validateParameterYaml(value, {
                fixedIdentifier: isEdit && !allowIdChange ? fixedIdentifier : undefined,
            });
        },
        [fixedIdentifier, isEdit],
    );

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
        const result = validate(yamlValue.current);
        if (!result.isValid) {
            setValidationError(intl.formatMessage(messages[result.errorCode]));
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await onSubmit(result.parameter);
        } catch (error) {
            setSubmitError(
                extractBackendErrorDetail(error) ?? intl.formatMessage(messages.dialogSubmitError),
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [intl, onSubmit, validate]);

    const handleDuplicate = useCallback(() => {
        if (!onDuplicate) {
            return;
        }
        setSubmitError(null);
        const result = validate(yamlValue.current, true);
        if (!result.isValid) {
            setValidationError(intl.formatMessage(messages[result.errorCode]));
            return;
        }

        onDuplicate(result.parameter);
    }, [intl, onDuplicate, validate]);

    const footerLeftRenderer = useCallback(
        (): ReactElement => (
            <div className="gd-ascode-dialog-footer-left">
                {isWhiteLabeled ? null : (
                    <UiLink
                        variant="secondary"
                        href={PARAMETER_DOCS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <UiIcon type="question" size={14} color="complementary-6" />
                        <FormattedMessage id="analyticsCatalog.parameter.dialog.help" />
                    </UiLink>
                )}
                {isEdit && onDuplicate ? (
                    <UiButton
                        label={intl.formatMessage(messages.dialogDuplicate)}
                        variant="tertiary"
                        isDisabled={isSubmitting}
                        onClick={handleDuplicate}
                    />
                ) : null}
            </div>
        ),
        [handleDuplicate, intl, isEdit, isSubmitting, isWhiteLabeled, onDuplicate],
    );

    return (
        <ConfirmDialog
            className="gd-ascode-dialog"
            containerClassName="gd-ascode-dialog-overlay"
            headline={headlineMessage}
            cancelButtonText={cancelMessage}
            submitButtonText={submitMessage}
            isPositive
            isSubmitDisabled={isSubmitting || (isEdit && !isDirty)}
            isCancelDisabled={isSubmitting}
            shouldCloseOnEscape={!isSubmitting}
            onCancel={handleClose}
            onClose={handleClose}
            onSubmit={handleSubmit}
            displayCloseButton={!isSubmitting}
            footerLeftRenderer={footerLeftRenderer}
        >
            <div className="gd-ascode-dialog-content">
                <div className="gd-ascode-dialog-section-header">
                    <FormattedMessage id="analyticsCatalog.parameter.dialog.sectionHeader" />
                    <UiTooltip
                        arrowPlacement="top"
                        optimalPlacement
                        triggerBy={["hover", "click", "focus"]}
                        anchor={<UiIcon type="question" size={14} color="complementary-6" />}
                        content={
                            <FormattedMessage id="analyticsCatalog.parameter.dialog.sectionHeader.tooltip" />
                        }
                    />
                </div>
                <div className="gd-ascode-dialog-editor">
                    <ParameterYamlEditor
                        initialValue={initialYaml}
                        onChange={handleChange}
                        disabled={isSubmitting}
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
            </div>
        </ConfirmDialog>
    );
}
