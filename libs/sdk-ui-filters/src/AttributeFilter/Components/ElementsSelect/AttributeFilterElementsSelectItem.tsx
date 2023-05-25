// (C) 2007-2022 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import camelCase from "lodash/camelCase.js";
import { FormattedMessage, useIntl } from "react-intl";
import { getElementTitle } from "../../utils.js";
import { IAttributeFilterElementsSelectItemProps } from "./types.js";
import { Bubble, BubbleHoverTrigger, IAlignPoint } from "@gooddata/sdk-ui-kit";

const ALIGN_POINTS: IAlignPoint[] = [{ align: "bl tc", offset: { x: 7, y: 0 } }];

/**
 * This component represents the Attribute Filter element.
 * It displays a checkbox to add/remove to/from selection.
 * It allows users to add only this item to selection.
 * It also displays a localized empty element label in case element value is empty.
 *
 * @beta
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
        {
            "gd-attribute-filter-list-empty-item": !item.title,
        },
    );

    const labelClasses = cx("input-checkbox-label", {
        "gd-empty-value-label": !item.title,
    });

    const itemTitle = getElementTitle(item, intl);

    return (
        <div className={classes} onClick={onItemClick} title={itemTitle}>
            <label className={labelClasses}>
                <input type="checkbox" className="input-checkbox" readOnly checked={isSelected} />
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
            <span className="gd-list-item-only" onClick={onOnlyItemClick}>
                <FormattedMessage id="gs.list.only" />
            </span>
        </div>
    );
};
