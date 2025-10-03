// (C) 2023-2025 GoodData Corporation

import { MouseEvent, useCallback, useMemo } from "react";

import cx from "classnames";
import { camelCase } from "lodash-es";
import { useIntl } from "react-intl";

import {
    CustomizableCheckmark,
    ListWithActionsFocusStore,
    SELECT_ITEM_ACTION,
    useMediaQuery,
} from "@gooddata/sdk-ui-kit";

import { AttributeFilterElementsSelectItemTooltip } from "./AttributeFilterElementsSelectItemTooltip.js";
import { IAttributeFilterElementsSelectItemProps } from "./types.js";
import { getElementPrimaryTitle, getElementTitle } from "../../utils.js";

/**
 * Renders elements selection list item as a single select list item.
 *
 * @beta
 */
export function SingleSelectionAttributeFilterElementsSelectItem({
    item,
    onSelectOnly,
    isSelected,
    focusedAction,
    fullscreenOnMobile = false,
    primaryLabelTitle,
    itemsCount,
    index,
}: IAttributeFilterElementsSelectItemProps) {
    const intl = useIntl();

    // Modify item click behavior to select only this particular item.
    const onItemClick = useCallback(
        (event: MouseEvent) => {
            event.stopPropagation();
            onSelectOnly();
        },
        [onSelectOnly],
    );

    const itemTitle = useMemo(() => getElementTitle(item, intl), [item, intl]);
    const itemPrimaryTitle = getElementPrimaryTitle(item);

    const isMobile = useMediaQuery("mobileDevice");

    const classes = cx(
        "gd-single-selection-attribute-filter-elements-select-item",
        "gd-list-item",
        "has-only-visible",
        "s-attribute-filter-list-item",
        `s-attribute-filter-list-item-${camelCase(item.title)}`,
        { "is-selected": isSelected },
        {
            "s-attribute-filter-list-item-selected": isSelected,
        },
        {
            "gd-attribute-filter-list-item--isFocused": !!focusedAction,
            "gd-attribute-filter-single-selection-list-item--isFocusedSelectItem":
                focusedAction === "selectItem",
        },
    );

    const makeId = ListWithActionsFocusStore.useContextStoreOptional((ctx) => ctx.makeId);

    return (
        <div
            className={classes}
            onClick={onItemClick}
            role="row"
            aria-selected={isSelected}
            aria-setsize={itemsCount}
            aria-posinset={index}
        >
            <div
                className="gd-attribute-filter-list-item-label "
                role={"gridcell"}
                tabIndex={focusedAction === "selectItem" ? 0 : -1}
                id={makeId?.({ item, action: SELECT_ITEM_ACTION })}
                {...(isSelected
                    ? {
                          "aria-label": intl.formatMessage({ id: "attributesDropdown.selected" }),
                      }
                    : {})}
                aria-selected={isSelected}
            >
                <span>{itemTitle}</span>
                {isSelected && isMobile && fullscreenOnMobile ? (
                    <span className="gd-customizable-checkmark-mobile-navigation-wrapper">
                        <CustomizableCheckmark className="gd-customizable-checkmark-mobile-navigation" />
                    </span>
                ) : null}
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
