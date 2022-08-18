// (C) 2007-2022 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import camelCase from "lodash/camelCase";
import { FormattedMessage, useIntl } from "react-intl";
import { getElementTitle } from "../../utils";
import { IAttributeFilterElementsSelectItemProps } from "./types";

/**
 * @internal
 */
export const AttributeFilterElementsSelectItem: React.VFC<IAttributeFilterElementsSelectItemProps> = (
    props,
) => {
    const { item, isSelected, onSelect, onSelectOnly, onDeselect } = props;
    const intl = useIntl();

    const onItemClick = useCallback(() => {
        if (isSelected) {
            onDeselect();
        } else {
            onSelect();
        }
    }, [onSelect, onDeselect, isSelected]);

    const onOnlyItemClick = useCallback(
        (event: React.MouseEvent) => {
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
        { "is-selected": isSelected },
        {
            "s-attribute-filter-list-item-selected": isSelected,
        },
    );

    return (
        <div className={classes} onClick={onItemClick}>
            <label className="input-checkbox-label">
                <input type="checkbox" className="input-checkbox" readOnly checked={isSelected} />
                <span className="input-label-text">{getElementTitle(item, intl)}</span>
            </label>
            <span className="gd-list-item-only" onClick={onOnlyItemClick}>
                <FormattedMessage id="gs.list.only" />
            </span>
        </div>
    );
};
