// (C) 2019 GoodData Corporation
import * as React from "react";
import kebabCase = require("lodash/kebabCase");
import cx from "classnames";
import { ListItem } from "../ListItem/ListItem";
import { ListHeading } from "../ListHeading/ListHeading";
import { RelativePresetTitleTranslated } from "../RelativePresetTitleTranslated/RelativePresetTitleTranslated";
import { DateFilterTextLocalized } from "../DateFilterTextLocalized/DateFilterTextLocalized";
import { DateFilterRelativeOptionGroup, DateFilterOption } from "../interfaces";
import { IRelativeDateFilterPreset, DateFilterGranularity } from "@gooddata/sdk-backend-spi";

const granularityOrder: DateFilterGranularity[] = [
    "GDC.time.date",
    "GDC.time.week_us",
    "GDC.time.month",
    "GDC.time.quarter",
    "GDC.time.year",
];

export const RelativePresetFilterItems: React.FC<{
    filterOption: DateFilterRelativeOptionGroup;
    selectedFilterOption: DateFilterOption;
    className?: string;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
}> = ({ filterOption, selectedFilterOption, onSelectedFilterOptionChange, className }) => {
    const relativePresets = granularityOrder
        .filter((granularity) =>
            Boolean(filterOption && filterOption[granularity] && filterOption[granularity].length > 0),
        )
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
                            // tslint:disable-next-line:jsx-no-lambda
                            onClick={() => onSelectedFilterOptionChange(item)}
                            className={cx(`s-relative-preset-${kebabCase(item.localIdentifier)}`, className)}
                        >
                            <DateFilterTextLocalized filter={item} />
                        </ListItem>
                    ))}
                </React.Fragment>
            ))}
        </>
    );
};
