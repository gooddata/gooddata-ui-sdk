// (C) 2021-2026 GoodData Corporation

import { type Ref, forwardRef, useContext, useRef, useState } from "react";

import { type ISeparators, type IWorkspacePermissions } from "@gooddata/sdk-model";

import { useApi } from "../shared/hooks/useApi.js";
import { TabState } from "../shared/Tabs/Tab.js";
import { IntlWrapper } from "../translations/IntlWrapper.js";

import { DeleteMetric } from "./DeleteMetric.js";
import { type IEditMetricApi } from "./EditMetric.js";
import { type IPrefixes } from "./Form/Prefixes/PrefixesContext.js";
import { IdChangeConfirmDialog } from "./IdChangeConfirmDialog/IdChangeConfirmDialog.js";
import { type IMeasureDef } from "./metric/metricHelpers.js";
import { MetricContextMode, MetricsContextProvider } from "./MetricsContext/MetricsContext.js";
import { MetricsState } from "./MetricsState.js";
import { type CloseAllTabsResult } from "./MetricState/metricState.data.js";
import { MultipleMetricsContext } from "./MultipleMetricsState.js";
import { UnsavedChangesConfirmDialog } from "./UnsavedChangesConfirmDialog/UnsavedChangesConfirmDialog.js";

/**
 * @internal
 */
export interface IManageMetricsProps {
    ref?: Ref<IManageMetricsApi | undefined>;
    locale?: string;
    prefixes?: IPrefixes;
    permissions?: IWorkspacePermissions;
    isWhiteLabeled?: boolean;
    separators?: ISeparators;
    maximized?: boolean;
    setMinimized: (minimized: boolean) => void;
    setMaximized: (maximized: boolean) => void;
    useReferences?: boolean;
    currencyFormatOverride?: string | null;
    enableMetricFormatOverrides?: boolean;
}

/**
 * @internal
 */
export interface IManageMetricsApi {
    saveAndCloseAll: () => Promise<CloseAllTabsResult>;
}

/**
 * @internal
 */
export const ManageMetrics = forwardRef<IManageMetricsApi | undefined, IManageMetricsProps>(
    function ManageMetrics(
        {
            permissions,
            locale,
            prefixes,
            setMinimized,
            setMaximized,
            isWhiteLabeled,
            separators,
            maximized,
            useReferences,
            currencyFormatOverride,
            enableMetricFormatOverrides,
        },
        ref,
    ) {
        const contextProps = useContext(MultipleMetricsContext);
        const {
            tabsProps,
            onMetricsChange,
            onDelete,
            unsavedChangesDialog,
            closeUnsavedChangesDialog,
            cancelUnsavedChangesDialog,
            saveUnsavedChangesDialog,
            closeAllTabs,
            changeIdDialog,
            cancelChangeId,
            saveChangeId,
            closeChangeId,
        } = contextProps;

        const [deleteMetric, setDeletingMetric] = useState<IMeasureDef | null>(null);

        const editMetricApi = useRef<IEditMetricApi | undefined>(undefined);

        useApi<IManageMetricsApi | undefined>(
            ref,
            {
                saveAndCloseAll: closeAllTabs,
            },
            [editMetricApi, closeAllTabs, tabsProps],
        );

        return (
            <IntlWrapper locale={locale}>
                <MetricsContextProvider mode={MetricContextMode.Multiple}>
                    <MetricsState
                        {...contextProps}
                        prefixes={prefixes}
                        permissions={permissions}
                        maximized={maximized}
                        isWhiteLabeled={isWhiteLabeled}
                        separators={separators}
                        setMinimized={setMinimized}
                        setMaximized={setMaximized}
                        onDelete={(metric) => setDeletingMetric(metric)}
                        useReferences={useReferences}
                        currencyFormatOverride={currencyFormatOverride}
                        enableMetricFormatOverrides={enableMetricFormatOverrides}
                    />
                    {deleteMetric && (
                        <DeleteMetric
                            locale={locale}
                            metric={deleteMetric}
                            onDelete={(metric, refs, err) => {
                                setDeletingMetric(null);
                                if (onDelete) {
                                    onDelete(metric, refs, err);
                                }
                            }}
                            onClose={() => {
                                setDeletingMetric(null);
                            }}
                            onMetricsChange={onMetricsChange}
                        />
                    )}
                    {unsavedChangesDialog.showDialog && (
                        <UnsavedChangesConfirmDialog
                            metrics={unsavedChangesDialog.tabs.map((tab) => ({
                                metric: tab.data.current,
                                changed: Boolean(tab.states?.[TabState.Dirty]),
                            }))}
                            onClose={closeUnsavedChangesDialog}
                            onCancel={cancelUnsavedChangesDialog}
                            onSubmit={saveUnsavedChangesDialog}
                        />
                    )}
                    {changeIdDialog.visible && (
                        <IdChangeConfirmDialog
                            mode={changeIdDialog.saveMode}
                            metricId={changeIdDialog.oldId}
                            newMetricId={changeIdDialog.newId}
                            metricIdChanged={changeIdDialog.idChanged}
                            conflicts={changeIdDialog.conflicts}
                            onClose={() => closeChangeId()}
                            onCancel={() => cancelChangeId()}
                            onSubmit={() => saveChangeId()}
                        />
                    )}
                </MetricsContextProvider>
            </IntlWrapper>
        );
    },
);
