// (C) 2026 GoodData Corporation

import { type Ref } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import {
    dashboardAttributeFilterItemLocalIdentifier,
    isDashboardAttributeFilterItem,
    isDashboardDateFilter,
} from "@gooddata/sdk-model";

import { removeAttributeFilter, removeDateFilter } from "../../model/commands/filters.js";
import { useDashboardDispatch } from "../../model/react/DashboardStoreProvider.js";
import { getDropZoneDebugStyle } from "./debug.js";
import { useDashboardDrop } from "./useDashboardDrop.js";

/**
 * Full-screen overlay that appears over the dashboard canvas when a filter
 * is being dragged. Dropping a filter onto this overlay removes it.
 *
 * Used in the enhanced insight picker mode (floating toolbar) where the
 * sidebar delete drop zone is not available.
 *
 * @internal
 */
export function FilterDeleteOverlay() {
    const dispatch = useDashboardDispatch();
    const [{ canDrop, isOver }, dropRef] = useDashboardDrop(
        ["attributeFilter", "dateFilter"],
        {
            drop: ({ filter }) => {
                if (isDashboardAttributeFilterItem(filter)) {
                    const identifier = dashboardAttributeFilterItemLocalIdentifier(filter)!;
                    dispatch(removeAttributeFilter(identifier));
                } else if (isDashboardDateFilter(filter)) {
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

    const debugStyle = getDropZoneDebugStyle({ isOver });

    return (
        <div
            className={cx("gd-dropzone", "gd-dropzone-delete", "gd-filter-delete-overlay", {
                "gd-dropzone-over": isOver,
            })}
            ref={dropRef as unknown as Ref<HTMLDivElement>}
            style={debugStyle}
        >
            <div className="gd-dropzone-message">
                <FormattedMessage id="addPanel.deleteItem" />
            </div>
        </div>
    );
}
