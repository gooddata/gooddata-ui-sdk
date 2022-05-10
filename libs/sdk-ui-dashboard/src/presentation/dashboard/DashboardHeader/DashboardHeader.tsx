// (C) 2021-2022 GoodData Corporation
import React from "react";
import { ToastMessages } from "@gooddata/sdk-ui-kit";

import { ExportDialogProvider } from "../../dialogs";
import { TopBar, useTopBarProps } from "../../topBar";
import { SaveAsDialog, useSaveAsDialogProps } from "../../saveAs";
import { FilterBar, useFilterBarProps } from "../../filterBar";
import { ShareDialogDashboardHeader } from "./ShareDialogDashboardHeader";
import { ScheduledEmailDialogProvider } from "./ScheduledEmailDialogProvider";
import { DeleteDialog, useDeleteDialogProps } from "../../deleteDialog";

// split the header parts of the dashboard so that changes to their state
// (e.g. opening email dialog) do not re-render the dashboard body
export const DashboardHeader = (): JSX.Element => {
    const deleteDialogProps = useDeleteDialogProps();
    const saveAsDialogProps = useSaveAsDialogProps();

    const filterBarProps = useFilterBarProps();
    const topBarProps = useTopBarProps();

    return (
        <>
            <ToastMessages />
            <ExportDialogProvider />
            <ScheduledEmailDialogProvider />
            <ShareDialogDashboardHeader />
            <DeleteDialog {...deleteDialogProps} />
            <SaveAsDialog {...saveAsDialogProps} />

            <TopBar {...topBarProps} />
            <FilterBar {...filterBarProps} />
        </>
    );
};
