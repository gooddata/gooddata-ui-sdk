// (C) 2020-2025 GoodData Corporation
import { useCallback, useRef } from "react";

import { type IExportResult, isProtectedDataError } from "@gooddata/sdk-backend-spi";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { downloadFile } from "../../../_staging/fileUtils/downloadFile.js";
import { messages } from "../../../locales.js";

type ExportSlidesHandler = (
    exportFunction: (title: string, exportType: "pdf" | "pptx") => Promise<IExportResult>,
    title: string,
    exportType: "pdf" | "pptx",
) => Promise<void>;

export const useSlidesExportHandler = (): ExportSlidesHandler => {
    const { addProgress, addSuccess, addError, removeMessage } = useToastMessage();
    const lastExportMessageId = useRef("");
    return useCallback<ExportSlidesHandler>(async (exportFunction, title, exportType) => {
        try {
            lastExportMessageId.current = addProgress(
                messages.messagesExportResultStart,
                // make sure the message stays there until removed by either success or error
                { duration: 0 },
            ).id;

            const exportResult = await exportFunction(title, exportType);

            if (lastExportMessageId.current) {
                removeMessage(lastExportMessageId.current);
            }
            addSuccess(messages.messagesExportResultSuccess);
            downloadFile(exportResult);
        } catch (err) {
            if (lastExportMessageId.current) {
                removeMessage(lastExportMessageId.current);
            }

            if (isProtectedDataError(err)) {
                addError(messages.messagesExportResultRestrictedError);
            } else {
                addError(messages.messagesExportResultError);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
