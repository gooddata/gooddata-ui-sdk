// (C) 2020-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type IPostMessageContextPayload } from "@gooddata/sdk-embedding";

import { isElementUrisSupported } from "../../../selectors/backend_capabilities_selector.js";
import { redoPossible, reportSaving, undoPossible } from "../../../selectors/editor_header_selector.js";
import { isReportOpening } from "../../../selectors/export_selector.js";
import {
    isEmbeddingWriteCommandsEnabled,
    isEnableTimezoneChange,
} from "../../../selectors/feature_flag_selector.js";
import { getIsExportXLSXDisabled } from "../../../selectors/options_menu_selector.js";
import { isReportSavedSelector } from "../../../selectors/report_selector.js";
import {
    isClearInsightContentDisabledSelector,
    isResetDisabledSelector,
} from "../../../selectors/reset_button_selector.js";
import { isAppLoading } from "../../../selectors/route_selector.js";
import {
    isSaveAsNewDisabledSelector,
    isSaveDisabledSelector,
} from "../../../selectors/save_report_selector.js";
import { getFilterItems } from "../../../store/filter_bar/filter_bar_selector.js";
import { type IAppState } from "../../../store/types.js";
import { shouldWaitForInjectedApiToken } from "../../../utils/location.js";
import {
    type IAvailableCommandState,
    getAvailableCommands,
} from "../../outgoing/supported_commands_events.js";

const getPostMessageContextState = (state: IAppState) => state.appState.meta.postMessageContext;

// Memoized: every consumer is a saga `select` reading fields, so it gets a stable reference.
export const getPostMessageContext = createSelector(
    getPostMessageContextState,
    (postMessageContext): IPostMessageContextPayload => ({
        postMessageContext: postMessageContext ?? { contextId: undefined },
    }),
);

export const availableClearCommandsSelector = createSelector(
    isResetDisabledSelector,
    isClearInsightContentDisabledSelector,
    (isClearInsightDisabled, isClearInsightContentDisabled) => ({
        isClearInsightAvailable: !isClearInsightDisabled,
        isClearInsightContentAvailable: !isClearInsightContentDisabled,
    }),
);

export const availableCommandsStateSelector = createSelector(
    availableClearCommandsSelector,
    isSaveDisabledSelector,
    isSaveAsNewDisabledSelector,
    isReportSavedSelector,
    getIsExportXLSXDisabled,
    undoPossible,
    redoPossible,
    reportSaving,
    isAppLoading,
    getFilterItems,
    isReportOpening,
    isEmbeddingWriteCommandsEnabled,
    isEnableTimezoneChange,
    (
        availableClearCommands,
        isSaveDisabled,
        isSaveAsNewDisabled,
        isReportSaved,
        isExportXLSXDisabled,
        undoPossible,
        isRedoPossible,
        isReportSaving,
        isAppLoading,
        filterBarItems,
        isReportOpening,
        writeCommandsEnabled,
        isEnableTimezoneChange,
    ): IAvailableCommandState => {
        /**
         * Export to csv requires `canExecuteRaw` permission while Export to xlsx does not. But the ExportInsightCommand
         * can be configured for both csv and xlsx format. Then the command is available when Export to xlsx is enabled.
         * If the log-in user doesn't have `canExecuteRaw` permission and receive the ExportInsight to csv then
         * a commandFailed will be posted in response.
         *
         * @see `getIsExportCSVDisabled` selector
         */
        let isExportInsightAvailable = !isExportXLSXDisabled;
        let isSaveInsightAvailable = !isSaveDisabled;
        let isSaveAsInsightAvailable = !isSaveAsNewDisabled && isReportSaved;

        if (!writeCommandsEnabled) {
            isExportInsightAvailable = false;
            isSaveInsightAvailable = false;
            isSaveAsInsightAvailable = false;
        }

        const elementsUriSupported = isElementUrisSupported();

        return {
            ...availableClearCommands,
            isAppLoading,
            isExportInsightAvailable,
            isSaveAsInsightAvailable,
            isSaveInsightAvailable,
            isUndoAvailable: undoPossible && !isReportSaving,
            isRedoAvailable: isRedoPossible && !isReportSaving,
            isSetFilterContextAvailable:
                !isAppLoading && !isReportSaving && !isReportOpening && elementsUriSupported,
            isRemoveFilterContextAvailable:
                !isAppLoading &&
                !isReportSaving &&
                !isReportOpening &&
                !!filterBarItems.length &&
                elementsUriSupported,
            isSetApiTokenAvailable: shouldWaitForInjectedApiToken(),
            isEnableTimezoneChange,
        };
    },
);

export const availableCommandsSelector = createSelector(
    availableCommandsStateSelector,
    (availableCommandsState) => {
        return getAvailableCommands(availableCommandsState);
    },
);
