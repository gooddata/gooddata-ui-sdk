// (C) 2019-2022 GoodData Corporation
import { useCallback } from "react";
import { IDashboard } from "@gooddata/sdk-model";
import {
    CommandProcessingStatus,
    saveDashboardAs,
    selectBackendCapabilities,
    selectDashboardTitle,
    selectEnableKPIDashboardSchedule,
    selectIsDashboardSaving,
    selectIsInEditMode,
    selectLocale,
    useDashboardCommandProcessing,
    useDashboardSelector,
} from "../../../model/index.js";
import { ILocale } from "@gooddata/sdk-ui";

interface UseSaveAsResult {
    locale: ILocale;
    dashboardTitle: string;
    isDashboardSaving: boolean;
    isDashboardLoaded: boolean;
    isKpiWidgetEnabled: boolean;
    isScheduleEmailsEnabled: boolean;
    isInEditMode: boolean;

    /**
     * Function that triggers the SaveAs functionality. Optionally specify new title for
     * the dashboard copy and indicate whether the Dashboard component should switch to the newly
     * created copy after successful save.
     *
     * Default is false.
     */
    handleSaveAs: (title: string, switchToCopy?: boolean) => void;

    /**
     * Status of the save as operation.
     */
    saveAsStatus?: CommandProcessingStatus;
}

/**
 * @internal
 */
export interface UseSaveAsProps {
    /**
     * Callback to be called, when user submit the scheduled email dialog.
     */
    onSubmit?: (title: string, switchToCopy?: boolean) => void;

    /**
     * Callback to be called, when submitting of the scheduled email was successful.
     */
    onSubmitSuccess?: (dashboard: IDashboard) => void;

    /**
     * Callback to be called, when submitting of the scheduled email failed.
     */
    onSubmitError?: (error: any | undefined) => void;
}

export const useSaveAs = (props: UseSaveAsProps): UseSaveAsResult => {
    const { onSubmit, onSubmitSuccess, onSubmitError } = props;
    const locale = useDashboardSelector(selectLocale);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const isScheduleEmailsEnabled = useDashboardSelector(selectEnableKPIDashboardSchedule);
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const isDashboardSaving = useDashboardSelector(selectIsDashboardSaving);
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    const saveAsCommandProcessing = useDashboardCommandProcessing({
        commandCreator: saveDashboardAs,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.COPY_SAVED",
        onError: (event) => {
            onSubmitError?.(event.payload.error);
        },
        onSuccess: (event) => {
            onSubmitSuccess?.(event.payload.dashboard);
        },
        onBeforeRun: (cmd) => {
            onSubmit?.(cmd.payload.title!, cmd.payload.switchToCopy);
        },
    });

    const handleSaveAs = useCallback(
        (title?: string, switchToDashboard = false, useOriginalFilterContext = true) => {
            saveAsCommandProcessing.run(title, switchToDashboard, useOriginalFilterContext);
        },
        [],
    );

    return {
        locale,
        dashboardTitle,
        isScheduleEmailsEnabled,
        isKpiWidgetEnabled: capabilities.supportsKpiWidget ?? false,
        isDashboardLoaded: true,
        isDashboardSaving,
        isInEditMode,
        handleSaveAs,
        saveAsStatus: saveAsCommandProcessing.status,
    };
};
