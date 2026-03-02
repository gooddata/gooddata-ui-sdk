// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { UploadItemStatus } from "../types.js";
import { b, e } from "./uploadStatusDialogBem.js";
import { UiIcon } from "../../@ui/UiIcon/UiIcon.js";
import { Dialog } from "../../Dialog/Dialog.js";
import { useIdPrefixed } from "../../utils/useId.js";

/**
 * @internal
 */
export interface IUploadStatusDialogProps {
    isOpen: boolean;
    title: ReactNode;
    fileName?: string;
    status: UploadItemStatus;
    onClose?: () => void;
}

/**
 * @internal
 */
export function UploadStatusDialog({ isOpen, title, fileName, status, onClose }: IUploadStatusDialogProps) {
    const titleId = useIdPrefixed("gd-upload-status-dialog-title");

    if (!isOpen) {
        return null;
    }

    return (
        <Dialog
            displayCloseButton={!!onClose}
            className={b()}
            onCancel={onClose}
            onClose={onClose}
            accessibilityConfig={{
                titleElementId: titleId,
                isModal: true,
            }}
        >
            <div className={e("content")} aria-live="polite">
                <div className={e("hero-image")}>
                    <UiIcon type={"file"} size={48} color={"complementary-6"} />
                    {status === UploadItemStatus.Uploading || status === UploadItemStatus.Idle ? (
                        <div
                            className={e("status-icon", {
                                spinning: status === UploadItemStatus.Uploading,
                            })}
                        >
                            <UiIcon
                                type={"sync"}
                                size={25}
                                color={"primary"}
                                backgroundShape={"circle"}
                                backgroundColor={"complementary-0"}
                                backgroundSize={30}
                                accessibilityConfig={{ ariaHidden: true }}
                            />
                        </div>
                    ) : null}
                    {status === UploadItemStatus.Success ? (
                        <div className={e("status-icon")}>
                            <UiIcon
                                type={"check"}
                                size={20}
                                color={"success"}
                                backgroundShape={"circle"}
                                backgroundColor={"complementary-0"}
                                backgroundSize={30}
                                accessibilityConfig={{ ariaHidden: true }}
                            />
                        </div>
                    ) : null}
                    {status === UploadItemStatus.Error ? (
                        <div className={e("status-icon")}>
                            <UiIcon
                                type={"cross"}
                                size={25}
                                color={"error"}
                                backgroundShape={"circle"}
                                backgroundColor={"complementary-0"}
                                backgroundSize={30}
                                accessibilityConfig={{ ariaHidden: true }}
                            />
                        </div>
                    ) : null}
                </div>
                <h3 id={titleId}>
                    {title}
                    {fileName ? (
                        <>
                            <br />"{fileName}"
                        </>
                    ) : null}
                </h3>
            </div>
        </Dialog>
    );
}
