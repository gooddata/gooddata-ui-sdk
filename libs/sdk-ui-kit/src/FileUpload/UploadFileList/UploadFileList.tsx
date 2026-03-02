// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { type IntlShape, defineMessages, useIntl } from "react-intl";

import { type IUploadActionCallbacks, type IUploadFileItem, UploadItemStatus } from "../types.js";
import { b, e } from "./uploadFileListBem.js";
import { UiButton } from "../../@ui/UiButton/UiButton.js";

/**
 * @internal
 */
export interface IUploadFileListProps extends IUploadActionCallbacks {
    files: IUploadFileItem[];
    emptyStateLabel?: ReactNode;
}

const messages = defineMessages({
    statusUploading: { id: "fileUpload.status.uploading" },
    statusUploaded: { id: "fileUpload.status.uploaded" },
    statusFailed: { id: "fileUpload.status.failed" },
    statusReady: { id: "fileUpload.status.ready" },
    actionRetry: { id: "fileUpload.action.retry" },
    actionRemove: { id: "fileUpload.action.remove" },
    listLabel: { id: "fileUpload.list.label" },
    actionRetryFile: { id: "fileUpload.action.retryFile" },
    actionRemoveFile: { id: "fileUpload.action.removeFile" },
});

const getStatusText = (item: IUploadFileItem, intl: IntlShape): ReactNode => {
    switch (item.status) {
        case UploadItemStatus.Uploading:
            return intl.formatMessage(messages.statusUploading);
        case UploadItemStatus.Success:
            return intl.formatMessage(messages.statusUploaded);
        case UploadItemStatus.Error:
            return item.errorMessage ?? intl.formatMessage(messages.statusFailed);
        case UploadItemStatus.Idle:
        default:
            return intl.formatMessage(messages.statusReady);
    }
};

/**
 * @internal
 */
export function UploadFileList({ files, emptyStateLabel, onRemoveFile, onRetryFile }: IUploadFileListProps) {
    const intl = useIntl();

    if (!files.length) {
        return emptyStateLabel ? <div>{emptyStateLabel}</div> : null;
    }

    return (
        <ul className={b()} aria-label={intl.formatMessage(messages.listLabel)}>
            {files.map((item) => {
                const isError = item.status === UploadItemStatus.Error;

                return (
                    <li key={item.id} className={e("item")}>
                        <div className={e("item-content")}>
                            <span className={e("item-name")}>{item.file.name}</span>
                            <span
                                className={e("item-status")}
                                role={isError ? "alert" : undefined}
                                aria-live={isError ? undefined : "polite"}
                            >
                                {getStatusText(item, intl)}
                            </span>
                        </div>
                        <div className={e("item-actions")}>
                            {isError && onRetryFile ? (
                                <UiButton
                                    label={intl.formatMessage(messages.actionRetry)}
                                    accessibilityConfig={{
                                        ariaLabel: intl.formatMessage(messages.actionRetryFile, {
                                            fileName: item.file.name,
                                        }),
                                    }}
                                    onClick={() => onRetryFile(item.id)}
                                />
                            ) : null}
                            {onRemoveFile ? (
                                <UiButton
                                    label={intl.formatMessage(messages.actionRemove)}
                                    accessibilityConfig={{
                                        ariaLabel: intl.formatMessage(messages.actionRemoveFile, {
                                            fileName: item.file.name,
                                        }),
                                    }}
                                    onClick={() => onRemoveFile(item.id)}
                                />
                            ) : null}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
