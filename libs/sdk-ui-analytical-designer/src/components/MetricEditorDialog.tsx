// (C) 2007-2026 GoodData Corporation

import { useCallback, useEffect, useRef, useState } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import {
    type IInsight,
    type IMeasureMetadataObject,
    isInsight,
    isMeasureMetadataObject,
    isMeasureMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import { DialogBase } from "@gooddata/sdk-ui-kit";
import {
    ConflictContextProvider,
    type IDeleteMetricInfo,
    type IManageMetricsApi,
    type IMetricInfo,
    type IMetricInfoDraft,
    type ISaveMetricInfo,
    ManageMetrics,
    MetricService,
    MinimizeMetrics,
    MultipleMetricsState,
} from "@gooddata/sdk-ui-metric-component";

import { openReport } from "../actions/open_actions.js";
import { clearCache } from "../backend.js";
import { getProjectId, getSeparators, isBranded } from "../selectors/bootstrap_selector.js";
import {
    enableMetricFormatOverrides,
    enableMetricPermissions,
    getCurrencyFormatOverride,
    getDefaultMetricVisibility,
} from "../selectors/feature_flag_selector.js";
import { getInsightForSaveViaMd } from "../selectors/insight_selectors.js";
import { effectiveWorkspacePermissions } from "../selectors/metric_permissions_selector.js";
import {
    type TFormMode,
    metricEditorCancelUnsavedChangesDialog,
    metricEditorCloseTabs,
    metricEditorFocusTab,
    metricEditorMaximize,
    metricEditorMetricDeleteError,
    metricEditorMetricDeleted,
    metricEditorMetricSaveError,
    metricEditorMetricSaved,
    metricEditorMinimize,
    metricEditorOpen,
    metricEditorOpenFromDialog,
    metricEditorOpenNew,
    metricEditorUnsavedChanges,
} from "../store/metric_editor/metric_editor_actions.js";
import {
    getMetricEditorActiveIndex,
    getMetricEditorIsMinimized,
    getMetricEditorOpenedMetrics,
    getSaveAllRequestNumber,
} from "../store/metric_editor/metric_editor_selector.js";
import { type AppDispatch } from "../store/types.js";
import { checkMetricOverrides } from "../utils/api.js";
import { usePrefixes } from "../utils/hooks/usePrefixes.js";

export function MetricEditorDialog() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();

    const metrics = useSelector(getMetricEditorOpenedMetrics);
    const activeIndex = useSelector(getMetricEditorActiveIndex);
    const isMinimized = useSelector(getMetricEditorIsMinimized);
    const saveAllRequestNumber = useSelector(getSaveAllRequestNumber);
    const permissions = useSelector(effectiveWorkspacePermissions);
    const activeInsight = useSelector(getInsightForSaveViaMd);
    const isWhiteLabeled = useSelector(isBranded);
    const separators = useSelector(getSeparators);
    const workspaceId = useSelector(getProjectId);
    const currencyFormatOverride = useSelector(getCurrencyFormatOverride);
    const isMetricFormatOverridesEnabled = useSelector(enableMetricFormatOverrides);
    const areMetricPermissionsEnabled = useSelector(enableMetricPermissions);
    const defaultMetricVisibility = useSelector(getDefaultMetricVisibility);

    const createTab = useCallback(() => {
        dispatch(metricEditorOpenNew("OPEN_NEW_TAB"));
    }, [dispatch]);

    const openTabFromDialog = useCallback(
        (metricInfo: IMetricInfoDraft) => {
            dispatch(metricEditorOpenFromDialog(metricInfo));
        },
        [dispatch],
    );

    const activateTab = useCallback(
        (metricInfo: IMetricInfo) => {
            dispatch(metricEditorFocusTab(metricInfo.identifier));
        },
        [dispatch],
    );

    const minimize = useCallback(() => {
        dispatch(metricEditorMinimize());
    }, [dispatch]);

    const maximize = useCallback(() => {
        dispatch(metricEditorMaximize());
    }, [dispatch]);

    const onClose = useCallback(
        (metricInfos: IMetricInfo[]) => {
            dispatch(metricEditorCloseTabs(metricInfos.map((info) => info.identifier)));
        },
        [dispatch],
    );

    const onDirtyChanged = useCallback(
        (isUnsaved: boolean) => {
            dispatch(metricEditorUnsavedChanges(isUnsaved));
        },
        [dispatch],
    );

    const onMetricDeleted = useCallback(
        (metric: IMeasureMetadataObject) => {
            dispatch(metricEditorMetricDeleted(metric));
        },
        [dispatch],
    );

    const onMetricDeletedError = useCallback(
        (metric: IMeasureMetadataObject, error: Error) => {
            dispatch(metricEditorMetricDeleteError(metric, error));
        },
        [dispatch],
    );

    const onMetricSave = useCallback(
        (metric: IMeasureMetadataObject, info: ISaveMetricInfo, mode: TFormMode) => {
            dispatch(metricEditorMetricSaved(metric, info, mode));
        },
        [dispatch],
    );

    const onMetricSaveError = useCallback(
        (metric: IMeasureMetadataObject, error: Error) => {
            dispatch(metricEditorMetricSaveError(metric, error));
        },
        [dispatch],
    );

    const onMetricClick = useCallback(
        (metric: IMeasureMetadataObject) => {
            dispatch(metricEditorOpen(metric.ref));
        },
        [dispatch],
    );

    const onInsightClick = useCallback(
        (insight: IInsight) => {
            const action = openReport(insight.insight, false);
            dispatch(action);
        },
        [dispatch],
    );

    const onCancelUnsavedChangesDialog = useCallback(() => {
        dispatch(metricEditorUnsavedChanges(false));
        dispatch(metricEditorCancelUnsavedChangesDialog());
    }, [dispatch]);

    const serviceProps = {
        settings: { enableMetricPermissions: areMetricPermissionsEnabled, defaultMetricVisibility },
    };
    const manageMetricsRef = useRef<IManageMetricsApi>(undefined);
    const [initSaveAllRequestNumber] = useState(saveAllRequestNumber);
    const prefixes = usePrefixes(metrics);

    useEffect(() => {
        if (initSaveAllRequestNumber === saveAllRequestNumber) {
            return;
        }

        void manageMetricsRef.current?.saveAndCloseAll().then(({ status }) => {
            if ((status as string) === "canceled") {
                onCancelUnsavedChangesDialog();
            }
        });
    }, [initSaveAllRequestNumber, onCancelUnsavedChangesDialog, saveAllRequestNumber]);

    const handleMetricDeleted = useCallback(
        (metric: IMeasureMetadataObject, _: IDeleteMetricInfo, err: Error | null) => {
            if (err) {
                return onMetricDeletedError(metric, err);
            }

            return onMetricDeleted(metric);
        },
        [onMetricDeleted, onMetricDeletedError],
    );

    const handleMetricSave = useCallback(
        (metric: IMeasureMetadataObject, info: ISaveMetricInfo, err: Error | null) => {
            const mode = isMeasureMetadataObjectDefinition(info.previousMetric) ? "new" : "edit";
            if (err) {
                return onMetricSaveError(metric, err);
            } else {
                return onMetricSave(metric, info, mode);
            }
        },
        [onMetricSave, onMetricSaveError],
    );

    if (metrics.length > 0 && prefixes !== null) {
        return (
            <ConflictContextProvider checker={(data) => checkMetricOverrides(workspaceId, data)}>
                <MetricService {...serviceProps}>
                    <MultipleMetricsState
                        metrics={metrics}
                        active={activeIndex}
                        permissions={permissions}
                        onMetricsChange={() => {
                            clearCache();
                        }}
                        onSave={handleMetricSave}
                        onDelete={handleMetricDeleted}
                        onDirtyChanged={onDirtyChanged}
                        metricOpenType="internal"
                        onMetricClick={(metric) => isMeasureMetadataObject(metric) && onMetricClick(metric)}
                        activeInsight={activeInsight}
                        insightOpenType="internal"
                        onInsightClick={(object) => isInsight(object) && onInsightClick(object)}
                        onCancel={(tabId) => onClose([tabId])}
                        onClose={onClose}
                        createTab={createTab}
                        openTab={(metricInfo) => openTabFromDialog(metricInfo)}
                        activateTab={activateTab}
                    >
                        <DialogBase
                            className="editMetricDialog"
                            onMouseUp={() => {}}
                            submitOnEnterKey={false}
                        >
                            {isMinimized ? (
                                <MinimizeMetrics locale={intl.locale} setMinimized={maximize} />
                            ) : (
                                <ManageMetrics
                                    ref={manageMetricsRef}
                                    locale={intl.locale}
                                    permissions={permissions}
                                    prefixes={prefixes}
                                    setMinimized={minimize}
                                    setMaximized={() => {}}
                                    isWhiteLabeled={isWhiteLabeled}
                                    separators={separators}
                                    useReferences
                                    currencyFormatOverride={currencyFormatOverride}
                                    enableMetricFormatOverrides={isMetricFormatOverridesEnabled}
                                />
                            )}
                        </DialogBase>
                    </MultipleMetricsState>
                </MetricService>
            </ConflictContextProvider>
        );
    }

    return null;
}
