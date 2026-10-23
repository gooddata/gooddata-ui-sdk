// (C) 2021-2026 GoodData Corporation

import { type ReactElement, forwardRef } from "react";

import { handler, useApi } from "../../shared/hooks/useApi.js";
import { EditMetricContentForm } from "../Form/EditMetricContentForm.js";
import { OtherMetricsProvider } from "../Form/OtherMetrics/OtherMetricsContext.js";
import { useMetricContentState } from "../hooks/useMetricContentState.js";
import { IdChangeConfirmDialog } from "../IdChangeConfirmDialog/IdChangeConfirmDialog.js";
import { UnsavedChangesConfirmDialog } from "../UnsavedChangesConfirmDialog/UnsavedChangesConfirmDialog.js";

import { type IEditMetricContentApi, type IEditMetricContentProps } from "./EditMetricContent.data.js";

export const EditMetricContent = forwardRef<IEditMetricContentApi, IEditMetricContentProps>(
    function EditMetricContent(
        {
            metric,
            setting = {
                sqlOpen: false,
                computedFor: null,
                display: { limit: 10, ranking: "top" },
                attributes: [],
            },
            focusedField,
            generateNewId,
            usage,
            showCloseButton = true,
            saveMode,
            permissions,
            onCancel,
            onDelete,
            onSave,
            onDirtyChanged,
            onValueChange,
            onSettingsChange,
            metricOpenType,
            onMetricClick,
            activeInsight,
            insightOpenType,
            onInsightClick,
            isWhiteLabeled,
            separators,
            useReferences,
            currencyFormatOverride,
            enableMetricFormatOverrides,
            draftAccess,
            onDraftAccessChange,
        },
        ref,
    ): ReactElement {
        const {
            comp,
            defaultId,
            defaultPrefix,
            initialRegenerateId,
            initialValueMetric,
            initialFocusedField,
            showIdChangeConfirmDialog,
            showUnsavedChangesConfirmDialog,
            onSaveClick,
            onSaveAsClick,
            onSaveKeepIdClick,
            onSaveChangeIdClick,
            onDirtyChangedCallback,
            onValueChangedCallback,
            onSettingsChangeCallback,
            onCloseIdChange,
            onCloseCallback,
            onCancelCallback,
            onSaveUnchangedChangesCallback,
            onCloseUnchangedChangesCallback,
            onCancelUnchangedChangesCallback,
        } = useMetricContentState(
            metric,
            focusedField,
            generateNewId,
            saveMode,
            onSave,
            onCancel,
            onDirtyChanged,
            onValueChange,
            onSettingsChange,
        );

        useApi<IEditMetricContentApi | undefined>(
            ref,
            {
                close: handler(comp, (api) => api.close()),
                save: handler(comp, (api) => api.save()),
                saveForce: handler(comp, (api) => api.saveForce()),
            },
            [comp],
        );

        return (
            <>
                <OtherMetricsProvider defaultId={defaultId} defaultPrefix={defaultPrefix}>
                    <EditMetricContentForm
                        // oxlint-disable-next-line @typescript-eslint/no-explicit-any
                        ref={comp}
                        metric={initialValueMetric}
                        setting={setting}
                        permissions={permissions}
                        initialFocus={initialFocusedField}
                        regenerateId={initialRegenerateId}
                        usage={usage}
                        showCloseButton={showCloseButton}
                        onClose={onCloseCallback}
                        onCancel={onCancelCallback}
                        onDelete={onDelete}
                        onSave={onSaveClick}
                        onSaveAs={onSaveAsClick}
                        onDirtyChanged={onDirtyChangedCallback}
                        onValueChange={onValueChangedCallback}
                        onSettingsChange={onSettingsChangeCallback}
                        activeInsight={activeInsight}
                        insightOpenType={insightOpenType}
                        onInsightClick={onInsightClick}
                        metricOpenType={metricOpenType}
                        onMetricClick={onMetricClick}
                        isWhiteLabeled={isWhiteLabeled}
                        separators={separators}
                        useReferences={useReferences}
                        currencyFormatOverride={currencyFormatOverride}
                        enableMetricFormatOverrides={enableMetricFormatOverrides}
                        draftAccess={draftAccess}
                        onDraftAccessChange={onDraftAccessChange}
                    />
                </OtherMetricsProvider>
                {showIdChangeConfirmDialog.visible && (
                    <IdChangeConfirmDialog
                        mode={saveMode}
                        metricId={showIdChangeConfirmDialog.oldId}
                        newMetricId={showIdChangeConfirmDialog.newId}
                        metricIdChanged={showIdChangeConfirmDialog.idChanged}
                        conflicts={showIdChangeConfirmDialog.conflicts}
                        onClose={onCloseIdChange}
                        onCancel={onSaveKeepIdClick}
                        onSubmit={onSaveChangeIdClick}
                    />
                )}
                {showUnsavedChangesConfirmDialog && (
                    <UnsavedChangesConfirmDialog
                        metrics={[{ metric, changed: true }]}
                        onClose={onCloseUnchangedChangesCallback}
                        onCancel={onCancelUnchangedChangesCallback}
                        onSubmit={onSaveUnchangedChangesCallback}
                    />
                )}
            </>
        );
    },
);
