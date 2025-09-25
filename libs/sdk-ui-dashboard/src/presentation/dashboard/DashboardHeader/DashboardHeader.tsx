// (C) 2021-2025 GoodData Corporation

import { ReactElement } from "react";

import { AlertingDialogProvider } from "./AlertingDialogProvider.js";
import { ScheduledEmailDialogProvider } from "./ScheduledEmailDialogProvider.js";
import { SettingsDialogProvider } from "./SettingsDialogProvider.js";
import { ShareDialogDashboardHeader } from "./ShareDialogDashboardHeader.js";
import { CancelEditDialog, useCancelEditDialog } from "../../cancelEditDialog/index.js";
import { DeleteDialog, useDeleteDialogProps } from "../../deleteDialog/index.js";
import { ExportTabularPdfDialogProvider, ExportXlsxDialogProvider } from "../../dialogs/index.js";
import { FilterBar, useFilterBarProps } from "../../filterBar/index.js";
import { KpiDeleteDialog, useKpiDeleteDialogProps } from "../../kpiDeleteDialog/index.js";
import { SaveAsDialog, useSaveAsDialogProps } from "../../saveAs/index.js";
import { TopBar, useTopBarProps } from "../../topBar/index.js";
import { WidgetDeleteDialog, useWidgetDeleteDialogProps } from "../../widgetDeleteDialog/index.js";
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
            <FilterBarWrapper />
            <CancelEditDialogWrapper />
        </>
    );
}
