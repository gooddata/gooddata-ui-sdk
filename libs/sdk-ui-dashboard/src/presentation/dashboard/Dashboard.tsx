// (C) 2021 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import {
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
} from "@gooddata/sdk-backend-spi";
import { ToastMessageContextProvider, ToastMessages, useToastMessage } from "@gooddata/sdk-ui-kit";
import { ErrorComponent as DefaultError, LoadingComponent as DefaultLoading } from "@gooddata/sdk-ui";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";
import { useIntl } from "react-intl";

import {
    DashboardComponentsProvider,
    DashboardConfigProvider,
    useDashboardComponentsContext,
} from "../dashboardContexts";
import {
    DefaultDashboardAttributeFilterInner,
    DefaultDashboardDateFilterInner,
    CustomDashboardAttributeFilterComponent,
    DefaultFilterBarInner,
    FilterBarPropsProvider,
    FilterBar,
} from "../filterBar";
import {
    DefaultDashboardInsightWithDrillDialogInner,
    DefaultDashboardKpiInner,
    DefaultDashboardWidgetInner,
} from "../widget";
import { DashboardLayout, DashboardLayoutPropsProvider, DefaultDashboardLayoutInner } from "../layout";
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
} from "../../model";
import {
    DefaultScheduledEmailDialogInner,
    ScheduledEmailDialog,
    ScheduledEmailDialogPropsProvider,
} from "../scheduledEmail";
import {
    DefaultButtonBarInner,
    DefaultTitleInner,
    DefaultMenuButtonInner,
    DefaultTopBarInner,
    TopBarPropsProvider,
    TopBar,
    IMenuButtonItem,
} from "../topBar";

import { useDashboardPdfExporter } from "./hooks/useDashboardPdfExporter";
import { defaultDashboardThemeModifier } from "./defaultDashboardThemeModifier";
import { IDashboardProps } from "./types";

const useFilterBar = (): {
    filters: FilterContextItem[];
    onAttributeFilterChanged: (filter: IDashboardAttributeFilter) => void;
    onDateFilterChanged: (filter: IDashboardDateFilter | undefined, dateFilterOptionLocalId?: string) => void;
} => {
    const filters = useDashboardSelector(selectFilterContextFilters);
    const dispatch = useDashboardDispatch();
    const onAttributeFilterChanged = useCallback(
        (filter: IDashboardAttributeFilter) => {
            const { attributeElements, negativeSelection, localIdentifier } = filter.attributeFilter;
            dispatch(
                changeAttributeFilterSelection(
                    localIdentifier!,
                    attributeElements,
                    negativeSelection ? "NOT_IN" : "IN",
                ),
            );
        },
        [dispatch],
    );

    const onDateFilterChanged = useCallback(
        (filter: IDashboardDateFilter | undefined, dateFilterOptionLocalId?: string) => {
            if (!filter) {
                // all time filter
                dispatch(clearDateFilterSelection());
            } else {
                const { type, granularity, from, to } = filter.dateFilter;
                dispatch(changeDateFilterSelection(type, granularity, from, to, dateFilterOptionLocalId));
            }
        },
        [dispatch],
    );

    return { filters, onAttributeFilterChanged, onDateFilterChanged };
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

// split the header parts of the dashboard so that changes to their state
// (e.g. opening email dialog) do not re-render the dashboard body
const DashboardHeader = (props: IDashboardProps): JSX.Element => {
    const { dashboardRef, backend, workspace } = props;
    const intl = useIntl();

    const { filters, onAttributeFilterChanged, onDateFilterChanged } = useFilterBar();
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

    const defaultOnScheduleEmailing = useCallback(() => {
        setIsScheduleEmailingDialogOpen(true);
    }, []);

    const defaultOnExportToPdf = useCallback(() => {
        exportDashboard(dashboardRef, filters);
    }, [exportDashboard, dashboardRef, filters]);

    const defaultMenuItems = useMemo<IMenuButtonItem[]>(
        () => [
            {
                itemId: "export-to-pdf",
                itemName: intl.formatMessage({ id: "options.menu.export.PDF" }),
                onClick: defaultOnExportToPdf,
            },
            {
                itemId: "schedule-emailing",
                itemName: intl.formatMessage({ id: "options.menu.schedule.email" }),
                onClick: defaultOnScheduleEmailing,
            },
        ],
        [defaultOnScheduleEmailing, defaultOnExportToPdf],
    );

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
                    <ScheduledEmailDialog />
                </ScheduledEmailDialogPropsProvider>
            )}

            <TopBarPropsProvider
                menuButtonProps={{ menuItems: defaultMenuItems }}
                titleProps={{ title, onTitleChanged }}
            >
                <TopBar />
            </TopBarPropsProvider>

            <FilterBarPropsProvider
                filters={filters}
                onAttributeFilterChanged={onAttributeFilterChanged}
                onDateFilterChanged={onDateFilterChanged}
            >
                <FilterBar />
            </FilterBarPropsProvider>
        </>
    );
};

