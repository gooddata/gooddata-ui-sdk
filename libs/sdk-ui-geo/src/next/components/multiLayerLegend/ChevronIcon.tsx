// (C) 2025 GoodData Corporation

import { type ReactElement, memo } from "react";

import cx from "classnames";

import { UiIcon } from "@gooddata/sdk-ui-kit";

/**
 * Props for ChevronIcon component.
 *
 * @internal
 */
export interface IChevronIconProps {
    /**
     * Whether the chevron points down (expanded) or right (collapsed).
     */
    isExpanded?: boolean;

    /**
     * CSS class name.
     */
    className?: string;
}

/**
 * Chevron icon for expand/collapse indicators.
 *
 * @remarks
 * Uses UiIcon from sdk-ui-kit for the chevron.
 * Points down when expanded, right when collapsed.
 * Uses CSS transform for smooth rotation animation.
 *
 * @internal
 */
export const ChevronIcon = memo(function ChevronIcon({
    isExpanded = false,
    className,
}: IChevronIconProps): ReactElement {
    const iconClassName = cx("gd-geo-multi-layer-legend__chevron-icon", className, {
        "gd-geo-multi-layer-legend__chevron-icon--expanded": isExpanded,
    });

    return (
        <span className={iconClassName} aria-hidden="true">
            <UiIcon type="chevronRight" size={16} color="currentColor" />
        </span>
    );
});
