// (C) 2021-2025 GoodData Corporation

import { Ref } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger, Icon } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { messages } from "../../../locales.js";
import {
    selectEnableMultipleDateFilters,
    selectIsInEditMode,
    selectSupportsMultipleDateFilters,
    useDashboardSelector,
} from "../../../model/index.js";
import { getDropZoneDebugStyle } from "../debug.js";
import { useDashboardDrop } from "../useDashboardDrop.js";

const { AttributeFilter: AttributeFilterIcon } = Icon;

export type DraggableFilterDropZoneProps = {
    targetIndex: number;
    onDrop: (targetIndex: number) => void;
};

export function DraggableFilterDropZone({ targetIndex, onDrop }: DraggableFilterDropZoneProps) {
    const theme = useTheme();
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const enableMultipleDateFilters = useDashboardSelector(selectEnableMultipleDateFilters);
    const supportsMultipleDateFilters = useDashboardSelector(selectSupportsMultipleDateFilters);

    const [{ canDrop, isOver, itemType }, dropRef] = useDashboardDrop(
        ["attributeFilter-placeholder"],
        {
            drop: () => onDrop(targetIndex),
        },
        [targetIndex],
    );

    const isDraggingExistingFilter =
        itemType !== undefined && (itemType === "attributeFilter" || itemType === "dateFilter");

    if (!isEditMode || isDraggingExistingFilter) {
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
    const tooltip =
        enableMultipleDateFilters && supportsMultipleDateFilters
            ? messages.filterDropzoneTooltipGeneric
            : messages.filterDropzoneTooltip;

    return (
        <div
            className="attr-filter-dropzone-box-outer"
            style={debugStyle}
            ref={dropRef as unknown as Ref<HTMLDivElement> | undefined}
        >
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
                                        <AttributeFilterIcon
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
                        <FormattedMessage id={tooltip.id} />
                    </Bubble>
                </BubbleHoverTrigger>
            )}
        </div>
    );
}
