// (C) 2022 GoodData Corporation
import cx from "classnames";
import React from "react";
import { FormattedMessage } from "react-intl";
import { removeAttributeFilter, useDashboardDispatch } from "../../model/index.js";
import { getDropZoneDebugStyle } from "./debug.js";
import { useDashboardDrop } from "./useDashboardDrop.js";

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

    const debugStyle = getDropZoneDebugStyle({ isOver });

    return (
        <div className={className} ref={dropRef} style={debugStyle}>
            <div className="gd-dropzone-message">
                <FormattedMessage id="addPanel.deleteItem" />
            </div>
        </div>
    );
}
