// (C) 2021-2026 GoodData Corporation

import { type ReactElement } from "react";

import { AlertingDialogProvider } from "./AlertingDialogProvider.js";
import { DashboardTabs, useDashboardTabsProps } from "./DashboardTabs.js";
import { ScheduledEmailDialogProvider } from "./ScheduledEmailDialogProvider.js";
import { SettingsDialogProvider } from "./SettingsDialogProvider.js";
import { ShareDialogDashboardHeader } from "./ShareDialogDashboardHeader.js";
import { CancelEditDialog } from "../../cancelEditDialog/CancelEditDialog.js";
import { useCancelEditDialog } from "../../cancelEditDialog/DefaultCancelEditDialog.js";
import { useDeleteDialogProps } from "../../deleteDialog/DefaultDeleteDialog.js";
import { DeleteDialog } from "../../deleteDialog/DeleteDialog.js";
import { ExportTabularPdfDialogProvider } from "../../dialogs/ExportTabularPdfDialogProvider.js";
import { ExportXlsxDialogProvider } from "../../dialogs/ExportXlsxDialogProvider.js";
import { useFilterBarProps } from "../../filterBar/filterBar/DefaultFilterBar.js";
import { FilterBar } from "../../filterBar/filterBar/FilterBar.js";
import { useKpiDeleteDialogProps } from "../../kpiDeleteDialog/DefaultKpiDeleteDialog.js";
import { KpiDeleteDialog } from "../../kpiDeleteDialog/KpiDeleteDialog.js";
import { useSaveAsDialogProps } from "../../saveAs/DefaultSaveAsDialog/index.js";
import { SaveAsDialog } from "../../saveAs/SaveAsDialog.js";
import { useTopBarProps } from "../../topBar/topBar/DefaultTopBar.js";
import { TopBar } from "../../topBar/topBar/TopBar.js";
import { useWidgetDeleteDialogProps } from "../../widgetDeleteDialog/DefaultWidgetDeleteDialog.js";
import { WidgetDeleteDialog } from "../../widgetDeleteDialog/WidgetDeleteDialog.js";
import { ToastMessages } from "../components/ToastMessages.js";

// these wrapper components are here to prevent the whole DashboardHeader from re-rendering whenever some
// of the sub-components' props change. by isolating the hooks more, we make sure only the really changed component re-renders.
function DeleteDialogWrapper() {
    const deleteDialogProps = useDeleteDialogProps();
    return <DeleteDialog {...deleteDialogProps} />;
}

function WidgetDeleteDialogWrapper() {
    const widgetDeleteDialogProps = useWidgetDeleteDialogProps();
    return <WidgetDeleteDialog {...widgetDeleteDialogProps} />;
}

function KpiDeleteDialogWrapper() {
    const kpiDeleteDialogProps = useKpiDeleteDialogProps();
    return <KpiDeleteDialog {...kpiDeleteDialogProps} />;
}

function SaveAsDialogWrapper() {
    const saveAsDialogProps = useSaveAsDialogProps();
    return <SaveAsDialog {...saveAsDialogProps} />;
}

function TopBarWrapper() {
    const topBarProps = useTopBarProps();
    return <TopBar {...topBarProps} />;
}

function FilterBarWrapper() {
    const filterBarProps = useFilterBarProps();
    return <FilterBar {...filterBarProps} />;
}

function CancelEditDialogWrapper() {
    const cancelEditDialogProps = useCancelEditDialog();
    return <CancelEditDialog {...cancelEditDialogProps} />;
}

function DashboardTabsWrapper() {
    const dashboardTabsProps = useDashboardTabsProps();
    return <DashboardTabs {...dashboardTabsProps} />;
}

// split the header parts of the dashboard so that changes to their state
// (e.g. opening email dialog) do not re-render the dashboard body
export function DashboardHeader(): ReactElement {
    return (
        <>
            <ToastMessages />
            <ExportXlsxDialogProvider />
            <ExportTabularPdfDialogProvider />
            <ScheduledEmailDialogProvider />
            <AlertingDialogProvider />
            <ShareDialogDashboardHeader />
            <SettingsDialogProvider />
            <DeleteDialogWrapper />
            <WidgetDeleteDialogWrapper />
            <KpiDeleteDialogWrapper />
            <SaveAsDialogWrapper />
            <TopBarWrapper />
            <DashboardTabsWrapper />
            <FilterBarWrapper />
            <CancelEditDialogWrapper />
        </>
    );
}
