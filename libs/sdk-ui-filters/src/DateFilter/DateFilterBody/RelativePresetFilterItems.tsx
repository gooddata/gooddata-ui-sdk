// (C) 2019-2022 GoodData Corporation
import React from "react";
import kebabCase from "lodash/kebabCase.js";
import cx from "classnames";
import { DateFilterGranularity, IRelativeDateFilterPreset } from "@gooddata/sdk-model";

import { ListItem } from "../ListItem/ListItem.js";
import { ListHeading } from "../ListHeading/ListHeading.js";
import { RelativePresetTitleTranslated } from "../RelativePresetTitleTranslated/RelativePresetTitleTranslated.js";
import { DateFilterTextLocalized } from "../DateFilterTextLocalized/DateFilterTextLocalized.js";
import { DateFilterRelativeOptionGroup, DateFilterOption } from "../interfaces/index.js";

const granularityOrder: DateFilterGranularity[] = [
    "GDC.time.year",
    "GDC.time.quarter",
    "GDC.time.month",
    "GDC.time.week_us",
    "GDC.time.date",
    "GDC.time.hour",
    "GDC.time.minute",
];

/**
 * @internal
 */
export interface IRelativePresetFilterItemsProps {
    dateFormat: string;
    filterOption: DateFilterRelativeOptionGroup;
    selectedFilterOption: DateFilterOption;
    className?: string;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
}

/**
 * @internal
 */
export const RelativePresetFilterItems: React.FC<IRelativePresetFilterItemsProps> = ({
    dateFormat,
    filterOption,
    selectedFilterOption,
    onSelectedFilterOptionChange,
    className,
}) => {
    const relativePresets = granularityOrder
        .filter((granularity) => {
            return Boolean(filterOption?.[granularity]?.length > 0);
        })
        .map((granularity) => ({
            granularity,
            items: filterOption[granularity] as IRelativeDateFilterPreset[],
        }));

    return (
        <>
            {relativePresets.map((preset) => (
                <React.Fragment key={preset.granularity}>
                    <ListHeading className={className}>
                        <RelativePresetTitleTranslated granularity={preset.granularity} />
                    </ListHeading>
                    {preset.items.map((item) => (
                        <ListItem
                            key={item.localIdentifier}
                            isSelected={item.localIdentifier === selectedFilterOption.localIdentifier}
                            onClick={() => onSelectedFilterOptionChange(item)}
                            className={cx(`s-relative-preset-${kebabCase(item.localIdentifier)}`, className)}
                        >
                            <DateFilterTextLocalized filter={item} dateFormat={dateFormat} />
                        </ListItem>
                    ))}
                </React.Fragment>
            ))}
        </>
    );
};
