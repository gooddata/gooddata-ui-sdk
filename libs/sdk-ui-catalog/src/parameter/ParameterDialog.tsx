// (C) 2026 GoodData Corporation

import { type ReactElement, useCallback, useRef, useState } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";
import { ConfirmDialog, UiButton, UiIcon, UiTooltip } from "@gooddata/sdk-ui-kit";

import type { ParameterSchemaInput } from "./parameterSchema.js";
import { serializeParameterToYaml } from "./parameterSerialization.js";
import { validateParameterYaml } from "./parameterValidation.js";
import { ParameterYamlEditor } from "./ParameterYamlEditor.js";

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
    dialogSaveAsNew: { id: "analyticsCatalog.parameter.dialog.edit.saveAsNew" },
});

export type ParameterDialogInitialParameter = ParameterSchemaInput;

type Props = {
    mode: "create" | "edit";
    initialParameter?: ParameterDialogInitialParameter;
    onClose: () => void;
    onSubmit: (parameter: IParameterMetadataObjectDefinition, saveAsNew?: boolean) => Promise<void>;
};

export function ParameterDialog(props: Props) {
    const { mode, initialParameter, onClose, onSubmit } = props;
    const intl = useIntl();
    const isEdit = mode === "edit";
    const initialYaml = initialParameter ? serializeParameterToYaml(initialParameter) : "";
    const yamlValue = useRef(initialYaml);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const headlineMessage = intl.formatMessage(
        isEdit ? messages.dialogEditTitle : messages.dialogCreateTitle,
    );
    const submitMessage = intl.formatMessage(
        isEdit ? messages.dialogEditSubmit : messages.dialogCreateSubmit,
    );
    const cancelMessage = intl.formatMessage(messages.dialogCancel);
    const fixedIdentifier = isEdit ? initialParameter?.id : undefined;

    const validate = useCallback(
        (value: string, saveAsNew?: boolean) => {
            const result = validateParameterYaml(value, {
                fixedIdentifier: isEdit && saveAsNew !== true ? fixedIdentifier : undefined,
            });
            setValidationError(result.isValid ? null : intl.formatMessage(messages[result.errorCode]));
            return result;
        },
        [fixedIdentifier, intl, isEdit],
    );

    const handleClose = useCallback(() => {
        if (!isSubmitting) {
            onClose();
        }
    }, [isSubmitting, onClose]);

    const handleChange = useCallback(
        (nextValue: string) => {
            yamlValue.current = nextValue;
            setSubmitError(null);
            validate(nextValue);
        },
        [validate],
    );

    const handleSubmit = useCallback(
        async (saveAsNew?: boolean) => {
            const result = validate(yamlValue.current, saveAsNew);
            if (!result.isValid) {
                return;
            }

            setIsSubmitting(true);
            setSubmitError(null);

            try {
                await onSubmit(result.parameter, saveAsNew === true);
            } catch (error) {
                const message = error instanceof Error && error.message ? error.message : undefined;
                setSubmitError(message ?? intl.formatMessage(messages.dialogSubmitError));
            } finally {
                setIsSubmitting(false);
            }
        },
        [intl, onSubmit, validate],
    );

    const footerLeftRenderer = useCallback(
        (): ReactElement => (
            <div className="gd-parameter-dialog-footer-left">
                <a
                    className="gd-parameter-dialog-help-link"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    rel="noopener noreferrer"
                >
                    <UiIcon type="question" size={14} color="complementary-6" />
                    <FormattedMessage id="analyticsCatalog.parameter.dialog.help" />
                </a>
                {isEdit ? (
                    <UiButton
                        label={intl.formatMessage(messages.dialogSaveAsNew)}
                        variant="tertiary"
                        isDisabled={isSubmitting}
                        onClick={() => handleSubmit(true)}
                    />
                ) : null}
            </div>
        ),
        [intl, isEdit, isSubmitting, handleSubmit],
    );

    return (
        <ConfirmDialog
            className="gd-parameter-dialog"
            containerClassName="gd-parameter-dialog-overlay"
            headline={headlineMessage}
            cancelButtonText={cancelMessage}
            submitButtonText={submitMessage}
            isPositive
            isSubmitDisabled={validationError !== null || isSubmitting}
            isCancelDisabled={isSubmitting}
            showProgressIndicator={isSubmitting}
            shouldCloseOnEscape={!isSubmitting}
            onCancel={handleClose}
            onClose={handleClose}
            onSubmit={handleSubmit}
            displayCloseButton={!isSubmitting}
            footerLeftRenderer={footerLeftRenderer}
        >
            <div className="gd-parameter-dialog-content">
                <div className="gd-parameter-dialog-section-header">
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
                <div className="gd-parameter-dialog-editor">
                    <ParameterYamlEditor
                        initialValue={initialYaml}
                        onChange={handleChange}
                        disabled={isSubmitting}
                    />
                </div>
                {validationError || submitError ? (
                    <div className="gd-parameter-dialog-error">
                        <span className="gd-parameter-dialog-error-label">Error:</span>{" "}
                        {validationError ?? submitError}
                    </div>
                ) : null}
            </div>
        </ConfirmDialog>
    );
}