const DashboardInner: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const locale = useDashboardSelector(selectLocale);

    return (
        <IntlWrapper locale={locale}>
            <div className="gd-dashboards-root">
                <div className="dash-header-wrapper">
                    <DashboardHeader {...props} />
                </div>
                <div className="gd-flex-item-stretch dash-section dash-section-kpis">
                    <div className="gd-flex-container root-flex-maincontent">
                        <DashboardLayoutPropsProvider drillableItems={props.drillableItems}>
                            <DashboardLayout />
                        </DashboardLayoutPropsProvider>
                    </div>
                </div>
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
    const attributeFilterFactory = useCallback(
        (filter: IDashboardAttributeFilter): CustomDashboardAttributeFilterComponent => {
            const userSpecified = props.DashboardAttributeFilterComponentFactory?.(filter);
            return userSpecified ?? DefaultDashboardAttributeFilterInner;
        },
        [props.DashboardAttributeFilterComponentFactory],
    );

    return (
        <DashboardStoreProvider
            dashboardRef={props.dashboardRef}
            backend={props.backend}
            workspace={props.workspace}
            eventHandlers={props.eventHandlers}
            config={props.config}
            permissions={props.permissions}
        >
            <ToastMessageContextProvider>
                <ThemeProvider
                    theme={props.theme}
                    modifier={props.themeModifier ?? defaultDashboardThemeModifier}
                >
                    <DashboardComponentsProvider
                        ErrorComponent={props.ErrorComponent ?? DefaultError}
                        LoadingComponent={props.LoadingComponent ?? DefaultLoading}
                        LayoutComponent={props.LayoutComponent ?? DefaultDashboardLayoutInner}
                        InsightComponent={
                            props.InsightComponent ?? DefaultDashboardInsightWithDrillDialogInner
                        }
                        KpiComponent={props.KpiComponent ?? DefaultDashboardKpiInner}
                        WidgetComponent={props.WidgetComponent ?? DefaultDashboardWidgetInner}
                        ButtonBarComponent={props.ButtonBarComponent ?? DefaultButtonBarInner}
                        MenuButtonComponent={props.MenuButtonComponent ?? DefaultMenuButtonInner}
                        TopBarComponent={props.TopBarComponent ?? DefaultTopBarInner}
                        TitleComponent={props.TitleComponent ?? DefaultTitleInner}
                        ScheduledEmailDialogComponent={
                            props.ScheduledEmailDialogComponent ?? DefaultScheduledEmailDialogInner
                        }
                        DashboardAttributeFilterComponentFactory={attributeFilterFactory}
                        DashboardDateFilterComponent={
                            props.DashboardDateFilterComponent ?? DefaultDashboardDateFilterInner
                        }
                        FilterBarComponent={props.FilterBarComponent ?? DefaultFilterBarInner}
                    >
                        <DashboardConfigProvider menuButtonConfig={props.menuButtonConfig}>
                            <DashboardLoading {...props} />
                        </DashboardConfigProvider>
                    </DashboardComponentsProvider>
                </ThemeProvider>
            </ToastMessageContextProvider>
        </DashboardStoreProvider>
    );
};
