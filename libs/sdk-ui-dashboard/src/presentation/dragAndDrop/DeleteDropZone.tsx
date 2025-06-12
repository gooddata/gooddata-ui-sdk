// (C) 2022 GoodData Corporation
import cx from "classnames";
import React from "react";
import { FormattedMessage } from "react-intl";
import { removeAttributeFilter, removeDateFilter, useDashboardDispatch } from "../../model/index.js";
import { getDropZoneDebugStyle } from "./debug.js";
import { useDashboardDrop } from "./useDashboardDrop.js";
import { isDashboardAttributeFilter } from "@gooddata/sdk-model";

export function DeleteDropZone() {
    const dispatch = useDashboardDispatch();
    const [{ canDrop, isOver }, dropRef] = useDashboardDrop(
        ["attributeFilter", "dateFilter"],
        {
            drop: ({ filter }) => {
                if (isDashboardAttributeFilter(filter)) {
                    const identifier = filter.attributeFilter.localIdentifier!;
                    dispatch(removeAttributeFilter(identifier));
                } else {
                    const dataSet = filter.dateFilter.dataSet!;
                    dispatch(removeDateFilter(dataSet));
                }
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
