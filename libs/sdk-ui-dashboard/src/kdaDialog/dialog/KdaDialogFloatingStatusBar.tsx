// (C) 2025-2026 GoodData Corporation

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
    titleElementId: string;
    status: KdaFloatingStatus;
    onClose?: () => void;
}

/**
 * @internal
 */
export function KdaDialogFloatingStatusBar({
    onClose,
    status,
    titleElementId,
}: IKdaDialogFloatingStatusBarProps) {
    const intl = useIntl();

    const statusText = intl.formatMessage(floatingStatusMessages[status]);

    return (
        <div className="gd-kda-floating-status-bar">
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {status === "done" || status === "error" ? statusText : null}
            </div>
            <div className="gd-kda-floating-status-bar__content">
                <StatusIndicator status={status} />
                <p className="gd-kda-floating-status-bar__text" id={titleElementId} tabIndex={0}>
                    {statusText}
                </p>
            </div>
            <KdaDialogActionButtons
                size="small"
                status={status}
                titleElementId={titleElementId}
                onClose={onClose}
            />
        </div>
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
