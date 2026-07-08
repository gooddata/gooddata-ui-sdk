// (C) 2026 GoodData Corporation

import { type ReactElement, Suspense, lazy, useCallback, useMemo, useRef, useState } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import type { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";
import { LoadingComponent } from "@gooddata/sdk-ui";
import { ConfirmDialog, UiButton, UiIcon, UiLink, UiTooltip } from "@gooddata/sdk-ui-kit";

import { useIsWhiteLabeled } from "../permission/PermissionsContext.js";
import { extractBackendErrorDetail } from "../utils/backendError.js";

import type { MetricYaml } from "./metricConverter.js";
import { serializeMetricToYaml } from "./metricSerialization.js";
import { validateMetricYaml } from "./metricValidation.js";

const MetricYamlEditor = lazy(() =>
    import("./MetricYamlEditor.js").then((m) => ({ default: m.MetricYamlEditor })),
);

const METRIC_DOCS_URL = "https://www.gooddata.ai/docs/cloud/api-and-sdk/vs-code-extension/structures/#metric";

const messages = defineMessages({
    empty: { id: "analyticsCatalog.metric.validation.empty" },
    syntax: { id: "analyticsCatalog.metric.validation.syntax" },
    invalidStructure: { id: "analyticsCatalog.metric.validation.invalidStructure" },
    idImmutable: { id: "analyticsCatalog.metric.dialog.edit.idImmutable" },
    missingMaql: { id: "analyticsCatalog.metric.validation.missingMaql" },
    invalidTags: { id: "analyticsCatalog.metric.validation.invalidTags" },
    dialogSubmitError: { id: "analyticsCatalog.metric.dialog.submit.error" },
    dialogCreateTitle: { id: "analyticsCatalog.metric.dialog.create.title" },
    dialogEditTitle: { id: "analyticsCatalog.metric.dialog.edit.title" },
    dialogCreateSubmit: { id: "analyticsCatalog.metric.dialog.create.submit" },
    dialogEditSubmit: { id: "analyticsCatalog.metric.dialog.edit.submit" },
    dialogCancel: { id: "analyticsCatalog.metric.dialog.cancel" },
    dialogDuplicate: { id: "analyticsCatalog.metric.dialog.edit.duplicate" },
});

export type MetricDialogMode = "create" | "edit";

type Props = {
    mode: MetricDialogMode;
    // Optional because the frame renders before the metric is fetched (see `isLoading`); the editor
    // body only mounts once this is present, so it is always seeded with real data.
    initialMetric?: MetricYaml;
    isLoading?: boolean;
    onClose: () => void;
    onSubmit: (measure: IMeasureMetadataObjectDefinition) => Promise<void>;
    onDuplicate?: (measure: IMeasureMetadataObjectDefinition) => void;
};

export function MetricDialog(props: Props) {
    const { mode, initialMetric, isLoading = false, onClose, onSubmit, onDuplicate } = props;
    const intl = useIntl();
    const isEdit = mode === "edit";
    const isWhiteLabeled = useIsWhiteLabeled();
    const initialYaml = useMemo(
        () => (initialMetric ? serializeMetricToYaml(initialMetric) : ""),
        [initialMetric],
    );
    // The user's edits; `null` until they type. Submit falls back to `initialYaml`, so the editor
    // mounts once with real data and is the single source of truth — no re-seed effect needed.
    const yamlValue = useRef<string | null>(null);
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
    const fixedIdentifier = isEdit ? initialMetric?.id : undefined;

    const validate = useCallback(
        (value: string, allowIdChange = false) => {
            return validateMetricYaml(value, {
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
        const result = validate(yamlValue.current ?? initialYaml);
        if (!result.isValid) {
            setValidationError(intl.formatMessage(messages[result.errorCode]));
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await onSubmit(result.measure);
        } catch (error) {
            setSubmitError(
                extractBackendErrorDetail(error) ?? intl.formatMessage(messages.dialogSubmitError),
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [initialYaml, intl, onSubmit, validate]);

    const handleDuplicate = useCallback(() => {
        if (!onDuplicate) {
            return;
        }
        setSubmitError(null);
        const result = validate(yamlValue.current ?? initialYaml, true);
        if (!result.isValid) {
            setValidationError(intl.formatMessage(messages[result.errorCode]));
            return;
        }

        onDuplicate(result.measure);
    }, [initialYaml, intl, onDuplicate, validate]);

    const footerLeftRenderer = useCallback(
        (): ReactElement => (
            <div className="gd-ascode-dialog-footer-left">
                {isWhiteLabeled ? null : (
                    <UiLink
                        variant="secondary"
                        href={METRIC_DOCS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <UiIcon type="question" size={14} color="complementary-6" />
                        <FormattedMessage id="analyticsCatalog.metric.dialog.help" />
                    </UiLink>
                )}
                {isEdit && onDuplicate ? (
                    <UiButton
                        label={intl.formatMessage(messages.dialogDuplicate)}
                        variant="tertiary"
                        isDisabled={isSubmitting || isLoading}
                        onClick={handleDuplicate}
                    />
                ) : null}
            </div>
        ),
        [handleDuplicate, intl, isEdit, isLoading, isSubmitting, isWhiteLabeled, onDuplicate],
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
                {/* One spinner for both phases: the metric fetch (isLoading) and the editor chunk
                    download (Suspense). The frame around it never unmounts, so there is no blink. */}
                <Suspense fallback={bodySpinner}>
                    {isLoading ? (
                        bodySpinner
                    ) : (
                        <>
                            <div className="gd-ascode-dialog-section-header">
                                <FormattedMessage id="analyticsCatalog.metric.dialog.sectionHeader" />
                                <UiTooltip
                                    arrowPlacement="top"
                                    optimalPlacement
                                    triggerBy={["hover", "click", "focus"]}
                                    anchor={<UiIcon type="question" size={14} color="complementary-6" />}
                                    content={
                                        <FormattedMessage id="analyticsCatalog.metric.dialog.sectionHeader.tooltip" />
                                    }
                                />
                            </div>
                            <div className="gd-ascode-dialog-editor">
                                <MetricYamlEditor
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
                        </>
                    )}
                </Suspense>
            </div>
        </ConfirmDialog>
    );
}
