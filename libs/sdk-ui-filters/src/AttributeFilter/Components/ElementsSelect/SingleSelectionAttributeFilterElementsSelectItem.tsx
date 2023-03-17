// (C) 2023 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import cx from "classnames";
import { IAttributeFilterElementsSelectItemProps } from "./types";
import { CustomizableCheckmark, useMediaQuery } from "@gooddata/sdk-ui-kit";
import { getElementTitle } from "../../utils";
import { useIntl } from "react-intl";

/**
 * Renders elements selection list item as a single select list item.
 *
 * @beta
 */
export const SingleSelectionAttributeFilterElementsSelectItem: React.VFC<
    IAttributeFilterElementsSelectItemProps
> = (props) => {
    const { item, onSelectOnly, isSelected, fullscreenOnMobile = false } = props;
    const intl = useIntl();

    // Modify item click behavior to select only this particular item.
    const onItemClick = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation();
            onSelectOnly();
        },
        [onSelectOnly],
    );

    const itemTitle = useMemo(() => getElementTitle(item, intl), [item, intl]);

    const isMobile = useMediaQuery("mobileDevice");

    return (
        <div
            className={cx("gd-single-selection-attribute-filter-elements-select-item", "gd-list-item", {
                "is-selected": isSelected,
            })}
            onClick={onItemClick}
            title={itemTitle}
        >
            {itemTitle}
            {isSelected && isMobile && fullscreenOnMobile ? (
                <CustomizableCheckmark className="gd-customizable-checkmark-mobile-navigation" />
            ) : null}
        </div>
    );
};
