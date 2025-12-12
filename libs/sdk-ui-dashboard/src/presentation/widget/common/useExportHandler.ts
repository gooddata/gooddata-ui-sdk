// (C) 2020-2025 GoodData Corporation

import { useCallback, useRef } from "react";

import { useIntl } from "react-intl";

import { type IExportResult, isDataTooLargeError, isProtectedDataError } from "@gooddata/sdk-backend-spi";
import { type IExtendedExportConfig } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { downloadFile } from "../../../_staging/fileUtils/downloadFile.js";
import { messages } from "../../../locales.js";

type ExportHandler = (
    exportFunction: (config: IExtendedExportConfig) => Promise<IExportResult>,
    exportConfig: IExtendedExportConfig,
) => Promise<void>;

export const useExportHandler = (): ExportHandler => {
    const { addProgress, addSuccess, addError, removeMessage } = useToastMessage();
    const intl = useIntl();
    const lastExportMessageId = useRef("");
    return useCallback<ExportHandler>(async (exportFunction, exportConfig) => {
        try {
            lastExportMessageId.current = addProgress(
                messages.messagesExportResultStart,
                // make sure the message stays there until removed by either success or error
                { duration: 0 },
            ).id;

            const exportResult = await exportFunction(exportConfig);

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
                return;
            }

            if (isDataTooLargeError(err)) {
                // Currently, there will be at most one limit break specified.
                const limitBreak = err.responseBody?.structuredDetail?.limitBreaks?.[0];
                if (limitBreak?.limitType == "export-rows") {
                    addError(messages.messagesExportResultErrorTooManyRows, {
                        values: {
                            actual: intl.formatNumber(limitBreak.actualValue),
                            limit: intl.formatNumber(limitBreak.limit),
                        },
                    });
                    return;
                }
            }

            addError(messages.messagesExportResultError);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
