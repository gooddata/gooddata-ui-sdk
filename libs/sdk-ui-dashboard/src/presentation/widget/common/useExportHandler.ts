// (C) 2020-2022 GoodData Corporation
import { useCallback, useRef } from "react";
import { isProtectedDataError } from "@gooddata/sdk-backend-spi";
import { IExtendedExportConfig } from "@gooddata/sdk-ui";
import { downloadFile } from "../../../_staging/fileUtils/downloadFile";
import { messages } from "../../../locales";
import { useToastMessages } from "../../../model";

type ExportHandler = (
    exportFunction: (config: IExtendedExportConfig) => Promise<string>,
    exportConfig: IExtendedExportConfig,
) => Promise<void>;

export const useExportHandler = (): ExportHandler => {
    const { addProgress, addSuccess, addError, removeMessage } = useToastMessages();
    const lastExportMessageId = useRef("");
    return useCallback<ExportHandler>(async (exportFunction, exportConfig) => {
        try {
            lastExportMessageId.current = addProgress(
                messages.messagesExportResultStart,
                // make sure the message stays there until removed by either success or error
                { duration: 0 },
            );

            const exportResultUri = await exportFunction(exportConfig);

            if (lastExportMessageId.current) {
                removeMessage(lastExportMessageId.current);
            }
            addSuccess(messages.messagesExportResultSuccess);

            downloadFile(exportResultUri);
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
