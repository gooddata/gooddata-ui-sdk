// (C) 2020-2025 GoodData Corporation
import { useCallback, useRef } from "react";

import { IExportResult, isProtectedDataError } from "@gooddata/sdk-backend-spi";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { downloadFile } from "../../../_staging/fileUtils/downloadFile.js";
import { messages } from "../../../locales.js";

type ExportImageHandler = (
    exportFunction: (title: string) => Promise<IExportResult>,
    title: string,
) => Promise<void>;

export const useImageExportHandler = (): ExportImageHandler => {
    const { addProgress, addSuccess, addError, removeMessage } = useToastMessage();
    const lastExportMessageId = useRef("");
    return useCallback<ExportImageHandler>(async (exportFunction, title) => {
        try {
            lastExportMessageId.current = addProgress(
                messages.messagesExportResultStart,
                // make sure the message stays there until removed by either success or error
                { duration: 0 },
            );
            const exportResult = await exportFunction(title);

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
    }, []);
};
