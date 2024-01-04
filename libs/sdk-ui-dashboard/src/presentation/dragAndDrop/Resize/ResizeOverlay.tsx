// (C) 2019-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { FormattedMessage, defineMessages } from "react-intl";
import { ReachedResizingLimit } from "../DragLayerPreview/types.js";

const messages = defineMessages({
    minHeight: { id: "layout.widget.height.min" },
    maxHeight: { id: "layout.widget.height.max" },
    minWidth: { id: "layout.widget.width.min" },
    maxWidth: { id: "layout.widget.width.max" },
});

enum ResizeOverlayStatus {
    None,
    Grey,
    Active,
    Error,
}

export interface ResizeOverlayProps {
    isResizingColumnOrRow: boolean;
    isActive: boolean;
    reachedWidthLimit: ReachedResizingLimit;
    reachedHeightLimit: ReachedResizingLimit;
}

function getMessage({
    reachedHeightLimit,
    reachedWidthLimit,
}: {
    reachedHeightLimit: ReachedResizingLimit;
    reachedWidthLimit: ReachedResizingLimit;
}) {
    if (reachedHeightLimit === "min") {
        return messages.minHeight;
    }
    if (reachedHeightLimit === "max") {
        return messages.maxHeight;
    }
    if (reachedWidthLimit === "min") {
        return messages.minWidth;
    }
    if (reachedWidthLimit === "max") {
        return messages.maxWidth;
    }
    return undefined;
}

function getStatus({
    isResizingColumnOrRow,
    isActive,
    reachedWidthLimit,
    reachedHeightLimit,
}: ResizeOverlayProps) {
    let status = ResizeOverlayStatus.None;
    if (isResizingColumnOrRow) {
        status = ResizeOverlayStatus.Grey;
        if (isActive) {
            status = ResizeOverlayStatus.Active;
            if (reachedWidthLimit !== "none" || reachedHeightLimit !== "none") {
                status = ResizeOverlayStatus.Error;
            }
        }
    }
    return status;
}

export function ResizeOverlay(props: ResizeOverlayProps) {
    const status = getStatus(props);

    if (status === ResizeOverlayStatus.None) {
        return null;
    }

    const isInError = status === ResizeOverlayStatus.Error;
    const isActive = status === ResizeOverlayStatus.Active;

    const classes = cx("gd-resize-overlay", {
        active: isActive,
        error: isInError,
    });

    const message = getMessage({
        reachedHeightLimit: props.reachedHeightLimit,
        reachedWidthLimit: props.reachedWidthLimit,
    });

    const errorText = (
        <div className="gd-resize-overlay-text">
            <FormattedMessage {...message} />
        </div>
    );

    return (
        <>
            <div role="resize-overlay" className={classes} />
            {isInError ? errorText : null}
        </>
    );
}
