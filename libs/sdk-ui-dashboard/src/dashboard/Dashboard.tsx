// (C) 2021 GoodData Corporation
import React, { useCallback, useEffect, useState } from "react";
import { Provider } from "react-redux";
import invariant from "ts-invariant";
import {
    FilterContextItem,
    IScheduledMail,
    IScheduledMailDefinition,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-backend-spi";
import { ToastMessageContextProvider, ToastMessages, useToastMessage } from "@gooddata/sdk-ui-kit";
import {
    ErrorComponent as DefaultError,
    GoodDataSdkError,
    LoadingComponent as DefaultLoading,
    useBackendStrict,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";

import {
    DashboardComponentsProvider,
    DashboardEventsProvider,
    useDashboardComponentsContext,
} from "../dashboardAux";
import { DefaultFilterBar } from "../filterBar";
import { DefaultDashboardInsightWithDrillDialog } from "../insight";
import { DefaultDashboardKpi } from "../kpi";
import { DashboardLayout, DefaultDashboardLayout, DefaultDashboardWidget } from "../layout";
import { IntlWrapper } from "../localization";
import {
    changeAttributeFilterSelection,
    changeDateFilterSelection,
    clearDateFilterSelection,
    InitialLoadCorrelationId,
    loadDashboard,
    renameDashboard,
    selectDashboardLoading,
    selectDashboardTitle,
    selectFilterContextFilters,
    selectLocale,
    useDashboardDispatch,
    useDashboardSelector,
} from "../model";
// we do not want to expose those publicly so reach "inside" the model module just here
import { createDashboardStore, ReactDashboardContext } from "../model/state/dashboardStore";
import { DefaultScheduledEmailDialog } from "../scheduledEmail";
import { DefaultTopBar, IDefaultMenuButtonComponentCallbacks } from "../topBar";

import { defaultDashboardThemeModifier } from "./defaultDashboardThemeModifier";
import { useDashboardPdfExporter } from "./useDashboardPdfExporter";
import { IDashboardProps } from "./types";

const useFilterBar = (): {
    filters: FilterContextItem[];
    onFilterChanged: (filter: FilterContextItem | undefined) => void;
} => {
    const filters = useDashboardSelector(selectFilterContextFilters);
    const dispatch = useDashboardDispatch();
    const onFilterChanged = useCallback(
        (filter: FilterContextItem | undefined) => {
            if (!filter) {
                // all time filter
                dispatch(clearDateFilterSelection());
            } else if (isDashboardDateFilter(filter)) {
                const { type, granularity, from, to } = filter.dateFilter;
                dispatch(changeDateFilterSelection(type, granularity, from, to));
            } else if (isDashboardAttributeFilter(filter)) {
                const { attributeElements, negativeSelection, localIdentifier } = filter.attributeFilter;
                dispatch(
                    changeAttributeFilterSelection(
                        localIdentifier!,
                        attributeElements,
                        negativeSelection ? "NOT_IN" : "IN",
                    ),
                );
            } else {
                invariant(false, "Unknown filter type");
            }
        },
        [dispatch],
    );

    return { filters, onFilterChanged };
};

const useTopBar = () => {
    const dispatch = useDashboardDispatch();
    const title = useDashboardSelector(selectDashboardTitle);

    const onTitleChanged = useCallback(
        (title: string) => {
            dispatch(renameDashboard(title));
        },
        [dispatch],
    );

    return {
        title,
        onTitleChanged,
    };
};
const DashboardInnerCore: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const {
        drillableItems,
        filterBarConfig,
        topBarConfig,
        scheduledEmailDialogConfig,
        dashboardRef,
        backend,
        workspace,
    } = props;

    const FilterBarComponent = filterBarConfig?.Component ?? DefaultFilterBar;
    const TopBarComponent = topBarConfig?.Component ?? DefaultTopBar;
    const ScheduledEmailDialogComponent =
        scheduledEmailDialogConfig?.Component ?? DefaultScheduledEmailDialog;
    const isDefaultScheduledEmailDialogUsed = !scheduledEmailDialogConfig?.Component;
    const { filters, onFilterChanged } = useFilterBar();
    const { title, onTitleChanged } = useTopBar();
    const { addSuccess, addError } = useToastMessage();

    const [isScheduleEmailingDialogOpen, setIsScheduleEmailingDialogOpen] = useState(false);
    const { exportDashboard } = useDashboardPdfExporter({
        backend,
        workspace,
        onError: () => {
            addError({ id: "options.menu.export.PDF.error" });
        },
    });

    const defaultOnScheduleEmailing = () => {
        setIsScheduleEmailingDialogOpen(true);
    };

    const defaultOnExportToPdf = () => {
        exportDashboard(dashboardRef, filters);
    };

    const menuButtonCallbacks: IDefaultMenuButtonComponentCallbacks = {
        onScheduleEmailingCallback: defaultOnScheduleEmailing,
        onExportToPdfCallback: defaultOnExportToPdf,
    };

    function onScheduleEmailingError(error: GoodDataSdkError) {
        if (isDefaultScheduledEmailDialogUsed) {
            scheduledEmailDialogConfig?.defaultComponentCallbackProps?.onError?.(error);
        }

        setIsScheduleEmailingDialogOpen(false);
        addError({ id: "dialogs.schedule.email.submit.error" });
    }

    function onScheduleEmailingSuccess(scheduledMail: IScheduledMail) {
        if (isDefaultScheduledEmailDialogUsed) {
            scheduledEmailDialogConfig?.defaultComponentCallbackProps?.onSuccess?.(scheduledMail);
        }

        setIsScheduleEmailingDialogOpen(false);
        addSuccess({ id: "dialogs.schedule.email.submit.success" });
    }

    function onScheduleEmailingCancel() {
        if (isDefaultScheduledEmailDialogUsed) {
            scheduledEmailDialogConfig?.defaultComponentCallbackProps?.onCancel?.();
        }

        setIsScheduleEmailingDialogOpen(false);
    }

    function onScheduleEmailingSubmit(scheduledMail: IScheduledMailDefinition) {
        if (isDefaultScheduledEmailDialogUsed) {
            scheduledEmailDialogConfig?.defaultComponentCallbackProps?.onSubmit?.(scheduledMail);
        }
    }

    return (
        <>
            <ToastMessages />
            {isScheduleEmailingDialogOpen && (
                <ScheduledEmailDialogComponent
                    isVisible={isScheduleEmailingDialogOpen}
                    onCancel={onScheduleEmailingCancel}
                    onError={onScheduleEmailingError}
                    onSuccess={onScheduleEmailingSuccess}
                    onSubmit={onScheduleEmailingSubmit}
                />
            )}
            <TopBarComponent
                {...topBarConfig?.defaultComponentProps}
                titleProps={{ title, onTitleChanged }}
                menuButtonConfig={{
                    defaultComponentCallbackProps: menuButtonCallbacks,
                    ...topBarConfig?.defaultComponentProps?.menuButtonConfig,
                }}
            />
            <FilterBarComponent
                {...filterBarConfig?.defaultComponentProps}
                filters={filters}
                onFilterChanged={onFilterChanged}
            />
            <DashboardLayout drillableItems={drillableItems} />
        </>
    );
};

const DashboardInner: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const locale = useDashboardSelector(selectLocale);

    return (
        <IntlWrapper locale={locale}>
            <div className="gd-dashboards-root">
                <DashboardInnerCore {...props} />
            </div>
        </IntlWrapper>
    );
};

