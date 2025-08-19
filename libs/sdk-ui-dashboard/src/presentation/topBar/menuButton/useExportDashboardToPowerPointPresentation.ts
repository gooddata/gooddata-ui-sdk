// (C) 2022-2025 GoodData Corporation

import { useRef } from "react";

import { isProtectedDataError } from "@gooddata/sdk-backend-spi";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { downloadFile } from "../../../_staging/fileUtils/downloadFile.js";
import { messages } from "../../../locales.js";
import { exportDashboardToPptPresentation, useDashboardCommandProcessing } from "../../../model/index.js";

export const useExportDashboardToPowerPointPresentation = () => {
    const { addSuccess, addError, addProgress, removeMessage } = useToastMessage();
    const lastExportMessageId = useRef("");
    const { run: exportDashboard, status } = useDashboardCommandProcessing({
        commandCreator: exportDashboardToPptPresentation,
        successEvent: "GDC.DASH/EVT.EXPORT.PPT_PRESENTATION.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            lastExportMessageId.current = addProgress(
                messages.messagesExportResultStart,
                // make sure the message stays there until removed by either success or error
                { duration: 0 },
            );
        },
        onSuccess: (event) => {
            if (lastExportMessageId.current) {
                removeMessage(lastExportMessageId.current);
            }
            addSuccess(messages.messagesExportResultSuccess);
            downloadFile(event.payload.result);
        },
        onError: (error) => {
            if (lastExportMessageId.current) {
                removeMessage(lastExportMessageId.current);
            }

            if (isProtectedDataError(error)) {
                addError(messages.messagesExportResultRestrictedError);
            } else {
                addError(messages.messagesExportResultError);
            }
        },
    });

    return {
        exportDashboardToPptPresentation: exportDashboard,
        exportDashboardToPptPresentationStatus: status,
    };
};
