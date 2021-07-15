// (C) 2021 GoodData Corporation
import React, { useCallback, useState } from "react";
import invariant from "ts-invariant";
import {
    FilterContextItem,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-backend-spi";
import { ToastMessageContextProvider, ToastMessages, useToastMessage } from "@gooddata/sdk-ui-kit";
import { ErrorComponent as DefaultError, LoadingComponent as DefaultLoading } from "@gooddata/sdk-ui";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";

import { DashboardComponentsProvider, useDashboardComponentsContext } from "../dashboardContexts";
import { DefaultFilterBar } from "../filterBar";
import {
    DefaultDashboardInsightWithDrillDialogInner,
    DefaultDashboardKpiInner,
    DefaultDashboardWidgetInner,
} from "../widget";
import { DashboardLayout, DefaultDashboardLayout } from "../layout";
import { IntlWrapper } from "../localization";
import {
    changeAttributeFilterSelection,
    changeDateFilterSelection,
    clearDateFilterSelection,
    renameDashboard,
    selectDashboardLoading,
    selectDashboardTitle,
    selectFilterContextFilters,
    selectLocale,
    useDashboardDispatch,
    useDashboardSelector,
    DashboardStoreProvider,
} from "../model";
import { DefaultScheduledEmailDialog, ScheduledEmailDialogPropsProvider } from "../scheduledEmail";
import { DefaultTopBar, IDefaultMenuButtonComponentCallbacks } from "../topBar";

import { useDashboardPdfExporter } from "./hooks/useDashboardPdfExporter";
import { defaultDashboardThemeModifier } from "./defaultDashboardThemeModifier";
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
        ScheduledEmailDialogComponent = DefaultScheduledEmailDialog,
        dashboardRef,
        backend,
        workspace,
    } = props;

    const FilterBarComponent = filterBarConfig?.Component ?? DefaultFilterBar;
    const TopBarComponent = topBarConfig?.Component ?? DefaultTopBar;
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

    const onScheduleEmailingError = useCallback(() => {
        setIsScheduleEmailingDialogOpen(false);
        addError({ id: "dialogs.schedule.email.submit.error" });
    }, []);

    const onScheduleEmailingSuccess = useCallback(() => {
        setIsScheduleEmailingDialogOpen(false);
        addSuccess({ id: "dialogs.schedule.email.submit.success" });
    }, []);

    const onScheduleEmailingCancel = useCallback(() => {
        setIsScheduleEmailingDialogOpen(false);
    }, []);

    return (
        <>
            <ToastMessages />
            {isScheduleEmailingDialogOpen && (
                <ScheduledEmailDialogPropsProvider
                    isVisible={isScheduleEmailingDialogOpen}
                    onCancel={onScheduleEmailingCancel}
                    onError={onScheduleEmailingError}
                    onSuccess={onScheduleEmailingSuccess}
                >
                    <ScheduledEmailDialogComponent />
                </ScheduledEmailDialogPropsProvider>
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
    const { loading, error, result } = useDashboardSelector(selectDashboardLoading);
    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext();

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
    return (
        <DashboardStoreProvider
            dashboardRef={props.dashboardRef}
            backend={props.backend}
            workspace={props.workspace}
            eventHandlers={props.eventHandlers}
        >
            <ToastMessageContextProvider>
                <ThemeProvider
                    theme={props.theme}
                    modifier={props.themeModifier ?? defaultDashboardThemeModifier}
                >
                    <DashboardComponentsProvider
                        ErrorComponent={props.ErrorComponent ?? DefaultError}
                        LoadingComponent={props.LoadingComponent ?? DefaultLoading}
                        LayoutComponent={props.dashboardLayoutConfig?.Component ?? DefaultDashboardLayout}
                        InsightComponent={
                            props.InsightComponent ?? DefaultDashboardInsightWithDrillDialogInner
                        }
                        KpiComponent={props.KpiComponent ?? DefaultDashboardKpiInner}
                        WidgetComponent={props.WidgetComponent ?? DefaultDashboardWidgetInner}
                    >
                        <DashboardLoading {...props} />
                    </DashboardComponentsProvider>
                </ThemeProvider>
            </ToastMessageContextProvider>
        </DashboardStoreProvider>
    );
};
