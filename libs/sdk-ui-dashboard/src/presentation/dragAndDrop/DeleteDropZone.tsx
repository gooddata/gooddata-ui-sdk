// (C) 2022 GoodData Corporation
import cx from "classnames";
import React from "react";
import { FormattedMessage } from "react-intl";
import { removeAttributeFilter, useDashboardDispatch } from "../../model";
import { DEBUG_SHOW_DROP_ZONES } from "./config";
import { useDashboardDrop } from "./useDashboardDrop";

export function DeleteDropZone() {
    const dispatch = useDashboardDispatch();
    const [{ canDrop, isOver }, dropRef] = useDashboardDrop(
        "attributeFilter",
        {
            drop: ({ filter }) => {
                const identifier = filter.attributeFilter.localIdentifier!;
                dispatch(removeAttributeFilter(identifier));
            },
        },
        [dispatch],
    );

    if (!canDrop) {
        return null;
    }

    const className = cx("gd-dropzone", "gd-dropzone-delete", {
        "gd-dropzone-over": isOver,
    });

    const debugStyle = DEBUG_SHOW_DROP_ZONES && isOver ? { backgroundColor: "rgba(0, 255, 0, 0.4)" } : {};

    return (
        <div className={className} ref={dropRef} style={debugStyle}>
            <div className="gd-dropzone-message">
                <FormattedMessage id="addPanel.deleteItem" />
            </div>
        </div>
    );
}
