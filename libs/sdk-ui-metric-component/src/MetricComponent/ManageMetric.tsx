// (C) 2021-2026 GoodData Corporation

import { type Ref, forwardRef, useRef, useState } from "react";

import {
    type IInsight,
    type IMeasureMetadataObject,
    type IMetadataObject,
    type ISeparators,
    type IWorkspacePermissions,
} from "@gooddata/sdk-model";

import { handler, useApi } from "../shared/hooks/useApi.js";
import { fullWorkspacePermissions } from "../shared/permissions.js";

import { DeleteMetric } from "./DeleteMetric.js";
import { EditMetric, type IEditMetricApi } from "./EditMetric.js";
import { type IPrefixes } from "./Form/Prefixes/PrefixesContext.js";
import { type IDeleteMetricInfo } from "./metric/deleteInfo.js";
import { type IMeasureDef, type IMeasureSetting } from "./metric/metricHelpers.js";
import { type ISaveMetricInfo } from "./metric/saveInfo.js";

/**
 * @internal
 */
export interface IManageMetricApi {
    save: () => Promise<void>;
    saveForce: () => Promise<void>;
    close: () => void;
}

/**
 * @internal
 */
export interface IManageMetricProps {
    locale?: string;
    setting?: IMeasureSetting;
    prefixes?: IPrefixes;
    editingMetric?: IMeasureDef | false | null;
    deletingMetric?: IMeasureDef | false | null;
    onDelete?: (metric: IMeasureMetadataObject, info: IDeleteMetricInfo, err: Error | null) => void;
    onSave?: (metric: IMeasureDef, info: ISaveMetricInfo, err: Error | null) => Promise<void> | void;
    onDirtyChanged?: (dirty: boolean) => void;
    onDeleteCancel?: () => void;
    onEditCancel?: () => void;
    onMetricsChange?: (metric: IMeasureDef) => void;
    insightOpenType?: "external" | "internal";
    onInsightClick?: (object: IInsight) => void;
    metricOpenType?: "external" | "internal";
    onMetricClick?: (object: IMetadataObject) => void;
    permissions?: IWorkspacePermissions;
    ref?: Ref<IManageMetricApi | undefined>;
    isWhiteLabeled?: boolean;
    separators?: ISeparators;
    onSettingChange?: (setting: Partial<IMeasureSetting>) => void;
    useReferences?: boolean;
    currencyFormatOverride?: string | null;
    enableMetricFormatOverrides?: boolean;
}

/**
 * @internal
 */
export const ManageMetric = forwardRef<IManageMetricApi | undefined, IManageMetricProps>(
    function ManageMetric(
        {
            locale,
            setting,
            prefixes,
            onSettingChange,
            permissions = fullWorkspacePermissions(),
            editingMetric,
            deletingMetric,
            onDelete,
            onSave,
            onDirtyChanged,
            onEditCancel,
            onDeleteCancel,
            onMetricsChange,
            metricOpenType,
            onMetricClick,
            insightOpenType,
            onInsightClick,
            isWhiteLabeled,
            separators,
            useReferences,
            currencyFormatOverride,
            enableMetricFormatOverrides,
        },
        ref,
    ) {
        const editMetricApi = useRef<IEditMetricApi | undefined>(undefined);
        const [deleteMetric, setDeletingMetric] = useState<IMeasureDef | null>(deletingMetric || null);

        useApi<IManageMetricApi | undefined>(
            ref,
            {
                close: handler(editMetricApi, (api) => api.close()),
                save: handler(editMetricApi, (api) => api.save()),
                saveForce: handler(editMetricApi, (api) => api.saveForce()),
            },
            [editMetricApi],
        );

        return (
            <>
                {editingMetric && (
                    <EditMetric
                        ref={editMetricApi}
                        locale={locale}
                        prefixes={prefixes}
                        metric={editingMetric}
                        setting={setting}
                        permissions={permissions}
                        onDelete={() => setDeletingMetric(editingMetric)}
                        onCancel={onEditCancel}
                        onSave={onSave}
                        onDirtyChanged={onDirtyChanged}
                        onMetricsChange={onMetricsChange}
                        insightOpenType={insightOpenType}
                        onInsightClick={onInsightClick}
                        metricOpenType={metricOpenType}
                        onMetricClick={onMetricClick}
                        isWhiteLabeled={isWhiteLabeled}
                        separators={separators}
                        currencyFormatOverride={currencyFormatOverride}
                        enableMetricFormatOverrides={enableMetricFormatOverrides}
                        onSettingChange={onSettingChange}
                        useReferences={useReferences}
                    />
                )}
                {deleteMetric && (
                    <DeleteMetric
                        locale={locale}
                        metric={deleteMetric}
                        onDelete={(metric, refs, err) => {
                            if (!err) {
                                setDeletingMetric(null);
                            }
                            if (onDelete) {
                                onDelete(metric, refs, err);
                            }
                        }}
                        onClose={() => {
                            setDeletingMetric(null);
                            if (onDeleteCancel) {
                                onDeleteCancel();
                            }
                        }}
                        onMetricsChange={onMetricsChange}
                    />
                )}
            </>
        );
    },
);
