// (C) 2021-2026 GoodData Corporation

import { type ReactElement, type Ref, forwardRef, useCallback, useRef } from "react";

import {
    type IInsight,
    type IMeasureMetadataObject,
    type IMetadataObject,
    type ISeparators,
    type IWorkspacePermissions,
} from "@gooddata/sdk-model";
import { type IObjectShareDraft } from "@gooddata/sdk-ui-ext";

import { handler, useApi } from "../shared/hooks/useApi.js";
import { fullWorkspacePermissions } from "../shared/permissions.js";

import {
    type CancelMode,
    type IEditMetricContentApi,
    type SaveNameMode,
} from "./Content/EditMetricContent.data.js";
import { EditMetricContent } from "./Content/EditMetricContent.js";
import { type FormField } from "./Form/data.js";
import { useApplyMetricAccess } from "./Form/Header/share/useApplyMetricAccess.js";
import { type IPrefixes, PrefixesProvider } from "./Form/Prefixes/PrefixesContext.js";
import { useEditCallbacks } from "./hooks/useEditCallbacks.js";
import { useInitialValues } from "./hooks/useInitialValues.js";
import { useMetricUsage } from "./hooks/useMetricUsage.js";
import { type IMeasureDef, type IMeasureSetting } from "./metric/metricHelpers.js";
import { type ISaveMetricInfo } from "./metric/saveInfo.js";

/**
 * @internal
 */
export interface IEditMetricProps {
    metric: IMeasureDef;
    setting?: IMeasureSetting;
    locale?: string;
    prefixes?: IPrefixes;
    initial?: IMeasureDef;
    focusedField?: FormField;
    generateNewId?: boolean;
    saveMode?: SaveNameMode;
    permissions?: IWorkspacePermissions;
    showCloseButton?: boolean;
    onDelete?: (metric: IMeasureMetadataObject) => void;
    onCancel?: (cancelMode: CancelMode | undefined) => void;
    onSave?: (
        metric: IMeasureMetadataObject,
        info: ISaveMetricInfo,
        err: Error | null,
    ) => Promise<void> | void;
    onDirtyChanged?: (dirty: boolean) => void;
    onMetricsChange?: (metric: IMeasureDef) => void;
    onValueChange?: (metric: IMeasureDef, valid: boolean) => void;
    onSettingChange?: (setting: Partial<IMeasureSetting>) => void;
    activeInsight?: IInsight;
    insightOpenType?: "external" | "internal";
    onInsightClick?: (object: IInsight) => void;
    metricOpenType?: "external" | "internal";
    onMetricClick?: (object: IMetadataObject) => void;
    ref?: Ref<IEditMetricApi | undefined>;
    isWhiteLabeled?: boolean;
    separators?: ISeparators;
    useReferences?: boolean;
    currencyFormatOverride?: string | null;
    enableMetricFormatOverrides?: boolean;
    /** Access drafted so far, kept by the tab. */
    draftAccess?: IObjectShareDraft;
    onDraftAccessChange?: (draftAccess: IObjectShareDraft | undefined) => void;
}

/**
 * @internal
 */
export interface IEditMetricApi {
    close: () => void;
    save: () => Promise<void>;
    saveForce: () => Promise<void>;
}

/**
 * @internal
 */
export const EditMetric = forwardRef<IEditMetricApi | undefined, IEditMetricProps>(function EditMetric(
    {
        initial,
        setting,
        metric,
        prefixes,
        saveMode,
        focusedField,
        generateNewId,
        showCloseButton = true,
        permissions = fullWorkspacePermissions(),
        onDelete,
        onSave,
        onCancel,
        onDirtyChanged,
        onMetricsChange,
        onValueChange,
        metricOpenType,
        onMetricClick,
        activeInsight,
        insightOpenType,
        onInsightClick,
        isWhiteLabeled,
        separators,
        onSettingChange,
        useReferences,
        currencyFormatOverride,
        enableMetricFormatOverrides,
        draftAccess,
        onDraftAccessChange,
    },
    ref,
): ReactElement {
    const comp = useRef<IEditMetricContentApi | undefined>(undefined);
    const [currentMetric, setCurrentMetric] = useInitialValues(metric, initial);

    const usage = useMetricUsage(currentMetric);
    // Drops the tab's copy once applied, so the next save cannot send it again.
    const dropDraftAccess = useCallback(() => onDraftAccessChange?.(undefined), [onDraftAccessChange]);
    const applyAccess = useApplyMetricAccess(draftAccess, dropDraftAccess);
    const { onSaveHandler, onDeleteHandler, onCancelHandler } = useEditCallbacks(
        currentMetric,
        setCurrentMetric,
        usage,
        onCancel,
        onDelete,
        onSave,
        onMetricsChange,
        applyAccess,
    );

    useApi<IEditMetricApi | undefined>(
        ref,
        {
            close: handler(comp, (api) => api.close()),
            save: handler(comp, (api) => api.save()),
            saveForce: handler(comp, (api) => api.saveForce()),
        },
        [comp],
    );

    return (
        <PrefixesProvider current={prefixes?.current} parents={prefixes?.parents ?? []}>
            <EditMetricContent
                // oxlint-disable-next-line @typescript-eslint/no-explicit-any
                ref={comp as any}
                usage={usage}
                focusedField={focusedField}
                generateNewId={generateNewId}
                saveMode={saveMode}
                metric={currentMetric}
                permissions={permissions}
                onCancel={onCancelHandler}
                onSave={onSaveHandler}
                onDelete={onDeleteHandler}
                onDirtyChanged={onDirtyChanged}
                onValueChange={onValueChange}
                showCloseButton={showCloseButton}
                activeInsight={activeInsight}
                insightOpenType={insightOpenType}
                onInsightClick={onInsightClick}
                metricOpenType={metricOpenType}
                onMetricClick={onMetricClick}
                isWhiteLabeled={isWhiteLabeled}
                separators={separators}
                setting={setting}
                onSettingsChange={onSettingChange}
                useReferences={useReferences}
                currencyFormatOverride={currencyFormatOverride}
                enableMetricFormatOverrides={enableMetricFormatOverrides}
                draftAccess={draftAccess}
                onDraftAccessChange={onDraftAccessChange}
            />
        </PrefixesProvider>
    );
});
