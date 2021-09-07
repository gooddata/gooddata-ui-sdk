// (C) 2019-2020 GoodData Corporation
import React from "react";
import { SaveAsDialogPropsProvider, useSaveAsDialogProps } from "../SaveAsDialogPropsContext";
import { ISaveAsDialogProps } from "../types";
import { useSaveAs } from "./useSaveAs";
import { SaveAsDialogRenderer } from "./SaveAsDialogRenderer";

/**
 * @internal
 */
export const DefaultSaveAsDialogInner = (): JSX.Element | null => {
    const { onSubmit, onCancel, onError, isVisible, onSuccess } = useSaveAsDialogProps();

    const {
        locale,
        dashboardTitle,
        isKpiWidgetEnabled,
        isScheduleEmailsEnabled,
        isDashboardSaving,
        isDashboardLoaded,
        handleSaveAs,
    } = useSaveAs({ onSubmit, onSubmitSuccess: onSuccess, onSubmitError: onError });

    if (!isVisible) {
        return null;
    }

    return (
        <SaveAsDialogRenderer
            locale={locale}
            dashboardTitle={dashboardTitle}
            isKpiWidgetEnabled={isKpiWidgetEnabled}
            isDashboardLoaded={isDashboardLoaded}
            isDashboardSaving={isDashboardSaving}
            isScheduleEmailsEnabled={isScheduleEmailsEnabled}
            onSubmit={handleSaveAs}
            onCancel={onCancel}
        />
    );
};

/**
 * @alpha
 */
export const DefaultSaveAsDialog = (props: ISaveAsDialogProps): JSX.Element => {
    return (
        <SaveAsDialogPropsProvider {...props}>
            <DefaultSaveAsDialogInner />
        </SaveAsDialogPropsProvider>
    );
};
