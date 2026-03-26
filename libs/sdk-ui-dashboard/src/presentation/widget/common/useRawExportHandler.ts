// (C) 2024-2026 GoodData Corporation

import { useCallback, useRef } from "react";

import {
    type IDashboardExportRawOptions,
    type IExportResult,
    isProtectedDataError,
} from "@gooddata/sdk-backend-spi";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { downloadFile } from "../../../_staging/fileUtils/downloadFile.js";
import { messages } from "../../../locales.js";

type ExportHandler = (
    exportFunction: (filename: string, options?: IDashboardExportRawOptions) => Promise<IExportResult>,
    title: string,
    options?: IDashboardExportRawOptions,
) => Promise<void>;

export const useRawExportHandler = (): ExportHandler => {
    const { addProgress, addSuccess, addError, removeMessage } = useToastMessage();
    const lastExportMessageId = useRef("");
    return useCallback<ExportHandler>(async (exportFunction, title, options) => {
        try {
            lastExportMessageId.current = addProgress(
                messages.messagesExportResultStart,
                // make sure the message stays there until removed by either success or error
                { duration: 0 },
            ).id;
            const exportResult: IExportResult = await exportFunction(title, options);
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
