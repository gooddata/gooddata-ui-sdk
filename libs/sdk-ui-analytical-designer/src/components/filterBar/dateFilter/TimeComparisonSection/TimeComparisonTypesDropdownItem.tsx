// (C) 2007-2026 GoodData Corporation

import { type MouseEvent, useCallback } from "react";

import classNames from "classnames";
import { defineMessage, useIntl } from "react-intl";

import { type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

function getComparisonTypeDropdownMessageId(type: OverTimeComparisonType): string {
    switch (type) {
        case OverTimeComparisonTypes.NOTHING:
            return defineMessage({ id: "filter.compare.type.dropdown.nothing" }).id;
        case OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR:
            return defineMessage({ id: "filter.compare.type.dropdown.same_period_previous_year" }).id;
        case OverTimeComparisonTypes.PREVIOUS_PERIOD:
            return defineMessage({ id: "filter.compare.type.dropdown.previous_period" }).id;
        default:
            return `filter.compare.type.dropdown.${type}`;
    }
}

export interface ITypesDropdownItemProps {
    selected: OverTimeComparisonType;
    item?: OverTimeComparisonType;
    onClick?: (selectedType: OverTimeComparisonType) => void;
    isAllTimeDateFilter: boolean;
    isPoPAvailable: boolean;
}

export function TimeComparisonTypesDropdownItem({
    item = null,
    onClick = () => {},
    selected,
    isAllTimeDateFilter,
    isPoPAvailable,
}: ITypesDropdownItemProps) {
    const intl = useIntl();
    const isIncompatible = useCallback(() => {
        const disabledAllTime =
            isAllTimeDateFilter &&
            (item === OverTimeComparisonTypes.PREVIOUS_PERIOD ||
                item === OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR);

        return disabledAllTime || !isPoPAvailable;
    }, [item, isAllTimeDateFilter, isPoPAvailable]);

    const isSelected = useCallback(() => {
        return item === selected;
    }, [item, selected]);

    const isDisabled = useCallback(() => {
        return isIncompatible() && item !== OverTimeComparisonTypes.NOTHING;
    }, [item, isIncompatible]);

    const getBubbleText = useCallback(() => {
        return isPoPAvailable
            ? intl.formatMessage({
                  id: defineMessage({
                      id: "filter.compare.type.dropdown.disabled_for_all_time_period_tooltip",
                  }).id,
              })
            : intl.formatMessage({
                  id: defineMessage({ id: "filter.compare.type.dropdown.disabled_for_pop" }).id,
              });
    }, [intl, isPoPAvailable]);

    const handleClick = useCallback(
        (e: MouseEvent<HTMLElement>) => {
            e.preventDefault();
            const isResettable = item === OverTimeComparisonTypes.NOTHING;
            if (!isIncompatible() || isResettable) {
                onClick(item);
            }
        },
        [item, onClick, isIncompatible],
    );

    const renderDropdownItem = useCallback(() => {
        const className = classNames("gd-list-item", "s-list-item", "gd-list-item-shortened", `s-${item}`, {
            "is-selected": isSelected(),
            "is-disabled": isDisabled(),
        });
        const title = intl.formatMessage({ id: getComparisonTypeDropdownMessageId(item) });

        return (
            <div className={className} onClick={handleClick}>
                <span title={isDisabled() ? null : title}>{title}</span>
            </div>
        );
    }, [item, intl, isSelected, isDisabled, handleClick]);

    const renderDropdownItemWithBubble = useCallback(() => {
        return (
            <BubbleHoverTrigger>
                {renderDropdownItem()}
                <Bubble className="bubble-primary" alignPoints={[{ align: "tc bl" }]}>
                    {getBubbleText()}
                </Bubble>
            </BubbleHoverTrigger>
        );
    }, [renderDropdownItem, getBubbleText]);

    return isDisabled() ? renderDropdownItemWithBubble() : renderDropdownItem();
}
