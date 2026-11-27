// (C) 2025-2026 GoodData Corporation

import { useEffect, useRef, useState } from "react";

import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { LoadingSpinner, UiIcon } from "@gooddata/sdk-ui-kit";

import type { KdaAsyncStatus } from "../internalTypes.js";

import { KdaDialogActionButtons } from "./KdaDialogActionButtons.js";

type KdaFloatingStatus = "step01" | "step02" | "done" | "error";

const floatingStatusMessages: Record<KdaFloatingStatus, MessageDescriptor> = defineMessages({
    step01: { id: "kdaDialog.floatingStatus.step1" },
    step02: { id: "kdaDialog.floatingStatus.step2" },
    done: { id: "kdaDialog.floatingStatus.done" },
    error: { id: "kdaDialog.floatingStatus.error" },
});

interface IKdaDialogFloatingStatusBarProps {
    labelElementId: string;
    dialogTitle: string;
    descriptionElementId: string;
    status: KdaFloatingStatus;
    /**
     * Id of the expand (Open) button, so the minimized dialog can focus it.
     */
    toggleButtonId?: string;
    onClose?: () => void;
}

/**
 * @internal
 */
export function KdaDialogFloatingStatusBar({
    onClose,
    status,
    toggleButtonId,
    labelElementId,
    dialogTitle,
    descriptionElementId,
}: IKdaDialogFloatingStatusBarProps) {
    const intl = useIntl();

    const statusText = intl.formatMessage(floatingStatusMessages[status]);

    return (
        <div className="gd-kda-floating-status-bar">
            <span id={labelElementId} className="sr-only">
                {dialogTitle}
            </span>
            <div className="gd-kda-floating-status-bar__content">
                <StatusIndicator status={status} />
                <p className="gd-kda-floating-status-bar__text" id={descriptionElementId}>
                    {statusText}
                </p>
            </div>
            <KdaDialogActionButtons
                size="small"
                toggleButtonId={toggleButtonId}
                status={status}
                titleElementId={descriptionElementId}
                toggleAriaDescribedBy={`${labelElementId} ${descriptionElementId}`}
                onClose={onClose}
            />
        </div>
    );
}

const announcementMessages = defineMessages({
    announcement: { id: "kdaDialog.floatingStatus.announcement" },
});

function isFinishedStatus(status: KdaFloatingStatus) {
    return status === "done" || status === "error";
}

interface IKdaDialogStatusAnnouncerProps {
    dialogTitle: string;
    status: KdaFloatingStatus;
    isMinimized: boolean;
}

interface IKdaAnnouncement {
    text: string;
    isError: boolean;
}

const EMPTY_ANNOUNCEMENT: IKdaAnnouncement = { text: "", isError: false };

/**
 * Live regions announcing when the analysis finishes while the dialog is minimized.
 * Completion is announced politely (`role="status"`), failure assertively (`role="alert"`).
 *
 * They must be rendered outside the dialog overlay, so that they are in the accessibility tree for the whole
 * life of the analysis, independently of the overlay mounting, positioning and minimizing / expanding.
 * Both regions stay mounted all the time. The text is set once per completion and cleared when a new
 * computation starts, so the same text is never re-inserted while nothing changes.
 *
 * @internal
 */
export function KdaDialogStatusAnnouncer({
    dialogTitle,
    status,
    isMinimized,
}: IKdaDialogStatusAnnouncerProps) {
    const intl = useIntl();
    const [announcement, setAnnouncement] = useState<IKdaAnnouncement>(EMPTY_ANNOUNCEMENT);
    const previousStatus = useRef(status);

    useEffect(() => {
        const wasFinished = isFinishedStatus(previousStatus.current);
        previousStatus.current = status;

        if (!isFinishedStatus(status)) {
            setAnnouncement(EMPTY_ANNOUNCEMENT);
            return;
        }
        if (!wasFinished && isMinimized) {
            setAnnouncement({
                text: intl.formatMessage(announcementMessages.announcement, {
                    title: dialogTitle,
                    status: intl.formatMessage(floatingStatusMessages[status]),
                }),
                isError: status === "error",
            });
        }
    }, [status, isMinimized, dialogTitle, intl]);

    return (
        <>
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {announcement.isError ? "" : announcement.text}
            </div>
            <div className="sr-only" role="alert" aria-atomic="true">
                {announcement.isError ? announcement.text : ""}
            </div>
        </>
    );
}

function StatusIndicator({ status }: { status: KdaFloatingStatus }) {
    if (status === "error") {
        return <UiIcon type="crossCircle" color="currentColor" size={16} layout="block" />;
    }
    if (status === "done") {
        return <UiIcon type="checkCircle" color="currentColor" size={16} layout="block" />;
    }
    return <LoadingSpinner className="small gd-kda-floating-status-bar__spinner" color="currentColor" />;
}

export function getFloatingStatus(
    relevantStatus: KdaAsyncStatus,
    itemsStatus: KdaAsyncStatus,
    selectedStatus: KdaAsyncStatus,
): KdaFloatingStatus {
    if (relevantStatus === "error" || itemsStatus === "error" || selectedStatus === "error") {
        return "error";
    }
    if (relevantStatus === "pending" || relevantStatus === "loading") {
        return "step01";
    }
    if (
        itemsStatus === "pending" ||
        itemsStatus === "loading" ||
        selectedStatus === "pending" ||
        selectedStatus === "loading"
    ) {
        return "step02";
    }
    return "done";
}
