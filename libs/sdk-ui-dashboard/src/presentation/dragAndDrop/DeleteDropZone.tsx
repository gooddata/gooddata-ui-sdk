// (C) 2022-2026 GoodData Corporation

import { type Ref } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { getDropZoneDebugStyle } from "./debug.js";
import { useFilterDeleteDrop } from "./useFilterDeleteDrop.js";

export function DeleteDropZone() {
    const [{ canDrop, isOver }, dropRef] = useFilterDeleteDrop();

    if (!canDrop) {
        return null;
    }

    const className = cx("gd-dropzone", "gd-dropzone-delete", {
        "gd-dropzone-over": isOver,
    });

    const debugStyle = getDropZoneDebugStyle({ isOver });

    return (
        <div
            className={className}
            ref={dropRef as unknown as Ref<HTMLDivElement> | undefined}
            style={debugStyle}
        >
            <div className="gd-dropzone-message">
                <FormattedMessage id="addPanel.deleteItem" />
            </div>
        </div>
    );
}