const DashboardLoading: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const dispatch = useDashboardDispatch();
    const { loading, error, result } = useDashboardSelector(selectDashboardLoading);
    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext();

    useEffect(() => {
        if (!loading && result === undefined) {
            dispatch(loadDashboard(props.config, props.permissions, InitialLoadCorrelationId));
        }
    }, [loading, result]);

    if (error) {
        return <ErrorComponent message={error.message} />;
    }

    if (loading || !result) {
        return <LoadingComponent />;
    }

    return <DashboardInner {...props} />;
};

/**
 * @internal
 */
export const Dashboard: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const backend = useBackendStrict(props.backend);
    const workspace = useWorkspaceStrict(props.workspace);
    const dashboardStore = createDashboardStore({
        sagaContext: {
            backend,
            workspace,
            dashboardRef: props.dashboardRef,
            clientId: props.clientId,
            dataProductId: props.dataProductId,
        },
        initialEventHandlers: props.eventHandlers,
    });

    return (
        <Provider store={dashboardStore.store} context={ReactDashboardContext}>
            <ToastMessageContextProvider>
                <ThemeProvider
                    theme={props.theme}
                    modifier={props.themeModifier ?? defaultDashboardThemeModifier}
                >
                    <DashboardEventsProvider
                        registerHandler={dashboardStore.registerEventHandler}
                        unregisterHandler={dashboardStore.unregisterEventHandler}
                    >
                        <DashboardComponentsProvider
                            ErrorComponent={props.ErrorComponent ?? DefaultError}
                            LoadingComponent={props.LoadingComponent ?? DefaultLoading}
                            LayoutComponent={props.dashboardLayoutConfig?.Component ?? DefaultDashboardLayout}
                            InsightComponent={
                                props.widgetConfig?.insight?.Component ??
                                DefaultDashboardInsightWithDrillDialog
                            }
                            KpiComponent={props.widgetConfig?.kpi?.Component ?? DefaultDashboardKpi}
                            WidgetComponent={props.widgetConfig?.Component ?? DefaultDashboardWidget}
                        >
                            <DashboardLoading {...props} />
                        </DashboardComponentsProvider>
                    </DashboardEventsProvider>
                </ThemeProvider>
            </ToastMessageContextProvider>
        </Provider>
    );
};
