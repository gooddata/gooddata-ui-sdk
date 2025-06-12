// (C) 2022-2025 GoodData Corporation

import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { isProtectedDataError } from "@gooddata/sdk-backend-spi";
import { useRef } from "react";

import { exportDashboardToExcel, useDashboardCommandProcessing } from "../../../model/index.js";
import { messages } from "../../../locales.js";
import { downloadFile } from "../../../_staging/fileUtils/downloadFile.js";

export const useExportDashboardToExcel = (onSuccess?: () => void) => {
    const { addSuccess, addError, addProgress, removeMessage } = useToastMessage();
    const lastExportMessageId = useRef("");
    const { run: exportDashboard, status } = useDashboardCommandProcessing({
        commandCreator: exportDashboardToExcel,
        successEvent: "GDC.DASH/EVT.EXPORT.EXCEL.RESOLVED",
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
            onSuccess?.();
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
        exportDashboardToExcel: exportDashboard,
        exportDashboardToExcelStatus: status,
    };
};
