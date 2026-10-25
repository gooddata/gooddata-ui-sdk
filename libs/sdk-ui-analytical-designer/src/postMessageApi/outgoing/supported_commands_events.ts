// (C) 2020-2026 GoodData Corporation

import { GdcAdCommandType } from "@gooddata/sdk-embedding";

import { adPostEvent } from "./post_event_helper.js";

/**
 * Commands that write to or export from the insight. They are accepted only when the
 * `enableEmbeddingWriteCommands` feature flag is on for the organization.
 */
export const WRITE_COMMANDS: GdcAdCommandType[] = [
    GdcAdCommandType.Save,
    GdcAdCommandType.SaveAs,
    GdcAdCommandType.Export,
];

export const SUPPORTED_COMMANDS: GdcAdCommandType[] = [
    GdcAdCommandType.DrillableItems,
    GdcAdCommandType.OpenInsight,
    GdcAdCommandType.Clear,
    GdcAdCommandType.ClearInsight,
    GdcAdCommandType.Save,
    GdcAdCommandType.SaveAs,
    GdcAdCommandType.Export,
    GdcAdCommandType.Undo,
    GdcAdCommandType.Redo,
    GdcAdCommandType.SetFilterContext,
    GdcAdCommandType.RemoveFilterContext,
    GdcAdCommandType.RequestCancellation,
    GdcAdCommandType.SetApiToken,
    GdcAdCommandType.AttributeHierarchyModified,
    GdcAdCommandType.SetTimezone,
];

export interface IAvailableCommandState {
    isAppLoading: boolean;
    isClearInsightAvailable: boolean;
    isClearInsightContentAvailable: boolean;
    isSaveInsightAvailable: boolean;
    isSaveAsInsightAvailable: boolean;
    isExportInsightAvailable: boolean;
    isUndoAvailable: boolean;
    isRedoAvailable: boolean;
    isSetFilterContextAvailable: boolean;
    isRemoveFilterContextAvailable: boolean;
    isSetApiTokenAvailable: boolean;
    isEnableTimezoneChange: boolean;
}

export function getAvailableCommands({
    isClearInsightAvailable,
    isClearInsightContentAvailable,
    isSaveInsightAvailable,
    isSaveAsInsightAvailable,
    isExportInsightAvailable,
    isRedoAvailable,
    isUndoAvailable,
    isSetFilterContextAvailable,
    isRemoveFilterContextAvailable,
    isSetApiTokenAvailable,
    isEnableTimezoneChange,
}: IAvailableCommandState): GdcAdCommandType[] {
    return SUPPORTED_COMMANDS.filter((commandType: GdcAdCommandType): boolean => {
        let isCommandAvailable = false;
        switch (commandType) {
            case GdcAdCommandType.DrillableItems:
            case GdcAdCommandType.OpenInsight:
                isCommandAvailable = true;
                break;

            case GdcAdCommandType.Clear:
                isCommandAvailable = isClearInsightAvailable;
                break;

            case GdcAdCommandType.ClearInsight:
                isCommandAvailable = isClearInsightContentAvailable;
                break;

            case GdcAdCommandType.Save:
                isCommandAvailable = isSaveInsightAvailable;
                break;

            case GdcAdCommandType.SaveAs:
                isCommandAvailable = isSaveAsInsightAvailable;
                break;

            case GdcAdCommandType.Export:
                isCommandAvailable = isExportInsightAvailable;
                break;

            case GdcAdCommandType.Undo:
                isCommandAvailable = isUndoAvailable;
                break;

            case GdcAdCommandType.Redo:
                isCommandAvailable = isRedoAvailable;
                break;

            case GdcAdCommandType.SetFilterContext:
                isCommandAvailable = isSetFilterContextAvailable;
                break;

            case GdcAdCommandType.RemoveFilterContext:
                isCommandAvailable = isRemoveFilterContextAvailable;
                break;

            case GdcAdCommandType.SetApiToken:
                isCommandAvailable = isSetApiTokenAvailable;
                break;

            case GdcAdCommandType.AttributeHierarchyModified:
                isCommandAvailable = true;
                break;

            case GdcAdCommandType.SetTimezone:
                isCommandAvailable = isEnableTimezoneChange;
                break;

            default:
                break;
        }
        return isCommandAvailable;
    });
}

export function availableCommandChanged(availableCommandState: IAvailableCommandState): void {
    const { isAppLoading } = availableCommandState;
    if (isAppLoading) {
        // do nothing when app is not ready yet
        return;
    }

    adPostEvent("availableCommands", getAvailableCommands(availableCommandState));
}
