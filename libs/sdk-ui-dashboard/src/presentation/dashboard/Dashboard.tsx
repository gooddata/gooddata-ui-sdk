// (C) 2021 GoodData Corporation
import React, { useCallback, useMemo, useRef } from "react";
import {
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isProtectedDataError,
} from "@gooddata/sdk-backend-spi";
import { ToastMessageContextProvider, ToastMessages, useToastMessage } from "@gooddata/sdk-ui-kit";
import { ErrorComponent as DefaultError, LoadingComponent as DefaultLoading } from "@gooddata/sdk-ui";
import { ThemeProvider, useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import { useIntl } from "react-intl";

import {
    DashboardComponentsProvider,
    DashboardConfigProvider,
    ExportDialogContextProvider,
    useDashboardComponentsContext,
} from "../dashboardContexts";
import {
    CustomDashboardAttributeFilterComponent,
    DefaultDashboardAttributeFilterInner,
    DefaultDashboardDateFilterInner,
    DefaultFilterBarInner,
    FilterBar,
    FilterBarPropsProvider,
} from "../filterBar";
import {
    DefaultDashboardInsightInner,
    DefaultDashboardKpiInner,
    DefaultDashboardWidgetInner,
} from "../widget";
import { DashboardLayout, DashboardLayoutPropsProvider, DefaultDashboardLayoutInner } from "../layout";
import { IntlWrapper } from "../localization";
import {
    changeAttributeFilterSelection,
    changeDateFilterSelection,
    changeFilterContextSelection,
    clearDateFilterSelection,
    DashboardStoreProvider,
    exportDashboardToPdf,
    renameDashboard,
    selectDashboardLoading,
    selectDashboardTitle,
    selectFilterContextFilters,
    selectIsLayoutEmpty,
    selectIsSaveAsDialogOpen,
    selectIsScheduleEmailDialogOpen,
    selectLocale,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardSelector,
    useDispatchDashboardCommand,
} from "../../model";
import {
    DefaultScheduledEmailDialogInner,
    ScheduledEmailDialog,
    ScheduledEmailDialogPropsProvider,
} from "../scheduledEmail";
import {
    DefaultButtonBarInner,
    DefaultMenuButtonInner,
    DefaultTitleInner,
    DefaultTopBarInner,
    IMenuButtonItem,
    TopBar,
    TopBarPropsProvider,
} from "../topBar";

import { defaultDashboardThemeModifier } from "./defaultDashboardThemeModifier";
import { IDashboardProps } from "./types";
import { ExportDialogProvider } from "../dialogs";
import { downloadFile } from "../../_staging/fileUtils/downloadFile";
import { DefaultSaveAsDialogInner, SaveAsDialog, SaveAsDialogPropsProvider } from "../saveAs";

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
    const { dashboardRef } = props;
    const intl = useIntl();
    const isEmptyLayout = useDashboardSelector(selectIsLayoutEmpty);
    const { filters, onAttributeFilterChanged, onDateFilterChanged } = useFilterBar();
    const { title, onTitleChanged } = useTopBar();
    const { addSuccess, addError, addProgress, removeMessage } = useToastMessage();

    const dispatch = useDashboardDispatch();
    const isScheduleEmailingDialogOpen = useDashboardSelector(selectIsScheduleEmailDialogOpen);
    const openScheduleEmailingDialog = () => dispatch(uiActions.openScheduleEmailDialog());
    const closeScheduleEmailingDialog = () => dispatch(uiActions.closeScheduleEmailDialog());
    const isSaveAsDialogOpen = useDashboardSelector(selectIsSaveAsDialogOpen);
    const openSaveAsDialog = () => dispatch(uiActions.openSaveAsDialog());
    const closeSaveAsDialog = () => dispatch(uiActions.closeSaveAsDialog());

    const lastExportMessageId = useRef("");
    const { run: exportDashboard } = useDashboardCommandProcessing({
        commandCreator: exportDashboardToPdf,
        successEvent: "GDC.DASH/EVT.EXPORT.PDF.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            lastExportMessageId.current = addProgress(
                { id: "messages.exportResultStart" },
                // make sure the message stays there until removed by either success or error
                { duration: 0 },
            );
        },
        onSuccess: (e) => {
            if (lastExportMessageId.current) {
                removeMessage(lastExportMessageId.current);
            }
            addSuccess({ id: "messages.exportResultSuccess" });
            downloadFile(e.payload.resultUri);
        },
        onError: (err) => {
            if (lastExportMessageId.current) {
                removeMessage(lastExportMessageId.current);
            }

            if (isProtectedDataError(err)) {
                addError({ id: "messages.exportResultRestrictedError" });
            } else {
                addError({ id: "messages.exportResultError" });
            }
        },
    });

    /*
     * exports and scheduling are not available when rendering a dashboard that is not persisted.
     * this can happen when a new dashboard is created and is being edited.
     *
     * the setup of menu items available in the menu needs to reflect this.
     */
    const defaultOnScheduleEmailing = useCallback(() => {
        if (!dashboardRef) {
            return;
        }

        openScheduleEmailingDialog();
    }, [dashboardRef]);

    const defaultOnSaveAs = useCallback(() => {
        if (!dashboardRef) {
            return;
        }

        openSaveAsDialog();
    }, [dashboardRef]);

    const defaultOnExportToPdf = useCallback(() => {
        if (!dashboardRef) {
            return;
        }

        exportDashboard();
    }, [exportDashboard, dashboardRef]);

    const defaultMenuItems = useMemo<IMenuButtonItem[]>(() => {
        if (!dashboardRef) {
            return [];
        }

        const isSaveAsDisabled = isEmptyLayout || !dashboardRef;

        return [
            {
                type: "button",
                itemId: "save_as_menu_item", // careful, also a s- class selector, do not change
                disabled: isSaveAsDisabled,
                itemName: intl.formatMessage({ id: "options.menu.save.as" }),
                tooltip: isSaveAsDisabled
                    ? intl.formatMessage({ id: "options.menu.save.as.tooltip" })
                    : undefined,
                onClick: defaultOnSaveAs,
            },
            {
                type: "button",
                itemId: "pdf-export-item", // careful, this is also used as a selector in tests, do not change
                itemName: intl.formatMessage({ id: "options.menu.export.PDF" }),
                onClick: defaultOnExportToPdf,
            },
            {
                type: "button",
                itemId: "schedule-email-item", // careful, this is also used as a selector in tests, do not change
                itemName: intl.formatMessage({ id: "options.menu.schedule.email" }),
                onClick: defaultOnScheduleEmailing,
            },
        ];
    }, [defaultOnScheduleEmailing, defaultOnExportToPdf, dashboardRef]);

    const onScheduleEmailingError = useCallback(() => {
        closeScheduleEmailingDialog();
        addError({ id: "dialogs.schedule.email.submit.error" });
    }, []);

    const onScheduleEmailingSuccess = useCallback(() => {
        closeScheduleEmailingDialog();
        addSuccess({ id: "dialogs.schedule.email.submit.success" });
    }, []);

    const onScheduleEmailingCancel = useCallback(() => {
        closeScheduleEmailingDialog();
    }, []);

    const onSaveAsError = useCallback(() => {
        closeSaveAsDialog();
        addError({ id: "messages.dashboardSaveFailed" });
    }, []);

    const onSaveAsSuccess = useCallback(() => {
        closeSaveAsDialog();
        addSuccess({ id: "messages.dashboardSaveSuccess" });
    }, []);

    const onSaveAsCancel = useCallback(() => {
        closeSaveAsDialog();
    }, []);

    return (
        <>
            <ToastMessages />
            <ExportDialogProvider />
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
            {isSaveAsDialogOpen && (
                <SaveAsDialogPropsProvider
                    isVisible={isSaveAsDialogOpen}
                    onCancel={onSaveAsCancel}
                    onError={onSaveAsError}
                    onSuccess={onSaveAsSuccess}
                >
                    <SaveAsDialog />
                </SaveAsDialogPropsProvider>
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

    const onFiltersChange = useDispatchDashboardCommand(changeFilterContextSelection);

    return (
        <IntlWrapper locale={locale}>
            <div className="gd-dashboards-root">
                <div className="gd-dash-header-wrapper">
                    <DashboardHeader {...props} />
                </div>
                <div className="gd-flex-item-stretch dash-section dash-section-kpis">
                    <div className="gd-flex-container root-flex-maincontent">
                        <DashboardLayoutPropsProvider onFiltersChange={onFiltersChange}>
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

    const isThemeLoading = useThemeIsLoading();
    const hasThemeProvider = isThemeLoading !== undefined;

    let dashboardRender = (
        <DashboardStoreProvider
            dashboardRef={props.dashboardRef}
            backend={props.backend}
            workspace={props.workspace}
            eventHandlers={props.eventHandlers}
            config={props.config}
            permissions={props.permissions}
        >
            <ToastMessageContextProvider>
                <ExportDialogContextProvider>
                    <DashboardComponentsProvider
                        ErrorComponent={props.ErrorComponent ?? DefaultError}
                        LoadingComponent={props.LoadingComponent ?? DefaultLoading}
                        LayoutComponent={props.LayoutComponent ?? DefaultDashboardLayoutInner}
                        InsightComponent={props.InsightComponent ?? DefaultDashboardInsightInner}
                        KpiComponent={props.KpiComponent ?? DefaultDashboardKpiInner}
                        WidgetComponent={props.WidgetComponent ?? DefaultDashboardWidgetInner}
                        ButtonBarComponent={props.ButtonBarComponent ?? DefaultButtonBarInner}
                        MenuButtonComponent={props.MenuButtonComponent ?? DefaultMenuButtonInner}
                        TopBarComponent={props.TopBarComponent ?? DefaultTopBarInner}
                        TitleComponent={props.TitleComponent ?? DefaultTitleInner}
                        ScheduledEmailDialogComponent={
                            props.ScheduledEmailDialogComponent ?? DefaultScheduledEmailDialogInner
                        }
                        SaveAsDialogComponent={props.SaveAsDialogComponent ?? DefaultSaveAsDialogInner}
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
                </ExportDialogContextProvider>
            </ToastMessageContextProvider>
        </DashboardStoreProvider>
    );

    if (props.theme || !hasThemeProvider) {
        dashboardRender = (
            <ThemeProvider
                theme={props.theme}
                modifier={props.themeModifier ?? defaultDashboardThemeModifier}
            >
                {dashboardRender}
            </ThemeProvider>
        );
    }

    return dashboardRender;
};
