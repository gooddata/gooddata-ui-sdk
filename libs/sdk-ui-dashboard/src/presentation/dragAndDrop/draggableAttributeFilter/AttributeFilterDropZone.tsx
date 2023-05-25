// (C) 2021-2022 GoodData Corporation

import React from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger, Icon } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { useDashboardDrop } from "../useDashboardDrop.js";
import { useDashboardSelector, selectIsInEditMode } from "../../../model/index.js";
import { getDropZoneDebugStyle } from "../debug.js";

export type AttributeFilterDropZoneProps = {
    targetIndex: number;
    onDrop: (targetIndex: number) => void;
};

export function AttributeFilterDropZone({ targetIndex, onDrop }: AttributeFilterDropZoneProps) {
    const theme = useTheme();
    const isEditMode = useDashboardSelector(selectIsInEditMode);

    const [{ canDrop, isOver, itemType }, dropRef] = useDashboardDrop(
        ["attributeFilter", "attributeFilter-placeholder"],
        {
            drop: () => onDrop(targetIndex),
        },
        [targetIndex],
    );

    const isDraggingAttribute = itemType !== undefined && itemType === "attributeFilter";

    if (!isEditMode || isDraggingAttribute) {
        return null;
    }

    const isActive = canDrop || isOver;

    const dropzoneClassNames = cx(
        "attr-filter-dropzone-box",
        "s-last-filter-drop-position",
        "s-attr-filter-dropzone-box",
        { "attr-filter-dropzone-box-active": isActive },
        { "attr-filter-dropzone-box-over": isOver },
    );

    const debugStyle = getDropZoneDebugStyle({ isOver });

    return (
        <div className="attr-filter-dropzone-box-outer" style={debugStyle} ref={dropRef}>
            {isActive ? (
                <div className={dropzoneClassNames}>
                    <div className="attr-filter-dropzone-box-inner">
                        <FormattedMessage id="filterBar.filter.drop" />
                    </div>
                </div>
            ) : (
                <BubbleHoverTrigger>
                    <div className={dropzoneClassNames}>
                        <div className="attr-filter-dropzone-box-inner">
                            <FormattedMessage
                                id="filterBar.filter.addFilterPlaceholder"
                                values={{
                                    icon: (
                                        <Icon.AttributeFilter
                                            className="attribute-filter-icon"
                                            width={14}
                                            height={14}
                                            color={theme?.palette?.complementary?.c6}
                                        />
                                    ),
                                }}
                            />
                        </div>
                    </div>
                    <Bubble alignPoints={[{ align: "bc tc", offset: { x: 0, y: 0 } }]}>
                        <FormattedMessage id="filterBar.filter.dropzone.tooltip" />
                    </Bubble>
                </BubbleHoverTrigger>
            )}
        </div>
    );
}
