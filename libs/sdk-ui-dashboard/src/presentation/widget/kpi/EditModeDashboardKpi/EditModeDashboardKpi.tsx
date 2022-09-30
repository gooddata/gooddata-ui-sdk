// (C) 2022 GoodData Corporation
import React, { useCallback, useEffect, useMemo } from "react";
import cx from "classnames";
import { useIntl } from "react-intl";
import noop from "lodash/noop";
import { widgetRef } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import {
    useDashboardSelector,
    useWidgetExecutionsHandler,
    selectEnableWidgetCustomHeight,
    selectSeparators,
    selectDisableKpiDashboardHeadlineUnderline,
    useDashboardDispatch,
    selectWidgetCoordinatesByRef,
    selectFilterContextFilters,
    uiActions,
    useWidgetSelection,
    selectIsDashboardSaving,
    changeKpiWidgetHeader,
    selectAllCatalogMeasuresMap,
} from "../../../../model";
import { DashboardItemKpi } from "../../../presentationComponents";
import { useDashboardComponentsContext } from "../../../dashboardContexts";

import { ConfigurationBubble } from "../../common";
import { getKpiResult, KpiRenderer, useKpiData, useKpiExecutionDataView } from "../common";
import { IDashboardKpiProps } from "../types";
import { useOptimisticMeasureUpdate } from "./useOptimisticMeasureUpdate";
import { EditableKpiHeadline } from "./EditModeKpiHeadline";

export const EditModeDashboardKpi = (props: IDashboardKpiProps) => {
    const {
        kpiWidget,

        backend: customBackend,
        workspace: customWorkspace,

        ErrorComponent: CustomErrorComponent,
        LoadingComponent: CustomLoadingComponent,

        onError,
    } = props;

    const intl = useIntl();
    const { ErrorComponent, LoadingComponent, KpiWidgetComponentSet } = useDashboardComponentsContext({
        ErrorComponent: CustomErrorComponent,
        LoadingComponent: CustomLoadingComponent,
    });

    const KpiConfigurationComponent = KpiWidgetComponentSet.configuration.WidgetConfigPanelComponent;

    const { isChangingMeasure, titleToShow } = useOptimisticMeasureUpdate(kpiWidget);

    const backend = useBackendStrict(customBackend);
    const workspace = useWorkspaceStrict(customWorkspace);

    const dashboardFilters = useDashboardSelector(selectFilterContextFilters);

    const {
        error: kpiDataError,
        result: kpiDataResult,
        status: kpiDataStatus,
    } = useKpiData({ kpiWidget, dashboardFilters });

    const { primaryMeasure, secondaryMeasure, effectiveFilters } = kpiDataResult ?? {};

    const enableCompactSize = useDashboardSelector(selectEnableWidgetCustomHeight);
    const separators = useDashboardSelector(selectSeparators);
    const disableDrillUnderline = useDashboardSelector(selectDisableKpiDashboardHeadlineUnderline);
    const isDrillable = kpiWidget.drills.length > 0;
    const isSaving = useDashboardSelector(selectIsDashboardSaving);
    const isEditable = !isSaving;

    const dispatch = useDashboardDispatch();
    const coordinates = useDashboardSelector(selectWidgetCoordinatesByRef(widgetRef(kpiWidget)));
    const onWidgetDelete = useCallback(() => {
        dispatch(uiActions.openKpiDeleteDialog(coordinates));
    }, [dispatch, coordinates]);

    const measures = useDashboardSelector(selectAllCatalogMeasuresMap);
    const currentMeasure = measures.get(kpiWidget.kpi.metric);

    const onWidgetTitleChanged = useCallback(
        (newTitle: string) => {
            if (newTitle) {
                dispatch(changeKpiWidgetHeader(kpiWidget.ref, { title: newTitle }));
            } else if (currentMeasure) {
                dispatch(changeKpiWidgetHeader(kpiWidget.ref, { title: currentMeasure.measure.title }));
            }
        },
        [currentMeasure, dispatch, kpiWidget.ref],
    );

    const { error, result, status } = useKpiExecutionDataView({
        backend,
        workspace,
        primaryMeasure,
        secondaryMeasure,
        effectiveFilters,
        shouldLoad: kpiDataStatus === "success",
    });

    const isLoading =
        isChangingMeasure ||
        status === "loading" ||
        status === "pending" ||
        kpiDataStatus === "loading" ||
        kpiDataStatus === "pending";

    const executionsHandler = useWidgetExecutionsHandler(widgetRef(kpiWidget));
    const { isSelectable, isSelected, onSelected, hasConfigPanelOpen } = useWidgetSelection(
        widgetRef(kpiWidget),
    );

    const renderBeforeContent = useMemo(() => {
        const hasConfigComponent = !!KpiConfigurationComponent;
        const shouldHaveConfigRendered = isSelected && hasConfigPanelOpen;

        if (!hasConfigComponent || !shouldHaveConfigRendered) {
            return undefined;
        }

        return function KpiConfiguration() {
            return (
                <ConfigurationBubble>
                    <KpiConfigurationComponent widget={kpiWidget} />
                </ConfigurationBubble>
            );
        };
    }, [KpiConfigurationComponent, hasConfigPanelOpen, isSelected, kpiWidget]);

    useEffect(() => {
        if (error) {
            onError?.(error);
            executionsHandler.onError(error);
        }
    }, [error, executionsHandler, onError]);

    return (
        <DashboardItemKpi
            visualizationClassName={cx("s-dashboard-kpi-component", "widget-loaded", "visualization", {
                "kpi-with-pop": kpiWidget.kpi.comparisonType !== "none",
                "content-loading": isLoading,
                "content-loaded": !isLoading,
                "is-editable": isEditable,
            })}
            contentClassName={cx({ "is-editable": isEditable })}
            renderBeforeContent={renderBeforeContent}
            renderAfterContent={() => {
                if (isSelected) {
                    return (
                        <div
                            className="dash-item-action dash-item-action-delete gd-icon-trash"
                            onClick={onWidgetDelete}
                        />
                    );
                }
                return null;
            }}
            renderHeadline={(clientHeight) => (
                <EditableKpiHeadline
                    title={titleToShow}
                    clientHeight={clientHeight}
                    onTitleChange={onWidgetTitleChanged}
                />
            )}
            isSelectable={isSelectable}
            isSelected={isSelected}
            onSelected={onSelected}
        >
            {() => {
                if (kpiDataStatus === "loading" || kpiDataStatus === "pending") {
                    return <LoadingComponent />;
                }

                if (kpiDataStatus === "error") {
                    return <ErrorComponent message={kpiDataError!.message} />;
                }

                return (
                    <KpiRenderer
                        kpi={kpiWidget}
                        kpiResult={getKpiResult(result, primaryMeasure!, secondaryMeasure, separators)}
                        filters={kpiDataResult?.effectiveFilters ?? []}
                        separators={separators}
                        enableCompactSize={enableCompactSize}
                        error={error}
                        errorHelp={intl.formatMessage({ id: "kpi.error.view" })}
                        isLoading={isLoading}
                        // need to pass something so that the underline is shown...
                        onDrill={noop}
                        isDrillable={isDrillable}
                        disableDrillUnderline={disableDrillUnderline}
                    />
                );
            }}
        </DashboardItemKpi>
    );
};
