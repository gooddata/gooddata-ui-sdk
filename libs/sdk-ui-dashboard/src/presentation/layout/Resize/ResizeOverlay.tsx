// (C) 2019-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { FormattedMessage, defineMessages } from "react-intl";
import { ReachedHeightResizingLimit } from "../../dragAndDrop/DragLayerPreview/types";

const messages = defineMessages({
    minHeight: { id: "layout.widget.height.min" },
    maxHeight: { id: "layout.widget.height.max" },
    underLimit: { id: "layout.widget.under.limit" },
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
    isUnderWidthMinLimit: boolean;
    reachedHeightLimit: ReachedHeightResizingLimit;
}

function getMessage(reachedHeightLimit: ReachedHeightResizingLimit) {
    if (reachedHeightLimit === "min") {
        return messages.minHeight;
    }
    if (reachedHeightLimit === "max") {
        return messages.maxHeight;
    }
    return messages.underLimit;
}

function getStatus({
    isResizingColumnOrRow,
    isActive,
    isUnderWidthMinLimit,
    reachedHeightLimit,
}: ResizeOverlayProps) {
    let status = ResizeOverlayStatus.None;
    if (isResizingColumnOrRow) {
        status = ResizeOverlayStatus.Grey;
        if (isActive) {
            status = ResizeOverlayStatus.Active;
            if (isUnderWidthMinLimit || reachedHeightLimit !== "none") {
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

    const message = getMessage(props.reachedHeightLimit);

    const errorText = (
        <div className="gd-resize-overlay-text">
            <FormattedMessage {...message} />
        </div>
    );

    return (
        <>
            <div className={classes} />
            {isInError ? errorText : null}
        </>
    );
}
