// (C) 2023-2025 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import cx from "classnames";
import camelCase from "lodash/camelCase.js";
import { IAttributeFilterElementsSelectItemProps } from "./types.js";
import { CustomizableCheckmark, useMediaQuery, isActionKey } from "@gooddata/sdk-ui-kit";
import { getElementPrimaryTitle, getElementTitle } from "../../utils.js";
import { useIntl } from "react-intl";
import { AttributeFilterElementsSelectItemTooltip } from "./AttributeFilterElementsSelectItemTooltip.js";

/**
 * Renders elements selection list item as a single select list item.
 *
 * @beta
 */
export const SingleSelectionAttributeFilterElementsSelectItem: React.VFC<
    IAttributeFilterElementsSelectItemProps
> = (props) => {
    const { item, onSelectOnly, isSelected, fullscreenOnMobile = false, primaryLabelTitle } = props;
    const intl = useIntl();

    // Modify item click behavior to select only this particular item.
    const onItemClick = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation();
            onSelectOnly();
        },
        [onSelectOnly],
    );

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (isActionKey(event)) {
            event.preventDefault(); // Prevent scrolling on Space
            onSelectOnly();
        }
    };

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
    );

    return (
        <div
            className={classes}
            onClick={onItemClick}
            onKeyDown={onKeyDown}
            tabIndex={0}
            role="option"
            aria-selected={isSelected}
        >
            <span>{itemTitle}</span>
            {isSelected && isMobile && fullscreenOnMobile ? (
                <span className="gd-customizable-checkmark-mobile-navigation-wrapper">
                    <CustomizableCheckmark className="gd-customizable-checkmark-mobile-navigation" />
                </span>
            ) : null}
            <AttributeFilterElementsSelectItemTooltip
                itemTitle={itemTitle}
                primaryLabelTitle={primaryLabelTitle}
                itemPrimaryTitle={itemPrimaryTitle}
            />
        </div>
    );
};
