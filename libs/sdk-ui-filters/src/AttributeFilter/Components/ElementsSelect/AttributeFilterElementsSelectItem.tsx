// (C) 2007-2025 GoodData Corporation
import { FocusEvent, KeyboardEvent, MouseEvent, useCallback, useRef } from "react";
import cx from "classnames";
import camelCase from "lodash/camelCase.js";
import { FormattedMessage, useIntl } from "react-intl";
import { getElementPrimaryTitle, getElementTitle } from "../../utils.js";
import { IAttributeFilterElementsSelectItemProps } from "./types.js";
import { Bubble, BubbleHoverTrigger, IAlignPoint, isSpaceKey } from "@gooddata/sdk-ui-kit";
import { AttributeFilterElementsSelectItemTooltip } from "./AttributeFilterElementsSelectItemTooltip.js";

const ALIGN_POINTS: IAlignPoint[] = [{ align: "bl tc", offset: { x: 7, y: 0 } }];

/**
 * This component represents the Attribute Filter element.
 * It displays a checkbox to add/remove to/from selection.
 * It allows users to add only this item to selection.
 * It also displays a localized empty element label in case element value is empty.
 *
 * @beta
 */
export function AttributeFilterElementsSelectItem({
    item,
    isSelected,
    focusedAction,
    onSelect,
    onSelectOnly,
    onDeselect,
    primaryLabelTitle,
}: IAttributeFilterElementsSelectItemProps) {
    const intl = useIntl();
    const itemRef = useRef<HTMLDivElement>(null);

    const onItemClick = useCallback(() => {
        if (isSelected) {
            onDeselect();
        } else {
            onSelect();
        }
    }, [onSelect, onDeselect, isSelected]);

    const onOnlyItemClick = useCallback(
        (event: MouseEvent) => {
            event.stopPropagation();
            onSelectOnly();
        },
        [onSelectOnly],
    );

    const onFocus = (event: FocusEvent<HTMLDivElement>) => {
        // Prevent focus from moving from item inside to the checkbox
        if (event.target.tagName === "INPUT") {
            event.preventDefault();
            itemRef.current?.focus(); // Keep focus on the item
        }
    };

    const classes = cx(
        "gd-attribute-filter-elements-select-item__next",
        "gd-list-item",
        "has-only-visible",
        "s-attribute-filter-list-item",
        `s-attribute-filter-list-item-${camelCase(item.title)}`,
        `s-attribute-filter-list-item-${camelCase(item.title)}-${camelCase(item.uri)}`,
        { "is-selected": isSelected },
        {
            "s-attribute-filter-list-item-selected": isSelected,
        },
        {
            "gd-attribute-filter-list-empty-item": !item.title,
        },
        {
            "gd-attribute-filter-list-item--isFocused": !!focusedAction,
            "gd-attribute-filter-list-item--isFocusedSelectItem": focusedAction === "selectItem",
        },
    );

    const labelClasses = cx("input-checkbox-label", {
        "gd-empty-value-label": !item.title,
    });

    const itemTitle = getElementTitle(item, intl);
    const itemPrimaryTitle = getElementPrimaryTitle(item);

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (isSpaceKey(event)) {
            event.preventDefault(); // Prevent scrolling on Space
            onItemClick();
        }
    };

    return (
        <div
            ref={itemRef}
            className={classes}
            onClick={onItemClick}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            role="option"
            aria-selected={isSelected}
        >
            <label className={labelClasses}>
                <input
                    tabIndex={-1}
                    type="checkbox"
                    className="input-checkbox"
                    readOnly
                    checked={isSelected}
                />
                <span className="input-label-text">{itemTitle}</span>
            </label>
            {!item.title && (
                <div className="gd-empty-list-item-tooltip-wrapper">
                    <BubbleHoverTrigger className="gd-empty-list-item-tooltip" showDelay={0} hideDelay={0}>
                        <span className="gd-icon-circle-question gd-empty-value-tooltip-icon" />
                        <Bubble
                            className="bubble-primary gd-empty-item-bubble"
                            alignTo=".gd-empty-value-tooltip-icon"
                            alignPoints={ALIGN_POINTS}
                        >
                            <FormattedMessage id="attributesDropdown.empty.item.tooltip" />
                        </Bubble>
                    </BubbleHoverTrigger>
                </div>
            )}
            <span
                className={cx("gd-list-item-only", {
                    "gd-list-item-only--isFocusedSelectItem": focusedAction === "only",
                })}
                onClick={onOnlyItemClick}
            >
                <FormattedMessage id="gs.list.only" />
            </span>
            <AttributeFilterElementsSelectItemTooltip
                itemTitle={itemTitle}
                primaryLabelTitle={primaryLabelTitle}
                itemPrimaryTitle={itemPrimaryTitle}
                isFocused={focusedAction === "questionMark"}
            />
        </div>
    );
}
