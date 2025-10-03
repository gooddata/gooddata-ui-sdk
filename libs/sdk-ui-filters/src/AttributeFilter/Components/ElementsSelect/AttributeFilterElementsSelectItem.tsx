// (C) 2007-2025 GoodData Corporation

import { MouseEvent, useCallback } from "react";

import cx from "classnames";
import { camelCase } from "lodash-es";
import { FormattedMessage, useIntl } from "react-intl";

import {
    Bubble,
    BubbleHoverTrigger,
    IAlignPoint,
    ListWithActionsFocusStore,
    SELECT_ITEM_ACTION,
    UiLink,
} from "@gooddata/sdk-ui-kit";

import { AttributeFilterElementsSelectItemTooltip } from "./AttributeFilterElementsSelectItemTooltip.js";
import { IAttributeFilterElementsSelectItemProps } from "./types.js";
import { getElementPrimaryTitle, getElementTitle } from "../../utils.js";

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
    index,
}: IAttributeFilterElementsSelectItemProps) {
    const intl = useIntl();

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

    const makeId = ListWithActionsFocusStore.useContextStoreOptional((ctx) => ctx.makeId);

    return (
        <div
            className={classes}
            onClick={onItemClick}
            role="row"
            tabIndex={-1}
            aria-rowindex={index}
            aria-label={itemTitle}
        >
            <div role={"gridcell"} className="gd-attribute-filter-list-item-label">
                <label className={labelClasses}>
                    <input
                        tabIndex={focusedAction === "selectItem" ? 0 : -1}
                        id={makeId?.({ item, action: SELECT_ITEM_ACTION })}
                        type="checkbox"
                        className="input-checkbox"
                        readOnly
                        checked={isSelected}
                    />
                    <span className="input-label-text">{itemTitle}</span>
                </label>
            </div>
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
            <div
                className={cx("gd-list-item-only", {
                    "gd-list-item-only--isFocusedSelectItem": focusedAction === "only",
                })}
                role={"gridcell"}
            >
                <UiLink
                    onClick={onOnlyItemClick}
                    id={makeId?.({ item, action: "only" })}
                    variant={"primary"}
                    flipUnderline
                    role={"button"}
                    aria-label={intl.formatMessage({ id: "attributesDropdown.onlyLabel" }, { itemTitle })}
                    tabIndex={focusedAction === "only" ? 0 : -1}
                >
                    <FormattedMessage id="gs.list.only" />
                </UiLink>
            </div>
            <AttributeFilterElementsSelectItemTooltip
                primaryLabelTitle={primaryLabelTitle}
                itemPrimaryTitle={itemPrimaryTitle}
                isFocused={focusedAction === "questionMark"}
                id={makeId?.({ item, action: "questionMark" })}
            />
        </div>
    );
}
