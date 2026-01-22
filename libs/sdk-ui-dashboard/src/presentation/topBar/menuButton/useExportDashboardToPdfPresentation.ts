// (C) 2022-2026 GoodData Corporation

import { useRef } from "react";

import { isProtectedDataError } from "@gooddata/sdk-backend-spi";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { downloadFile } from "../../../_staging/fileUtils/downloadFile.js";
import { messages } from "../../../locales.js";
import { exportDashboardToPdfPresentation } from "../../../model/commands/dashboard.js";
import { useDashboardCommandProcessing } from "../../../model/react/useDashboardCommandProcessing.js";

export const useExportDashboardToPdfPresentation = () => {
    const { addSuccess, addError, addProgress, removeMessage } = useToastMessage();
    const lastExportMessageId = useRef("");
    const { run: exportDashboard, status } = useDashboardCommandProcessing({
        commandCreator: exportDashboardToPdfPresentation,
        successEvent: "GDC.DASH/EVT.EXPORT.PDF_PRESENTATION.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            lastExportMessageId.current = addProgress(
                messages.messagesExportResultStart,
                // make sure the message stays there until removed by either success or error
                { duration: 0 },
            ).id;
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
        exportDashboardToPdfPresentation: exportDashboard,
        exportDashboardToPdfPresentationStatus: status,
    };
};
