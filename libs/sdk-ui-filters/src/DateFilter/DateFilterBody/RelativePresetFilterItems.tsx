// (C) 2019-2026 GoodData Corporation

import { Fragment } from "react";

import cx from "classnames";
import { kebabCase } from "lodash-es";

import {
    type DateFilterGranularity,
    type IRelativeDateFilterPreset,
    getDateFilterGranularities,
} from "@gooddata/sdk-model";
import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { DateFilterTextLocalized } from "../DateFilterTextLocalized/DateFilterTextLocalized.js";
import { type DateFilterOption, type DateFilterRelativeOptionGroup } from "../interfaces/index.js";
import { ListHeading } from "../ListHeading/ListHeading.js";
import { ListItem } from "../ListItem/ListItem.js";
import { RelativePresetTitleTranslated } from "../RelativePresetTitleTranslated/RelativePresetTitleTranslated.js";

// Canonical coarse→fine order from the registry (fiscal ranked next to its standard sibling).
const granularityOrder = getDateFilterGranularities({
    calendars: [{ type: "standard" }, { type: "fiscal" }],
});

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

interface IPresetItemsGroupProps {
    granularity: DateFilterGranularity;
    items: IRelativeDateFilterPreset[];
    dateFormat: string;
    selectedFilterOption: DateFilterOption;
    className?: string;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
}

function PresetItemsGroup({
    granularity,
    items,
    dateFormat,
    selectedFilterOption,
    className,
    onSelectedFilterOptionChange,
}: IPresetItemsGroupProps) {
    const groupClassNames = cx("gd-list-items-group");

    const titleId = useIdPrefixed("group-title");

    return (
        <ul role="group" className={groupClassNames} aria-labelledby={titleId}>
            <ListHeading className={className} id={titleId}>
                <RelativePresetTitleTranslated granularity={granularity} />
            </ListHeading>
            {items.map((item) => (
                <ListItem
                    key={item.localIdentifier}
                    isSelected={item.localIdentifier === selectedFilterOption.localIdentifier}
                    onClick={() => onSelectedFilterOptionChange(item)}
                    className={cx(`s-relative-preset-${kebabCase(item.localIdentifier)}`, className)}
                >
                    <DateFilterTextLocalized filter={item} dateFormat={dateFormat} />
                </ListItem>
            ))}
        </ul>
    );
}

/**
 * @internal
 */
export function RelativePresetFilterItems({
    dateFormat,
    filterOption,
    selectedFilterOption,
    onSelectedFilterOptionChange,
    className,
}: IRelativePresetFilterItemsProps) {
    const relativePresets = granularityOrder
        .filter((granularity) => {
            const presets = filterOption?.[granularity];
            return Boolean(presets && presets.length > 0);
        })
        .map((granularity) => ({
            granularity,
            items: filterOption?.[granularity] as IRelativeDateFilterPreset[],
        }));

    return (
        <>
            {relativePresets.map((preset) => (
                <Fragment key={preset.granularity}>
                    <PresetItemsGroup
                        granularity={preset.granularity}
                        items={preset.items}
                        dateFormat={dateFormat}
                        selectedFilterOption={selectedFilterOption}
                        className={className}
                        onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                    />
                </Fragment>
            ))}
        </>
    );
}
