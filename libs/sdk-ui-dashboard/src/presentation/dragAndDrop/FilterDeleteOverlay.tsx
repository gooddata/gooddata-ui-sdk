// (C) 2026 GoodData Corporation

import { type Ref } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { getDropZoneDebugStyle } from "./debug.js";
import { useFilterDeleteDrop } from "./useFilterDeleteDrop.js";

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
    const [{ canDrop, isOver }, dropRef] = useFilterDeleteDrop();

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
